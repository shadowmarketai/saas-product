import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderApi, restaurantApi } from '@/services/qrmenuApi';
import type { Order, Restaurant } from '@/types/qrmenu';
import logging from 'loglevel';

const log = logging.getLogger('KitchenDashboard');

/* ═══════════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════════ */

const POLL_INTERVAL_MS = 10_000;
const TICK_INTERVAL_MS = 30_000;

type OrderStatus = Order['status'];

/** Minutes elapsed since a given ISO timestamp. */
function minutesElapsed(isoTimestamp: string | null): number {
  if (!isoTimestamp) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 60_000));
}

/** Urgency color based on minutes elapsed. */
function urgencyColor(minutes: number): string {
  if (minutes > 10) return 'text-red-400';
  if (minutes >= 5) return 'text-yellow-300';
  return 'text-green-400';
}

function urgencyBg(minutes: number): string {
  if (minutes > 10) return 'border-red-500/60';
  if (minutes >= 5) return 'border-yellow-500/40';
  return 'border-green-500/30';
}

/** Format elapsed time for display. */
function formatElapsed(minutes: number): string {
  if (minutes < 1) return '<1 min';
  return `${minutes} min`;
}

/* ═══════════════════════════════════════════
   Sound Alert (Web Audio API)
   ═══════════════════════════════════════════ */

function playNewOrderBeep(): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc.start(ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);

    // Second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.55);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.55);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc2.start(ctx.currentTime + 0.55);
    osc2.stop(ctx.currentTime + 1.0);
  } catch {
    log.warn('Web Audio API not available for alert sound');
  }
}

/* ═══════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════ */

const cardVariants = {
  initial: { opacity: 0, x: -60, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.25 } },
};

const pulseVariant = {
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(239, 68, 68, 0)',
      '0 0 0 8px rgba(239, 68, 68, 0.3)',
      '0 0 0 0 rgba(239, 68, 68, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

/* ═══════════════════════════════════════════
   Order Card Component
   ═══════════════════════════════════════════ */

interface OrderCardProps {
  order: Order;
  onAction: (orderId: number, newStatus: OrderStatus) => void;
  actionLoading: number | null;
  tick: number;
}

function OrderCard({ order, onAction, actionLoading, tick: _tick }: OrderCardProps) {
  const elapsed = minutesElapsed(order.placed_at);
  const isUrgent = elapsed > 10;
  const isPlaced = order.status === 'placed';
  const nextStatus: OrderStatus = isPlaced ? 'preparing' : 'ready';
  const actionLabel = isPlaced ? 'START PREPARING' : 'MARK READY';
  const actionBtnClass = isPlaced
    ? 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-900'
    : 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white';

  return (
    <motion.div
      layout
      variants={isUrgent ? { ...cardVariants, animate: { ...cardVariants.animate, ...pulseVariant.pulse } } : cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`rounded-xl border-2 ${urgencyBg(elapsed)} bg-gray-800 p-4 mb-4 shadow-lg`}
    >
      {/* Header: Table + elapsed */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-3xl font-black text-white tracking-tight leading-none">
            {order.table_number ? `TABLE ${order.table_number}` : 'TAKEAWAY'}
          </div>
          <div className="text-sm text-gray-400 mt-1 font-mono">
            #{order.order_number}
          </div>
        </div>
        <div className={`text-2xl font-bold tabular-nums ${urgencyColor(elapsed)}`}>
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-2">
            <span className="text-xl font-bold text-white min-w-[3rem] text-right">
              x{item.quantity}
            </span>
            <div className="flex-1">
              <span className="text-lg text-gray-100 font-medium">{item.name}</span>
              {item.notes && (
                <div className="text-sm bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded mt-0.5 border border-amber-500/30">
                  {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order-level notes */}
      {order.notes && (
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg px-3 py-2 mb-3">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Note</span>
          <p className="text-amber-200 text-base font-medium mt-0.5">{order.notes}</p>
        </div>
      )}

      {/* Waiter / Bill flags */}
      <div className="flex gap-2 mb-3">
        {order.call_waiter && (
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/40 uppercase">
            Waiter Called
          </span>
        )}
        {order.request_bill && (
          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/40 uppercase">
            Bill Requested
          </span>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={() => onAction(order.id, nextStatus)}
        disabled={actionLoading === order.id}
        className={`w-full h-14 rounded-lg text-lg font-extrabold uppercase tracking-wider transition-colors ${actionBtnClass} disabled:opacity-50 disabled:cursor-wait`}
      >
        {actionLoading === order.id ? 'UPDATING...' : actionLabel}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Ready Card (compact)
   ═══════════════════════════════════════════ */

interface ReadyCardProps {
  order: Order;
  onAction: (orderId: number, newStatus: OrderStatus) => void;
  actionLoading: number | null;
}

function ReadyCard({ order, onAction, actionLoading }: ReadyCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="rounded-lg border border-green-500/40 bg-gray-800 p-3 shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-white">
            {order.table_number ? `T${order.table_number}` : 'TKW'}
          </span>
          <span className="text-sm text-gray-400 ml-2 font-mono">#{order.order_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-400 font-medium">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onAction(order.id, 'served')}
            disabled={actionLoading === order.id}
            className="h-10 px-4 rounded-lg bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {actionLoading === order.id ? '...' : 'SERVED'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Main Kitchen Dashboard Page
   ═══════════════════════════════════════════ */

export function KitchenDashboardPage() {
  /* ---------- State ---------- */
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [tick, setTick] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevOrderIdsRef = useRef<Set<number>>(new Set());

  /* ---------- Derived data ---------- */
  const placedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'placed')
        .sort((a, b) => minutesElapsed(b.placed_at) - minutesElapsed(a.placed_at)),
    [orders],
  );

  const preparingOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'preparing')
        .sort((a, b) => minutesElapsed(b.placed_at) - minutesElapsed(a.placed_at)),
    [orders],
  );

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready'),
    [orders],
  );

  /* ---------- Fetch restaurants ---------- */
  useEffect(() => {
    let cancelled = false;
    restaurantApi
      .list()
      .then((list) => {
        if (cancelled) return;
        setRestaurants(list);
        if (list.length > 0 && !selectedRestaurantId) {
          setSelectedRestaurantId(list[0].id);
        }
      })
      .catch((err: unknown) => {
        log.error('Failed to load restaurants', err);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Fetch active orders ---------- */
  const fetchOrders = useCallback(async () => {
    if (!selectedRestaurantId) return;
    try {
      const data = await orderApi.listActive(selectedRestaurantId);
      setOrders(data);

      // Detect new placed orders for sound alert
      const newPlacedIds = new Set(data.filter((o) => o.status === 'placed').map((o) => o.id));
      const prev = prevOrderIdsRef.current;
      let hasNew = false;
      newPlacedIds.forEach((id) => {
        if (!prev.has(id)) hasNew = true;
      });
      if (hasNew && prev.size > 0) {
        playNewOrderBeep();
      }
      prevOrderIdsRef.current = newPlacedIds;
    } catch (err: unknown) {
      log.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  /* ---------- WebSocket ---------- */
  useEffect(() => {
    if (!selectedRestaurantId) return;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = import.meta.env.VITE_WS_HOST || 'localhost:8000';
      const url = `${protocol}://${host}/ws/restaurant/${selectedRestaurantId}`;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        log.info('Kitchen WS connected');
        // Clear polling when WS is active
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as { type?: string; order?: Order };
          if (msg.type === 'order_update' || msg.type === 'new_order') {
            fetchOrders();
          }
        } catch {
          log.warn('Unrecognized WS message');
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        log.info('Kitchen WS disconnected — falling back to polling');
        wsRef.current = null;
        // Start polling fallback
        if (!pollTimerRef.current) {
          pollTimerRef.current = setInterval(fetchOrders, POLL_INTERVAL_MS);
        }
        // Attempt reconnect after 3s
        setTimeout(() => {
          if (!wsRef.current) connectWs();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    // Initial fetch then connect WS
    fetchOrders();
    connectWs();

    // Start polling as initial fallback (will be cleared once WS connects)
    pollTimerRef.current = setInterval(fetchOrders, POLL_INTERVAL_MS);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [selectedRestaurantId, fetchOrders]);

  /* ---------- Tick for elapsed time updates ---------- */
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  /* ---------- Status update handler ---------- */
  const handleStatusChange = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      setActionLoading(orderId);
      try {
        const updated = await orderApi.updateStatus(orderId, newStatus);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      } catch (err: unknown) {
        log.error('Failed to update order status', err);
      } finally {
        setActionLoading(null);
      }
    },
    [],
  );

  /* ---------- Restaurant change ---------- */
  const handleRestaurantChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    if (!isNaN(id)) {
      setSelectedRestaurantId(id);
      setOrders([]);
      setLoading(true);
      prevOrderIdsRef.current = new Set();
    }
  }, []);

  /* ═══════════════════════════════════════════
     Render
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ──── Top Bar ──── */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur border-b border-gray-700/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Left: title + restaurant selector */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black tracking-tight uppercase hidden sm:block">
              Kitchen
            </h1>
            <select
              value={selectedRestaurantId ?? ''}
              onChange={handleRestaurantChange}
              className="h-11 px-3 rounded-lg bg-gray-800 border border-gray-600 text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[180px]"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: counters + connection status */}
          <div className="flex items-center gap-3">
            <CounterBadge label="New" count={placedOrders.length} color="amber" />
            <CounterBadge label="Prep" count={preparingOrders.length} color="blue" />
            <CounterBadge label="Ready" count={readyOrders.length} color="green" />
            <div
              className={`w-3 h-3 rounded-full ml-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
              title={wsConnected ? 'WebSocket connected' : 'Polling (WS disconnected)'}
            />
          </div>
        </div>
      </header>

      {/* ──── Main Content ──── */}
      <main className="max-w-[1800px] mx-auto p-4">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-400 animate-pulse">Loading orders...</div>
          </div>
        ) : placedOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-6xl">&#x1F468;&#x200D;&#x1F373;</div>
            <div className="text-2xl text-gray-400 font-medium">No active orders</div>
            <div className="text-gray-500">Orders will appear here in real-time</div>
          </div>
        ) : (
          <>
            {/* Two-column Kanban */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* NEW ORDERS column */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-2 rounded-full bg-amber-500" />
                  <h2 className="text-xl font-extrabold uppercase tracking-wider text-amber-400">
                    New Orders
                  </h2>
                  <span className="ml-auto text-3xl font-black text-amber-400 tabular-nums">
                    {placedOrders.length}
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  {placedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAction={handleStatusChange}
                      actionLoading={actionLoading}
                      tick={tick}
                    />
                  ))}
                </AnimatePresence>
                {placedOrders.length === 0 && (
                  <div className="text-center text-gray-500 py-12 text-lg">
                    No new orders
                  </div>
                )}
              </section>

              {/* PREPARING column */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-2 rounded-full bg-blue-500" />
                  <h2 className="text-xl font-extrabold uppercase tracking-wider text-blue-400">
                    Preparing
                  </h2>
                  <span className="ml-auto text-3xl font-black text-blue-400 tabular-nums">
                    {preparingOrders.length}
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAction={handleStatusChange}
                      actionLoading={actionLoading}
                      tick={tick}
                    />
                  ))}
                </AnimatePresence>
                {preparingOrders.length === 0 && (
                  <div className="text-center text-gray-500 py-12 text-lg">
                    Nothing being prepared
                  </div>
                )}
              </section>
            </div>

            {/* READY FOR PICKUP (collapsible) */}
            {readyOrders.length > 0 && (
              <section className="border-t border-gray-700/50 pt-4">
                <button
                  onClick={() => setShowReady((v) => !v)}
                  className="flex items-center gap-3 mb-4 w-full text-left"
                >
                  <div className="h-10 w-2 rounded-full bg-green-500" />
                  <h2 className="text-xl font-extrabold uppercase tracking-wider text-green-400">
                    Ready for Pickup
                  </h2>
                  <span className="text-3xl font-black text-green-400 tabular-nums">
                    {readyOrders.length}
                  </span>
                  <span className="ml-auto text-gray-400 text-sm font-medium">
                    {showReady ? 'HIDE' : 'SHOW'}
                  </span>
                  <motion.span
                    animate={{ rotate: showReady ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400 text-xl"
                  >
                    &#9660;
                  </motion.span>
                </button>
                <AnimatePresence>
                  {showReady && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-2"
                    >
                      {readyOrders.map((order) => (
                        <ReadyCard
                          key={order.id}
                          order={order}
                          onAction={handleStatusChange}
                          actionLoading={actionLoading}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Counter Badge
   ═══════════════════════════════════════════ */

interface CounterBadgeProps {
  label: string;
  count: number;
  color: 'amber' | 'blue' | 'green';
}

const BADGE_STYLES: Record<string, string> = {
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function CounterBadge({ label, count, color }: CounterBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${BADGE_STYLES[color]}`}>
      <span className="hidden sm:inline uppercase text-xs tracking-wider opacity-70">{label}</span>
      <span className="text-lg tabular-nums">{count}</span>
    </div>
  );
}

export default KitchenDashboardPage;
