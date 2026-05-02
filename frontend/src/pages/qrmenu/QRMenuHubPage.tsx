import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantApi, categoryApi } from '@/services/qrmenuApi';
import { menuTemplateConfigs, getMenuTemplateById } from '@/components/qrmenu/menuTemplateConfigs';
import { QRMenuTemplateRenderer } from '@/components/qrmenu/QRMenuTemplateRenderer';
import { RestaurantManagePage } from './RestaurantManagePage';
import { WaiterDashboardPage } from './WaiterDashboardPage';
import { KitchenDashboardPage } from './KitchenDashboardPage';
import type { Restaurant, MenuCategory, MenuItem, PublicMenu, PublicMenuCategory, CartItem } from '@/types/qrmenu';

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

type HubTab = 'manage' | 'waiter' | 'kitchen';

const HUB_TABS: { key: HubTab; label: string; icon: string; desc: string }[] = [
  { key: 'manage', label: 'Restaurant Manager', icon: '🏪', desc: 'Menu, Tables & QR Codes' },
  { key: 'waiter', label: 'Waiter Dashboard', icon: '🍽️', desc: 'Order Management' },
  { key: 'kitchen', label: 'Kitchen Display', icon: '👨‍🍳', desc: 'Cooking Queue' },
];

const fadeTab = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

/* ═══════════════════════════════════════════
   Preview Modal
   ═══════════════════════════════════════════ */

interface PreviewModalProps {
  restaurant: Restaurant | null;
  categories: PublicMenuCategory[];
  onClose: () => void;
  selectedTemplateId: string;
  onTemplateChange: (id: string) => void;
}

function PreviewModal({ restaurant, categories, onClose, selectedTemplateId, onTemplateChange }: PreviewModalProps) {
  const [previewCart, setPreviewCart] = useState<CartItem[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const template = getMenuTemplateById(selectedTemplateId);

  const previewMenu: PublicMenu | null = restaurant
    ? {
        restaurant_name: restaurant.name,
        restaurant_slug: restaurant.slug,
        description: restaurant.description,
        logo_url: restaurant.logo_url,
        cover_image_url: restaurant.cover_image_url,
        phone: restaurant.phone,
        currency: restaurant.currency,
        tax_percent: restaurant.tax_percent,
        primary_color: restaurant.primary_color,
        accent_color: restaurant.accent_color,
        template_id: selectedTemplateId,
        table_number: 'Preview',
        table_id: 0,
        categories,
      }
    : null;

  const cartCount = useMemo(() => previewCart.reduce((s, i) => s + i.quantity, 0), [previewCart]);
  const cartTotal = useMemo(() => previewCart.reduce((s, i) => s + i.price * i.quantity, 0), [previewCart]);

  const addToCart = useCallback((item: { id: number; name: string; price: number; diet_type: string }) => {
    setPreviewCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id);
      if (existing) {
        return prev.map((c) => (c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, notes: '', diet_type: item.diet_type }];
    });
  }, []);

  const removeFromCart = useCallback((menuItemId: number) => {
    setPreviewCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === menuItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.menuItemId !== menuItemId);
      return prev.map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity - 1 } : c));
    });
  }, []);

  if (!previewMenu || !template) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-7xl h-[92vh] mx-4 gap-4">
        {/* Template Picker Sidebar */}
        <AnimatePresence>
          {showTemplatePicker && (
            <motion.div
              initial={{ opacity: 0, x: -40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 300 }}
              exit={{ opacity: 0, x: -40, width: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col flex-shrink-0"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Choose Template</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">60 premium designs</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {menuTemplateConfigs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedTemplateId === t.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.preview}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{t.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Preview Frame */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Top Bar */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowTemplatePicker(!showTemplatePicker)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                showTemplatePicker
                  ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              🎨 {showTemplatePicker ? 'Hide Templates' : 'Change Template'}
            </button>
            <div className="px-4 py-2 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Active: </span>
              <span className="font-semibold text-gray-900 dark:text-white">{template.name}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-sm font-semibold hover:bg-red-500/20 transition-colors"
            >
              Close Preview
            </button>
          </div>

          {/* Phone Frame */}
          <div className="relative w-[390px] h-[780px] rounded-[3rem] border-[8px] border-gray-800 dark:border-gray-600 bg-gray-800 dark:bg-gray-600 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-800 dark:bg-gray-600 rounded-b-2xl z-50" />
            {/* Screen */}
            <div className="w-full h-full rounded-[2.3rem] overflow-hidden overflow-y-auto bg-white">
              <div className="pt-8">
                <QRMenuTemplateRenderer
                  menu={previewMenu}
                  template={template}
                  cart={previewCart}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  onOpenCart={() => {}}
                  cartCount={cartCount}
                  cartTotal={cartTotal}
                />
              </div>
            </div>
            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Main Hub Component
   ═══════════════════════════════════════════ */

export function QRMenuHubPage() {
  const [activeTab, setActiveTab] = useState<HubTab>('manage');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRestaurant, setPreviewRestaurant] = useState<Restaurant | null>(null);
  const [previewCategories, setPreviewCategories] = useState<PublicMenuCategory[]>([]);
  const [previewTemplateId, setPreviewTemplateId] = useState('pure-white');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  /* Load restaurants for preview selector */
  useEffect(() => {
    restaurantApi.list().then(setRestaurants).catch(() => {});
  }, [activeTab]);

  /* Fetch categories + items for a restaurant preview */
  const openPreview = useCallback(async (restaurant: Restaurant) => {
    setLoadingPreview(true);
    try {
      const cats = await categoryApi.list(restaurant.id);
      const categoriesWithItems: PublicMenuCategory[] = await Promise.all(
        cats.map(async (cat: MenuCategory) => {
          const items = await import('@/services/qrmenuApi').then((m) => m.menuItemApi.list(cat.id));
          return {
            id: cat.id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            items: items
              .filter((item: MenuItem) => item.is_available)
              .map((item: MenuItem) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image_url: item.image_url,
                price: item.price,
                diet_type: item.diet_type,
                is_available: item.is_available,
                is_popular: item.is_popular,
                preparation_time: item.preparation_time,
              })),
          };
        })
      );
      setPreviewRestaurant(restaurant);
      setPreviewCategories(categoriesWithItems);
      setPreviewTemplateId(restaurant.template_id || 'pure-white');
      setPreviewOpen(true);
    } catch {
      /* silently fail */
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  /* Save template selection back to the restaurant */
  const handleTemplateChange = useCallback(async (templateId: string) => {
    setPreviewTemplateId(templateId);
    if (previewRestaurant) {
      try {
        await restaurantApi.update(previewRestaurant.id, { template_id: templateId } as Partial<Restaurant>);
        setPreviewRestaurant((prev) => prev ? { ...prev, template_id: templateId } : prev);
        setRestaurants((prev) => prev.map((r) => (r.id === previewRestaurant.id ? { ...r, template_id: templateId } : r)));
      } catch {
        /* silently fail */
      }
    }
  }, [previewRestaurant]);

  return (
    <div className="min-h-screen">
      {/* ─── Top Hub Header ─── */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Title Row */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="text-3xl">📱</span>
                QR Menu & Smart Ordering
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage menus, track orders, and run your kitchen — all in one place
              </p>
            </div>

            {/* Preview Button */}
            <div className="flex items-center gap-3">
              {restaurants.length > 0 && (
                <div className="relative group">
                  <button
                    disabled={loadingPreview}
                    onClick={() => {
                      if (restaurants.length === 1) {
                        openPreview(restaurants[0]);
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loadingPreview ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="text-lg">👁️</span>
                    )}
                    Preview Menu
                  </button>
                  {/* Dropdown for multiple restaurants */}
                  {restaurants.length > 1 && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                      <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Restaurant</p>
                      {restaurants.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => openPreview(r)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-3"
                        >
                          {r.logo_url ? (
                            <img src={r.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-lg">🏪</span>
                          )}
                          <div>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-gray-400">{r.template_id || 'pure-white'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-1 -mb-px overflow-x-auto pb-0">
            {HUB_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2.5 px-5 py-3 text-sm font-medium transition-all whitespace-nowrap rounded-t-xl ${
                  activeTab === tab.key
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/5'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <span className="block leading-tight">{tab.label}</span>
                  <span className="block text-[10px] opacity-60 leading-tight">{tab.desc}</span>
                </div>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="hub-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...fadeTab}>
          {activeTab === 'manage' && <RestaurantManagePage />}
          {activeTab === 'waiter' && <WaiterDashboardPage />}
          {activeTab === 'kitchen' && <KitchenDashboardPage />}
        </motion.div>
      </AnimatePresence>

      {/* ─── Preview Modal ─── */}
      <AnimatePresence>
        {previewOpen && (
          <PreviewModal
            restaurant={previewRestaurant}
            categories={previewCategories}
            onClose={() => setPreviewOpen(false)}
            selectedTemplateId={previewTemplateId}
            onTemplateChange={handleTemplateChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
