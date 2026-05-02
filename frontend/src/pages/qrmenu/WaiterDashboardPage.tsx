import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderApi, restaurantApi } from '@/services/qrmenuApi';
import type { Order, Restaurant } from '@/types/qrmenu';
import logging from 'loglevel';

const log = logging.getLogger('WaiterDashboard');

/* ═══════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════ */

type OrderStatus = Order['status'];
type FilterTab = 'all' | 'placed' | 'preparing' | 'ready';

interface WebSocketMessage {
  type: 'order_new' | 'order_updated' | 'order_cancelled';
  order: Order;
}

const FILTER_TABS: { key: FilterTab; label: string; icon: string }[] = [
  { key: 'all', label: 'All Active', icon: '📋' },
  { key: 'placed', label: 'Placed', icon: '🔔' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '✅' },
];

const STATUS_CONFIG: Record<OrderStatus, {
  border: string;
  badge: string;
  badgeText: string;
  label: string;
  nextStatus: OrderStatus | null;
  nextLabel: string | null;
}> = {
  placed: {
    border: 'border-amber-400 dark:border-amber-500',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    badgeText: 'Placed',
    label: 'New Order',
    nextStatus: 'preparing',
    nextLabel: 'Start Preparing',
  },
  preparing: {
    border: 'border-blue-400 dark:border-blue-500',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    badgeText: 'Preparing',
    label: 'In Kitchen',
    nextStatus: 'ready',
    nextLabel: 'Mark Ready',
  },
  ready: {
    border: 'border-emerald-400 dark:border-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    badgeText: 'Ready',
    label: 'Ready to Serve',
    nextStatus: 'served',
    nextLabel: 'Mark Served',
  },
  served: {
    border: 'border-gray-300 dark:border-gray-600',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',
    badgeText: 'Served',
    label: 'Completed',
    nextStatus: null,
    nextLabel: null,
  },
  cancelled: {
    border: 'border-red-300 dark:border-red-600',
    badge: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    badgeText: 'Cancelled',
    label: 'Cancelled',
    nextStatus: null,
    nextLabel: null,
  },
};

const NEXT_BUTTON_STYLE: Record<string, string> = {
  preparing: 'bg-blue-600 hover:bg-blue-700 text-white',
  ready: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  served: 'bg-gray-600 hover:bg-gray-700 text-white',
};

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '--';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function playBeep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'sine';
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    }, 150);
  } catch {
    log.warn('Web Audio API not available');
  }
}

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */

export function WaiterDashboardPage() {
  /* --- State --- */
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [showServed, setShowServed] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTimeTick] = useState(0);
  const orderIdsRef = useRef<Set<number>>(new Set());

  /* --- Load restaurants --- */
  useEffect(() => {
    restaurantApi.list()
      .then((list) => {
        setRestaurants(list);
        if (list.length > 0) setSelectedRestaurantId(list[0].id);
      })
      .catch((err: unknown) => log.error('Failed to load restaurants', err));
  }, []);

  /* --- Fetch orders --- */
  const fetchOrders = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const data = await orderApi.listActive(selectedRestaurantId);
      setOrders((prev) => {
        const prevIds = new Set(prev.map((o) => o.id));
        const hasNew = data.some((o) => !prevIds.has(o.id));
        if (hasNew && prev.length > 0) playBeep();
        orderIdsRef.current = new Set(data.map((o) => o.id));
        return data;
      });
    } catch (err: unknown) {
      log.error('Failed to fetch orders', err);
    }
  }, [selectedRestaurantId]);

  /* --- Initial load + polling fallback --- */
  useEffect(() => {
    if (!selectedRestaurantId) return;

    setLoading(true);
    fetchOrders().finally(() => setLoading(false));

    // Polling fallback (activates when WS is down)
    pollRef.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        fetchOrders();
      }
    }, 10_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedRestaurantId, fetchOrders]);

  /* --- Time ticker (update "X min ago" every 30s) --- */
  useEffect(() => {
    timeTickRef.current = setInterval(() => setTimeTick((t) => t + 1), 30_000);
    return () => {
      if (timeTickRef.current) clearInterval(timeTickRef.current);
    };
  }, []);

  /* --- WebSocket --- */
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const wsUrl = `ws://localhost:8000/ws/restaurant/${selectedRestaurantId}`;
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        log.info('WebSocket connected');
        setWsConnected(true);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const msg: WebSocketMessage = JSON.parse(String(event.data));
          if (msg.type === 'order_new') {
            setOrders((prev) => {
              if (prev.some((o) => o.id === msg.order.id)) return prev;
              playBeep();
              return [msg.order, ...prev];
            });
          } else if (msg.type === 'order_updated') {
            setOrders((prev) =>
              prev.map((o) => (o.id === msg.order.id ? msg.order : o))
            );
          } else if (msg.type === 'order_cancelled') {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === msg.order.id ? { ...o, status: 'cancelled' as const } : o
              )
            );
          }
        } catch (err: unknown) {
          log.warn('WS message parse error', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        log.info('WebSocket disconnected, reconnecting in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
        ws.close();
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, [selectedRestaurantId]);

  /* --- Update order status --- */
  const handleStatusUpdate = useCallback(async (orderId: number, newStatus: string) => {
    setUpdatingIds((prev) => new Set(prev).add(orderId));
    try {
      const updated = await orderApi.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: unknown) {
      log.error('Failed to update status', err);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }, []);

  /* --- Filtered & sorted orders --- */
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'served' && o.status !== 'cancelled'),
    [orders],
  );

  const servedOrders = useMemo(
    () => orders.filter((o) => o.status === 'served'),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const source = filter === 'all' ? activeOrders : activeOrders.filter((o) => o.status === filter);
    // Sort: placed first (newest), then preparing, then ready
    const priority: Record<string, number> = { placed: 0, preparing: 1, ready: 2 };
    return [...source].sort((a, b) => {
      const pa = priority[a.status] ?? 9;
      const pb = priority[b.status] ?? 9;
      if (pa !== pb) return pa - pb;
      return new Date(b.placed_at ?? 0).getTime() - new Date(a.placed_at ?? 0).getTime();
    });
  }, [activeOrders, filter]);

  /* --- Stats --- */
  const stats = useMemo(() => ({
    total: activeOrders.length,
    placed: activeOrders.filter((o) => o.status === 'placed').length,
    preparing: activeOrders.filter((o) => o.status === 'preparing').length,
    ready: activeOrders.filter((o) => o.status === 'ready').length,
  }), [activeOrders]);

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Title + Restaurant Selector */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                W
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Waiter Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time order management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* WS Indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    wsConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-red-400'
                  }`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {wsConnected ? 'Live' : 'Polling'}
                </span>
              </div>

              {/* Restaurant Selector */}
              <select
                value={selectedRestaurantId ?? ''}
                onChange={(e) => {
                  setSelectedRestaurantId(Number(e.target.value));
                  setOrders([]);
                }}
                className="text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 mt-4 space-y-4">
        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Active Orders" value={stats.total} color="text-gray-900 dark:text-white" bg="bg-white dark:bg-gray-900" />
          <StatCard label="Pending" value={stats.placed} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10" />
          <StatCard label="Preparing" value={stats.preparing} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10" />
          <StatCard label="Ready" value={stats.ready} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10" />
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.key;
            const count = tab.key === 'all'
              ? stats.total
              : stats[tab.key as keyof typeof stats] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 dark:bg-gray-900/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && filteredOrders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No active orders
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedRestaurant
                ? `Waiting for orders at ${selectedRestaurant.name}...`
                : 'Select a restaurant to get started.'}
            </p>
          </motion.div>
        )}

        {/* ── Order Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                updating={updatingIds.has(order.id)}
                currency={selectedRestaurant?.currency ?? 'INR'}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Served Section (collapsible) ── */}
        {servedOrders.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowServed(!showServed)}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <motion.span
                animate={{ rotate: showServed ? 90 : 0 }}
                className="inline-block"
              >
                ▶
              </motion.span>
              Served Orders ({servedOrders.length})
            </button>

            <AnimatePresence>
              {showServed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-3 opacity-60">
                    {servedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        updating={false}
                        currency={selectedRestaurant?.currency ?? 'INR'}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════ */

function StatCard({ label, value, color, bg }: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      layout
      className={`${bg} rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm`}
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>
        {value}
      </p>
    </motion.div>
  );
}

function OrderCard({ order, updating, currency, onStatusUpdate }: {
  order: Order;
  updating: boolean;
  currency: string;
  onStatusUpdate: (orderId: number, status: string) => void;
}) {
  const config = STATUS_CONFIG[order.status];
  const isReady = order.status === 'ready';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 ${config.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        isReady ? 'ring-2 ring-emerald-400/50 dark:ring-emerald-500/30' : ''
      }`}
    >
      {/* Ready pulse overlay */}
      {isReady && (
        <div className="absolute inset-0 rounded-2xl animate-pulse bg-emerald-400/5 pointer-events-none" />
      )}

      {/* Alerts Bar */}
      {(order.call_waiter || order.request_bill) && (
        <div className="flex gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20">
          {order.call_waiter && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 animate-pulse">
              <span className="text-base">🔔</span> Calling Waiter
            </span>
          )}
          {order.request_bill && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 animate-pulse">
              <span className="text-base">🧾</span> Bill Requested
            </span>
          )}
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header: Table + Status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {order.table_number ? `T${order.table_number}` : 'Takeaway'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                #{order.order_number}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {timeAgo(order.placed_at)}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${config.badge}`}>
            {config.badgeText}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Items */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 mr-1.5">
                    {item.quantity}
                  </span>
                  {item.name}
                </span>
                {item.notes && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 ml-6.5 mt-0.5 italic">
                    &ldquo;{item.notes}&rdquo;
                  </p>
                )}
              </div>
              <span className="text-gray-500 dark:text-gray-400 ml-2 tabular-nums whitespace-nowrap">
                {currency} {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Note:</span> {order.notes}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Footer: Total + Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</span>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {currency} {order.total_amount.toFixed(2)}
            </p>
          </div>

          {config.nextStatus && config.nextLabel && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={updating}
              onClick={() => config.nextStatus && onStatusUpdate(order.id, config.nextStatus)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                NEXT_BUTTON_STYLE[config.nextStatus] ?? 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                config.nextLabel
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default WaiterDashboardPage;
