import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { publicMenuApi } from '@/services/qrmenuApi';
import { getMenuTemplateById } from '@/components/qrmenu/menuTemplateConfigs';
import { QRMenuTemplateRenderer } from '@/components/qrmenu/QRMenuTemplateRenderer';
import type {
  PublicMenu,
  PublicMenuCategory,
  PublicMenuItem,
  CartItem,
  Order,
} from '@/types/qrmenu';

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  placed: { label: 'Order Placed', bg: 'bg-amber-100', text: 'text-amber-800', icon: '🕐' },
  preparing: { label: 'Preparing', bg: 'bg-blue-100', text: 'text-blue-800', icon: '👨‍🍳' },
  ready: { label: 'Ready', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '✅' },
  served: { label: 'Served', bg: 'bg-gray-100', text: 'text-gray-600', icon: '🍽️' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
};

const ORDER_STATUS_STEPS = ['placed', 'preparing', 'ready', 'served'];

/* ═══════════════════════════════════════════
   Helper components
   ═══════════════════════════════════════════ */

function DietBadge({ type }: { type: string }) {
  const config: Record<string, { border: string; fill: string; label: string }> = {
    veg: { border: 'border-green-600', fill: 'bg-green-600', label: 'Veg' },
    non_veg: { border: 'border-red-600', fill: 'bg-red-600', label: 'Non-Veg' },
    vegan: { border: 'border-green-700', fill: 'bg-green-700', label: 'Vegan' },
    egg: { border: 'border-yellow-500', fill: 'bg-yellow-500', label: 'Egg' },
  };
  const c = config[type] ?? config.veg;

  if (type === 'vegan') {
    return (
      <span className="flex items-center gap-1" title={c.label}>
        <span className="text-green-700 text-xs">🌿</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 ${c.border} rounded-sm`}
      title={c.label}
    >
      <span className={`block w-1.5 h-1.5 rounded-full ${c.fill}`} />
    </span>
  );
}

function formatCurrency(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${sym}${amount.toFixed(2)}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ═══════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════ */

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
};

const slideUp = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { y: '100%', transition: { duration: 0.25 } },
};

const popIn = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 20 } },
  exit: { scale: 0.5, opacity: 0, transition: { duration: 0.15 } },
};

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */

export function CustomerMenuPage() {
  const { qrToken } = useParams<{ qrToken: string }>();

  /* ── State ── */
  const [menu, setMenu] = useState<PublicMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderViewOpen, setOrderViewOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<'waiter' | 'bill' | null>(null);

  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /* ── Derived ── */
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const currency = menu?.currency ?? 'INR';
  const template = menu ? getMenuTemplateById(menu.template_id || 'pure-white') : null;

  /* ── Fetch menu ── */
  useEffect(() => {
    if (!qrToken) return;
    let cancelled = false;
    setLoading(true);
    publicMenuApi
      .getMenu(qrToken)
      .then((data) => {
        if (cancelled) return;
        setMenu(data);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load menu. Please try scanning the QR code again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [qrToken]);

  /* ── Poll order status ── */
  useEffect(() => {
    if (!currentOrder || !qrToken) return;
    if (currentOrder.status === 'served' || currentOrder.status === 'cancelled') return;

    const interval = setInterval(() => {
      publicMenuApi
        .getOrders(qrToken)
        .then((orders) => {
          const latest = orders.find((o) => o.id === currentOrder.id);
          if (latest) setCurrentOrder(latest);
        })
        .catch(() => {
          /* silently ignore polling errors */
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentOrder, qrToken]);

  /* ── Cart helpers ── */
  const addToCart = useCallback(
    (item: PublicMenuItem) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.menuItemId === item.id);
        if (existing) {
          return prev.map((c) =>
            c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
          );
        }
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            notes: '',
            diet_type: item.diet_type,
          },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((menuItemId: number, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0);
      return updated;
    });
  }, []);

  const updateItemNotes = useCallback((menuItemId: number, notes: string) => {
    setCart((prev) => prev.map((c) => (c.menuItemId === menuItemId ? { ...c, notes } : c)));
  }, []);

  const removeFromCart = useCallback(
    (menuItemId: number) => {
      setCart((prev) => {
        const updated = prev
          .map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c))
          .filter((c) => c.quantity > 0);
        return updated;
      });
    },
    [],
  );

  const getCartQuantity = useCallback(
    (menuItemId: number) => cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0,
    [cart],
  );

  /* ── Place order ── */
  const handlePlaceOrder = useCallback(async () => {
    if (!qrToken || cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = await publicMenuApi.placeOrder(qrToken, {
        items: cart.map((c) => ({
          menu_item_id: c.menuItemId,
          quantity: c.quantity,
          notes: c.notes || undefined,
        })),
        notes: orderNotes || undefined,
      });
      setCurrentOrder(order);
      setCart([]);
      setOrderNotes('');
      setCartOpen(false);
      setOrderViewOpen(true);
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }, [qrToken, cart, orderNotes]);

  /* ── Waiter / bill ── */
  const handleCallWaiter = useCallback(async () => {
    if (!currentOrder) return;
    setActionLoading('waiter');
    try {
      await publicMenuApi.callWaiter(currentOrder.id);
      setCurrentOrder((prev) => (prev ? { ...prev, call_waiter: true } : prev));
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  }, [currentOrder]);

  const handleRequestBill = useCallback(async () => {
    if (!currentOrder) return;
    setActionLoading('bill');
    try {
      await publicMenuApi.requestBill(currentOrder.id);
      setCurrentOrder((prev) => (prev ? { ...prev, request_bill: true } : prev));
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  }, [currentOrder]);

  /* ── Category scroll ── */
  const scrollToCategory = useCallback((catId: number) => {
    setActiveCategory(catId);
    const el = categoryRefs.current[catId];
    if (el) {
      const yOffset = -130;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  /* ── Dynamic theme style ── */
  const primary = menu?.primary_color ?? '#E85D04';
  const accent = menu?.accent_color ?? '#F48C06';

  /* ═══════════════════════════════════════
     RENDER — Loading
     ═══════════════════════════════════════ */

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-gray-200"
          style={{ borderTopColor: primary }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
        <p className="mt-4 text-gray-500 text-sm">Loading menu...</p>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER — Error
     ═══════════════════════════════════════ */

  if (error && !menu) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm max-w-xs">{error}</p>
      </div>
    );
  }

  if (!menu) return null;

  const availableCategories = menu.categories.filter((cat) => cat.items.some((i) => i.is_available));

  /* ═══════════════════════════════════════
     RENDER — Main
     ═══════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ── Menu body: template renderer or fallback ── */}
      {template ? (
        <QRMenuTemplateRenderer
          menu={menu}
          template={template}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onOpenCart={() => setCartOpen(true)}
          cartCount={cartCount}
          cartTotal={cartTotal}
        />
      ) : (
        <>
          {/* ── Hero / Header ── */}
          <header className="relative">
            {menu.cover_image_url ? (
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={menu.cover_image_url}
                  alt={menu.restaurant_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
            ) : (
              <div className="h-32 sm:h-40" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }} />
            )}

            {/* Restaurant info overlay */}
            <div className={`relative px-4 ${menu.cover_image_url ? '-mt-16' : '-mt-10'}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4"
              >
                {menu.logo_url ? (
                  <img
                    src={menu.logo_url}
                    alt="Logo"
                    className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                  >
                    {menu.restaurant_name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-gray-900 truncate">{menu.restaurant_name}</h1>
                  {menu.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{menu.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: primary }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Table {menu.table_number}
                    </span>
                    {menu.phone && (
                      <a href={`tel:${menu.phone}`} className="text-xs text-gray-400 hover:text-gray-600">
                        📞 {menu.phone}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </header>

          {/* ── Category tabs ── */}
          {availableCategories.length > 1 && (
            <div
              ref={categoryTabsRef}
              className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            >
              <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeCategory === cat.id
                        ? 'text-white shadow-md'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={
                      activeCategory === cat.id
                        ? { backgroundColor: primary, boxShadow: `0 4px 14px ${primary}40` }
                        : undefined
                    }
                  >
                    {cat.icon && <span className="mr-1">{cat.icon}</span>}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Order status banner ── */}
          <AnimatePresence>
            {currentOrder && !orderViewOpen && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setOrderViewOpen(true)}
                className="sticky top-[60px] z-20 w-full px-4 py-2"
              >
                <div
                  className="flex items-center justify-between bg-white rounded-xl shadow-md p-3 border-l-4"
                  style={{ borderLeftColor: primary }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{STATUS_CONFIG[currentOrder.status]?.icon ?? '📋'}</span>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800">
                        Order #{currentOrder.order_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {STATUS_CONFIG[currentOrder.status]?.label ?? currentOrder.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium" style={{ color: primary }}>
                    View →
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* ── Menu sections ── */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="px-4 pt-4">
            {availableCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                currency={currency}
                primary={primary}
                accent={accent}
                getCartQuantity={getCartQuantity}
                addToCart={addToCart}
                updateQuantity={updateQuantity}
                sectionRef={(el) => {
                  categoryRefs.current[cat.id] = el;
                }}
              />
            ))}
          </motion.div>

          {/* ── Floating cart button ── */}
          <AnimatePresence>
            {cartCount > 0 && !cartOpen && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed bottom-4 left-4 right-4 z-40"
              >
                <button
                  onClick={() => setCartOpen(true)}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-white font-semibold shadow-2xl active:scale-[0.98] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${accent})`,
                    boxShadow: `0 8px 32px ${primary}50`,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="relative">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100-4 2 2 0 000-4z" />
                      </svg>
                      <motion.span
                        key={cartCount}
                        {...popIn}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ color: primary }}
                      >
                        {cartCount}
                      </motion.span>
                    </span>
                    View Cart
                  </span>
                  <span className="text-base">{formatCurrency(cartTotal, currency)}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Cart drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl"
            >
              {/* Cart header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {cart.map((item) => (
                  <motion.div key={item.menuItemId} layout className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <DietBadge type={item.diet_type} />
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-1" style={{ color: primary }}>
                          {formatCurrency(item.price * item.quantity, currency)}
                        </p>
                      </div>
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrement={() => updateQuantity(item.menuItemId, 1)}
                        onDecrement={() => updateQuantity(item.menuItemId, -1)}
                        primary={primary}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Add note (e.g., less spicy)"
                      value={item.notes}
                      onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400"
                      style={{ focusRingColor: primary } as React.CSSProperties}
                    />
                  </motion.div>
                ))}

                {/* Order-level notes */}
                <div className="pt-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Special instructions
                  </label>
                  <textarea
                    placeholder="Any allergies or special requests..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Cart footer */}
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(cartTotal, currency)}
                  </span>
                </div>
                {menu.tax_percent > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Tax ({menu.tax_percent}%)</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatCurrency(cartTotal * (menu.tax_percent / 100), currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold" style={{ color: primary }}>
                    {formatCurrency(cartTotal * (1 + menu.tax_percent / 100), currency)}
                  </span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.length === 0}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base shadow-lg disabled:opacity-60 active:scale-[0.98] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${accent})`,
                    boxShadow: `0 6px 20px ${primary}40`,
                  }}
                >
                  {placingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                      />
                      Placing Order...
                    </span>
                  ) : (
                    `Place Order · ${formatCurrency(cartTotal * (1 + menu.tax_percent / 100), currency)}`
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Order tracking drawer ── */}
      <AnimatePresence>
        {orderViewOpen && currentOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOrderViewOpen(false)}
            />
            <motion.div
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Order #{currentOrder.order_number}
                  </h2>
                  {currentOrder.placed_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(currentOrder.placed_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOrderViewOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Status progress */}
                <div className="flex items-center justify-between px-2">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const currentIdx = ORDER_STATUS_STEPS.indexOf(currentOrder.status);
                    const isActive = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step} className="flex flex-col items-center flex-1 relative">
                        {idx > 0 && (
                          <div
                            className="absolute top-3 -left-1/2 w-full h-0.5"
                            style={{ backgroundColor: isActive ? primary : '#E5E7EB' }}
                          />
                        )}
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                          transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                          className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: isActive ? primary : '#E5E7EB',
                            color: isActive ? '#fff' : '#9CA3AF',
                          }}
                        >
                          {isActive ? '✓' : idx + 1}
                        </motion.div>
                        <span
                          className="text-[10px] mt-1 font-medium capitalize"
                          style={{ color: isActive ? primary : '#9CA3AF' }}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status badge */}
                <div className="flex justify-center">
                  <motion.span
                    key={currentOrder.status}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${
                      STATUS_CONFIG[currentOrder.status]?.bg ?? 'bg-gray-100'
                    } ${STATUS_CONFIG[currentOrder.status]?.text ?? 'text-gray-600'}`}
                  >
                    {STATUS_CONFIG[currentOrder.status]?.icon}{' '}
                    {STATUS_CONFIG[currentOrder.status]?.label ?? currentOrder.status}
                  </motion.span>
                </div>

                {/* Order items */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Items</h3>
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400 ml-2">x{item.quantity}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(item.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold" style={{ color: primary }}>
                    {formatCurrency(currentOrder.total_amount, currency)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 px-5 py-4 flex gap-3">
                <button
                  onClick={handleCallWaiter}
                  disabled={currentOrder.call_waiter || actionLoading === 'waiter'}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 disabled:opacity-50 transition-all active:scale-[0.97]"
                  style={{
                    borderColor: primary,
                    color: currentOrder.call_waiter ? '#9CA3AF' : primary,
                  }}
                >
                  {currentOrder.call_waiter ? '✓ Waiter Notified' : '🔔 Call Waiter'}
                </button>
                <button
                  onClick={handleRequestBill}
                  disabled={currentOrder.request_bill || actionLoading === 'bill'}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all active:scale-[0.97]"
                  style={{
                    background: currentOrder.request_bill
                      ? '#9CA3AF'
                      : `linear-gradient(135deg, ${primary}, ${accent})`,
                  }}
                >
                  {currentOrder.request_bill ? '✓ Bill Requested' : '🧾 Request Bill'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Error toast ── */}
      <AnimatePresence>
        {error && menu && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl shadow-lg flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CategorySection
   ═══════════════════════════════════════════ */

interface CategorySectionProps {
  category: PublicMenuCategory;
  currency: string;
  primary: string;
  accent: string;
  getCartQuantity: (id: number) => number;
  addToCart: (item: PublicMenuItem) => void;
  updateQuantity: (id: number, delta: number) => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}

function CategorySection({
  category,
  currency,
  primary,
  accent,
  getCartQuantity,
  addToCart,
  updateQuantity,
  sectionRef,
}: CategorySectionProps) {
  const availableItems = category.items.filter((i) => i.is_available);
  const unavailableItems = category.items.filter((i) => !i.is_available);

  if (availableItems.length === 0 && unavailableItems.length === 0) return null;

  return (
    <motion.div variants={fadeUp} ref={sectionRef} className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {category.icon && <span className="text-lg">{category.icon}</span>}
        <h2 className="text-base font-bold text-gray-800">{category.name}</h2>
        <span className="text-xs text-gray-400">({availableItems.length})</span>
      </div>
      {category.description && (
        <p className="text-xs text-gray-500 mb-3 -mt-1">{category.description}</p>
      )}

      <div className="space-y-3">
        {availableItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            currency={currency}
            primary={primary}
            accent={accent}
            cartQty={getCartQuantity(item.id)}
            onAdd={() => addToCart(item)}
            onIncrement={() => updateQuantity(item.id, 1)}
            onDecrement={() => updateQuantity(item.id, -1)}
          />
        ))}
        {unavailableItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            currency={currency}
            primary={primary}
            accent={accent}
            cartQty={0}
            onAdd={() => {}}
            onIncrement={() => {}}
            onDecrement={() => {}}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MenuItemCard
   ═══════════════════════════════════════════ */

interface MenuItemCardProps {
  item: PublicMenuItem;
  currency: string;
  primary: string;
  accent: string;
  cartQty: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

function MenuItemCard({
  item,
  currency,
  primary,
  accent,
  cartQty,
  onAdd,
  onIncrement,
  onDecrement,
}: MenuItemCardProps) {
  const unavailable = !item.is_available;

  return (
    <motion.div
      variants={scaleIn}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex ${
        unavailable ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Image or placeholder */}
      {item.image_url ? (
        <div className="w-28 h-28 flex-shrink-0 relative">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {item.is_popular && (
            <span
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              ★ Popular
            </span>
          )}
        </div>
      ) : (
        <div className="w-28 h-28 flex-shrink-0 bg-gray-50 flex items-center justify-center relative">
          <span className="text-3xl opacity-30">🍽️</span>
          {item.is_popular && (
            <span
              className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              ★ Popular
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <DietBadge type={item.diet_type} />
            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-sm font-bold" style={{ color: primary }}>
              {formatCurrency(item.price, currency)}
            </span>
            {item.preparation_time !== null && item.preparation_time > 0 && (
              <span className="text-[10px] text-gray-400 ml-2">
                ⏱ {formatTime(item.preparation_time)}
              </span>
            )}
          </div>

          {!unavailable && (
            <AnimatePresence mode="wait">
              {cartQty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onAdd}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors"
                  style={{ borderColor: primary, color: primary }}
                >
                  ADD
                </motion.button>
              ) : (
                <QuantityStepper
                  key="stepper"
                  quantity={cartQty}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  primary={primary}
                />
              )}
            </AnimatePresence>
          )}

          {unavailable && (
            <span className="text-[10px] text-red-400 font-medium px-2 py-1 bg-red-50 rounded-md">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   QuantityStepper
   ═══════════════════════════════════════════ */

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  primary: string;
}

function QuantityStepper({ quantity, onIncrement, onDecrement, primary }: QuantityStepperProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-0 rounded-lg overflow-hidden border-2"
      style={{ borderColor: primary }}
    >
      <button
        onClick={onDecrement}
        className="w-7 h-7 flex items-center justify-center text-sm font-bold transition-colors hover:bg-gray-50"
        style={{ color: primary }}
      >
        −
      </button>
      <motion.span
        key={quantity}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="w-6 text-center text-xs font-bold"
        style={{ color: primary }}
      >
        {quantity}
      </motion.span>
      <button
        onClick={onIncrement}
        className="w-7 h-7 flex items-center justify-center text-sm font-bold text-white"
        style={{ backgroundColor: primary }}
      >
        +
      </button>
    </motion.div>
  );
}
