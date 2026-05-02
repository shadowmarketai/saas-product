import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { restaurantApi, categoryApi, menuItemApi, tableApi } from '@/services/qrmenuApi';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import type { Restaurant, MenuCategory, MenuItem, RestaurantTable } from '@/types/qrmenu';
import { menuTemplateConfigs } from '@/components/qrmenu/menuTemplateConfigs';
import logging from 'loglevel';

const log = logging.getLogger('RestaurantManage');

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */

type TabKey = 'restaurants' | 'menu' | 'tables';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'restaurants', label: 'Restaurants', icon: '🏪' },
  { key: 'menu', label: 'Menu Editor', icon: '📋' },
  { key: 'tables', label: 'Tables & QR', icon: '🪑' },
];

const DIET_BADGE: Record<string, { dot: string; label: string }> = {
  veg: { dot: 'bg-green-500', label: 'Veg' },
  non_veg: { dot: 'bg-red-500', label: 'Non-Veg' },
  vegan: { dot: 'bg-emerald-500', label: 'Vegan' },
  egg: { dot: 'bg-yellow-500', label: 'Egg' },
};

const TABLE_STATUS_STYLE: Record<string, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  occupied: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
};

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

const EMPTY_RESTAURANT_FORM: RestaurantFormData = {
  name: '',
  description: '',
  logo_url: '',
  phone: '',
  address: '',
  currency: 'INR',
  tax_percent: 0,
  primary_color: '#E85D04',
  accent_color: '#F48C06',
  cover_image_url: '',
  template_id: 'pure-white',
};

const EMPTY_CATEGORY_FORM: CategoryFormData = {
  name: '',
  icon: '',
  sort_order: 0,
};

const EMPTY_ITEM_FORM: ItemFormData = {
  name: '',
  description: '',
  image_url: '',
  price: 0,
  diet_type: 'veg',
  preparation_time: 15,
};

const EMPTY_TABLE_FORM: TableFormData = {
  table_number: '',
  label: '',
  capacity: 4,
};

/* ═══════════════════════════════════════════
   Form data types
   ═══════════════════════════════════════════ */

interface RestaurantFormData {
  name: string;
  description: string;
  logo_url: string;
  phone: string;
  address: string;
  currency: string;
  tax_percent: number;
  primary_color: string;
  accent_color: string;
  cover_image_url: string;
  template_id: string;
}

interface CategoryFormData {
  name: string;
  icon: string;
  sort_order: number;
}

interface ItemFormData {
  name: string;
  description: string;
  image_url: string;
  price: number;
  diet_type: 'veg' | 'non_veg' | 'vegan' | 'egg';
  preparation_time: number;
}

interface TableFormData {
  table_number: string;
  label: string;
  capacity: number;
}

/* ═══════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════ */

const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25 },
};

const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════
   Helper sub-components
   ═══════════════════════════════════════════ */

function DietDot({ type }: { type: string }) {
  const cfg = DIET_BADGE[type] ?? DIET_BADGE.veg;
  return (
    <span className="flex items-center gap-1.5" title={cfg.label}>
      <span className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
      <span className="text-xs text-muted">{cfg.label}</span>
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SectionCard({
  children,
  isDark,
  className,
}: {
  children: React.ReactNode;
  isDark: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all',
        isDark
          ? 'bg-gray-900/50 border-gray-800'
          : 'bg-white border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function inputCn(isDark: boolean): string {
  return cn(
    'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/40',
    isDark
      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  );
}

function primaryBtnCn(): string {
  return 'px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]';
}

function dangerBtnCn(): string {
  return 'px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-xs font-medium hover:bg-red-500/20 transition-colors';
}

function ghostBtnCn(isDark: boolean): string {
  return cn(
    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
    isDark
      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  );
}

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */

export function RestaurantManagePage() {
  const { isDark } = useTheme();

  /* --- Global state --- */
  const [activeTab, setActiveTab] = useState<TabKey>('restaurants');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);

  /* --- Restaurants tab --- */
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormData>(EMPTY_RESTAURANT_FORM);
  const [editingRestaurantId, setEditingRestaurantId] = useState<number | null>(null);

  /* --- Menu tab --- */
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>(EMPTY_CATEGORY_FORM);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState<ItemFormData>(EMPTY_ITEM_FORM);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  /* --- Tables tab --- */
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [showTableForm, setShowTableForm] = useState(false);
  const [tableForm, setTableForm] = useState<TableFormData>(EMPTY_TABLE_FORM);
  const [expandedQr, setExpandedQr] = useState<number | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  /* ═══════════════════════════════════════════
     Data fetching
     ═══════════════════════════════════════════ */

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await restaurantApi.list();
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (err) {
      log.error('Failed to load restaurants', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantId]);

  const fetchCategories = useCallback(async (restaurantId: number) => {
    try {
      setLoadingCategories(true);
      const data = await categoryApi.list(restaurantId);
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategoryId(data[0].id);
      } else {
        setSelectedCategoryId(null);
        setItems([]);
      }
    } catch (err) {
      log.error('Failed to load categories', err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchItems = useCallback(async (categoryId: number) => {
    try {
      setLoadingItems(true);
      const data = await menuItemApi.list(categoryId);
      setItems(data);
    } catch (err) {
      log.error('Failed to load items', err);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const fetchTables = useCallback(async (restaurantId: number) => {
    try {
      setLoadingTables(true);
      const data = await tableApi.list(restaurantId);
      setTables(data);
    } catch (err) {
      log.error('Failed to load tables', err);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    if (selectedRestaurantId && activeTab === 'menu') {
      fetchCategories(selectedRestaurantId);
    }
  }, [selectedRestaurantId, activeTab, fetchCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchItems(selectedCategoryId);
    }
  }, [selectedCategoryId, fetchItems]);

  useEffect(() => {
    if (selectedRestaurantId && activeTab === 'tables') {
      fetchTables(selectedRestaurantId);
    }
  }, [selectedRestaurantId, activeTab, fetchTables]);

  /* ═══════════════════════════════════════════
     Restaurant CRUD
     ═══════════════════════════════════════════ */

  const handleRestaurantSubmit = async () => {
    try {
      if (editingRestaurantId) {
        const updated = await restaurantApi.update(editingRestaurantId, restaurantForm);
        setRestaurants((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await restaurantApi.create(restaurantForm);
        setRestaurants((prev) => [...prev, created]);
        if (!selectedRestaurantId) setSelectedRestaurantId(created.id);
      }
      resetRestaurantForm();
    } catch (err) {
      log.error('Failed to save restaurant', err);
    }
  };

  const handleEditRestaurant = (r: Restaurant) => {
    setRestaurantForm({
      name: r.name,
      description: r.description ?? '',
      logo_url: r.logo_url ?? '',
      phone: r.phone ?? '',
      address: r.address ?? '',
      currency: r.currency,
      tax_percent: r.tax_percent,
      primary_color: r.primary_color,
      accent_color: r.accent_color,
      cover_image_url: r.cover_image_url ?? '',
      template_id: r.template_id ?? 'pure-white',
    });
    setEditingRestaurantId(r.id);
    setShowRestaurantForm(true);
  };

  const handleDeleteRestaurant = async (id: number) => {
    try {
      await restaurantApi.remove(id);
      setRestaurants((prev) => prev.filter((r) => r.id !== id));
      if (selectedRestaurantId === id) {
        setSelectedRestaurantId(restaurants.find((r) => r.id !== id)?.id ?? null);
      }
    } catch (err) {
      log.error('Failed to delete restaurant', err);
    }
  };

  const resetRestaurantForm = () => {
    setRestaurantForm(EMPTY_RESTAURANT_FORM);
    setEditingRestaurantId(null);
    setShowRestaurantForm(false);
  };

  /* ═══════════════════════════════════════════
     Category CRUD
     ═══════════════════════════════════════════ */

  const handleCategorySubmit = async () => {
    if (!selectedRestaurantId) return;
    try {
      if (editingCategoryId) {
        const updated = await categoryApi.update(editingCategoryId, categoryForm);
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await categoryApi.create(selectedRestaurantId, categoryForm);
        setCategories((prev) => [...prev, created]);
        if (!selectedCategoryId) setSelectedCategoryId(created.id);
      }
      resetCategoryForm();
    } catch (err) {
      log.error('Failed to save category', err);
    }
  };

  const handleEditCategory = (c: MenuCategory) => {
    setCategoryForm({ name: c.name, icon: c.icon ?? '', sort_order: c.sort_order });
    setEditingCategoryId(c.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryApi.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) {
        const remaining = categories.filter((c) => c.id !== id);
        setSelectedCategoryId(remaining[0]?.id ?? null);
      }
    } catch (err) {
      log.error('Failed to delete category', err);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  /* ═══════════════════════════════════════════
     Item CRUD
     ═══════════════════════════════════════════ */

  const handleItemSubmit = async () => {
    if (!selectedCategoryId) return;
    try {
      if (editingItemId) {
        const updated = await menuItemApi.update(editingItemId, itemForm);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await menuItemApi.create(selectedCategoryId, itemForm);
        setItems((prev) => [...prev, created]);
      }
      resetItemForm();
    } catch (err) {
      log.error('Failed to save item', err);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setItemForm({
      name: item.name,
      description: item.description ?? '',
      image_url: item.image_url ?? '',
      price: item.price,
      diet_type: item.diet_type,
      preparation_time: item.preparation_time ?? 15,
    });
    setEditingItemId(item.id);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await menuItemApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      log.error('Failed to delete item', err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await menuItemApi.update(item.id, {
        is_available: !item.is_available,
      });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      log.error('Failed to toggle availability', err);
    }
  };

  const resetItemForm = () => {
    setItemForm(EMPTY_ITEM_FORM);
    setEditingItemId(null);
    setShowItemForm(false);
  };

  /* ═══════════════════════════════════════════
     Table CRUD
     ═══════════════════════════════════════════ */

  const handleTableSubmit = async () => {
    if (!selectedRestaurantId) return;
    try {
      const created = await tableApi.create(selectedRestaurantId, {
        table_number: tableForm.table_number,
        label: tableForm.label || undefined,
        capacity: tableForm.capacity,
      });
      setTables((prev) => [...prev, created]);
      resetTableForm();
    } catch (err) {
      log.error('Failed to create table', err);
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await tableApi.remove(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      log.error('Failed to delete table', err);
    }
  };

  const resetTableForm = () => {
    setTableForm(EMPTY_TABLE_FORM);
    setShowTableForm(false);
  };

  /* ═══════════════════════════════════════════
     Render: Loading state
     ═══════════════════════════════════════════ */

  if (loading) return <Spinner />;

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId) ?? null;
  const needsRestaurant = activeTab !== 'restaurants' && !selectedRestaurant;

  /* ═══════════════════════════════════════════
     Render: Restaurants tab
     ═══════════════════════════════════════════ */

  function renderRestaurantsTab() {
    return (
      <motion.div key="restaurants" {...fadeSlide}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-heading">Your Restaurants</h2>
            <p className="text-sm text-muted mt-0.5">
              Manage your restaurant profiles
            </p>
          </div>
          <button
            onClick={() => {
              resetRestaurantForm();
              setShowRestaurantForm(true);
            }}
            className={primaryBtnCn()}
          >
            + New Restaurant
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showRestaurantForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <SectionCard isDark={isDark}>
                <h3 className="text-sm font-semibold text-heading mb-4">
                  {editingRestaurantId ? 'Edit Restaurant' : 'Create Restaurant'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Name *">
                    <input
                      className={inputCn(isDark)}
                      placeholder="Restaurant name"
                      value={restaurantForm.name}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Phone">
                    <input
                      className={inputCn(isDark)}
                      placeholder="+91 98765 43210"
                      value={restaurantForm.phone}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Description">
                    <input
                      className={inputCn(isDark)}
                      placeholder="Brief description"
                      value={restaurantForm.description}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          description: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Address">
                    <input
                      className={inputCn(isDark)}
                      placeholder="Full address"
                      value={restaurantForm.address}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          address: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Logo URL">
                    <input
                      className={inputCn(isDark)}
                      placeholder="https://..."
                      value={restaurantForm.logo_url}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          logo_url: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Cover Image URL">
                    <input
                      className={inputCn(isDark)}
                      placeholder="https://..."
                      value={restaurantForm.cover_image_url}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          cover_image_url: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Currency">
                    <select
                      className={inputCn(isDark)}
                      value={restaurantForm.currency}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          currency: e.target.value,
                        }))
                      }
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Tax %">
                    <input
                      type="number"
                      className={inputCn(isDark)}
                      value={restaurantForm.tax_percent}
                      onChange={(e) =>
                        setRestaurantForm((f) => ({
                          ...f,
                          tax_percent: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Primary Color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                        value={restaurantForm.primary_color}
                        onChange={(e) =>
                          setRestaurantForm((f) => ({
                            ...f,
                            primary_color: e.target.value,
                          }))
                        }
                      />
                      <input
                        className={inputCn(isDark)}
                        value={restaurantForm.primary_color}
                        onChange={(e) =>
                          setRestaurantForm((f) => ({
                            ...f,
                            primary_color: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </FormField>
                  <FormField label="Accent Color">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                        value={restaurantForm.accent_color}
                        onChange={(e) =>
                          setRestaurantForm((f) => ({
                            ...f,
                            accent_color: e.target.value,
                          }))
                        }
                      />
                      <input
                        className={inputCn(isDark)}
                        value={restaurantForm.accent_color}
                        onChange={(e) =>
                          setRestaurantForm((f) => ({
                            ...f,
                            accent_color: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </FormField>
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Menu Template
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                    {menuTemplateConfigs.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setRestaurantForm(prev => ({ ...prev, template_id: t.id }))}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          restaurantForm.template_id === t.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{t.preview}</span>
                        <p className="text-xs font-medium mt-1 text-gray-800 dark:text-gray-200 truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{t.category}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <button onClick={handleRestaurantSubmit} className={primaryBtnCn()}>
                    {editingRestaurantId ? 'Update' : 'Create'}
                  </button>
                  <button onClick={resetRestaurantForm} className={ghostBtnCn(isDark)}>
                    Cancel
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {restaurants.length === 0 && !showRestaurantForm && (
          <motion.div {...fadeSlide} className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-xl font-bold text-heading mb-2">No restaurants yet</h2>
            <p className="text-sm text-muted mb-6">
              Create your first restaurant to start building your digital menu.
            </p>
            <button
              onClick={() => setShowRestaurantForm(true)}
              className={primaryBtnCn()}
            >
              Create Your First Restaurant
            </button>
          </motion.div>
        )}

        {/* Restaurant cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r, i) => (
            <motion.div
              key={r.id}
              {...staggerItem}
              transition={{ delay: i * 0.05 }}
            >
              <SectionCard isDark={isDark} className="hover:shadow-lg group">
                <div className="flex items-start gap-3 mb-3">
                  {r.logo_url ? (
                    <img
                      src={r.logo_url}
                      alt={r.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: r.primary_color + '22', color: r.primary_color }}
                    >
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-heading truncate">{r.name}</h3>
                    <p className="text-xs text-muted truncate">{r.address || 'No address'}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      r.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400'
                    )}
                  >
                    {r.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {r.description && (
                  <p className="text-xs text-muted mb-3 line-clamp-2">{r.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  <span>{r.currency}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-400" />
                  <span>Tax: {r.tax_percent}%</span>
                  {r.phone && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-400" />
                      <span>{r.phone}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleEditRestaurant(r)}
                    className={ghostBtnCn(isDark)}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRestaurantId(r.id);
                      setActiveTab('menu');
                    }}
                    className={ghostBtnCn(isDark)}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRestaurantId(r.id);
                      setActiveTab('tables');
                    }}
                    className={ghostBtnCn(isDark)}
                  >
                    Tables
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDeleteRestaurant(r.id)}
                    className={dangerBtnCn()}
                  >
                    Delete
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Menu Editor tab
     ═══════════════════════════════════════════ */

  function renderMenuTab() {
    if (needsRestaurant) {
      return (
        <motion.div key="menu-empty" {...fadeSlide} className="text-center py-20">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-bold text-heading mb-2">No restaurant selected</h2>
          <p className="text-sm text-muted">Create a restaurant first on the Restaurants tab.</p>
        </motion.div>
      );
    }

    return (
      <motion.div key="menu" {...fadeSlide}>
        {/* Restaurant selector */}
        <div className="mb-6">
          <FormField label="Restaurant">
            <select
              className={inputCn(isDark)}
              value={selectedRestaurantId ?? ''}
              onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Categories */}
          <div className="lg:col-span-4">
            <SectionCard isDark={isDark}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-heading">Categories</h3>
                <button
                  onClick={() => {
                    resetCategoryForm();
                    setShowCategoryForm(true);
                  }}
                  className={primaryBtnCn()}
                >
                  + Add
                </button>
              </div>

              {/* Category form */}
              <AnimatePresence>
                {showCategoryForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="space-y-3 p-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700">
                      <FormField label="Category Name *">
                        <input
                          className={inputCn(isDark)}
                          placeholder="e.g. Starters"
                          value={categoryForm.name}
                          onChange={(e) =>
                            setCategoryForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </FormField>
                      <FormField label="Icon (emoji)">
                        <input
                          className={inputCn(isDark)}
                          placeholder="🍜"
                          value={categoryForm.icon}
                          onChange={(e) =>
                            setCategoryForm((f) => ({ ...f, icon: e.target.value }))
                          }
                        />
                      </FormField>
                      <FormField label="Sort Order">
                        <input
                          type="number"
                          className={inputCn(isDark)}
                          value={categoryForm.sort_order}
                          onChange={(e) =>
                            setCategoryForm((f) => ({
                              ...f,
                              sort_order: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </FormField>
                      <div className="flex gap-2">
                        <button onClick={handleCategorySubmit} className={primaryBtnCn()}>
                          {editingCategoryId ? 'Update' : 'Add'}
                        </button>
                        <button onClick={resetCategoryForm} className={ghostBtnCn(isDark)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category list */}
              {loadingCategories ? (
                <Spinner />
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No categories yet</p>
              ) : (
                <div className="space-y-1">
                  {categories
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm',
                          selectedCategoryId === cat.id
                            ? isDark
                              ? 'bg-indigo-500/15 text-indigo-400'
                              : 'bg-indigo-50 text-indigo-700'
                            : isDark
                              ? 'hover:bg-gray-800 text-gray-300'
                              : 'hover:bg-gray-50 text-gray-700'
                        )}
                      >
                        <span>{cat.icon || '📁'}</span>
                        <span className="flex-1 font-medium truncate">{cat.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(cat);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-muted hover:text-heading transition-opacity"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-opacity"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right: Menu Items */}
          <div className="lg:col-span-8">
            <SectionCard isDark={isDark}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-heading">
                  {selectedCategoryId
                    ? `Items — ${categories.find((c) => c.id === selectedCategoryId)?.name ?? ''}`
                    : 'Menu Items'}
                </h3>
                {selectedCategoryId && (
                  <button
                    onClick={() => {
                      resetItemForm();
                      setShowItemForm(true);
                    }}
                    className={primaryBtnCn()}
                  >
                    + Add Item
                  </button>
                )}
              </div>

              {/* Item form */}
              <AnimatePresence>
                {showItemForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700">
                      <FormField label="Item Name *">
                        <input
                          className={inputCn(isDark)}
                          placeholder="e.g. Butter Chicken"
                          value={itemForm.name}
                          onChange={(e) =>
                            setItemForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </FormField>
                      <FormField label="Price *">
                        <input
                          type="number"
                          step="0.01"
                          className={inputCn(isDark)}
                          value={itemForm.price}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              price: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </FormField>
                      <FormField label="Description">
                        <input
                          className={inputCn(isDark)}
                          placeholder="Brief description"
                          value={itemForm.description}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                      <FormField label="Image URL">
                        <input
                          className={inputCn(isDark)}
                          placeholder="https://..."
                          value={itemForm.image_url}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              image_url: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                      <FormField label="Diet Type">
                        <select
                          className={inputCn(isDark)}
                          value={itemForm.diet_type}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              diet_type: e.target.value as ItemFormData['diet_type'],
                            }))
                          }
                        >
                          <option value="veg">Veg</option>
                          <option value="non_veg">Non-Veg</option>
                          <option value="vegan">Vegan</option>
                          <option value="egg">Egg</option>
                        </select>
                      </FormField>
                      <FormField label="Prep Time (min)">
                        <input
                          type="number"
                          className={inputCn(isDark)}
                          value={itemForm.preparation_time}
                          onChange={(e) =>
                            setItemForm((f) => ({
                              ...f,
                              preparation_time: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      </FormField>
                      <div className="md:col-span-2 flex gap-2">
                        <button onClick={handleItemSubmit} className={primaryBtnCn()}>
                          {editingItemId ? 'Update Item' : 'Add Item'}
                        </button>
                        <button onClick={resetItemForm} className={ghostBtnCn(isDark)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Item list */}
              {!selectedCategoryId ? (
                <p className="text-sm text-muted text-center py-12">
                  Select a category to view its items
                </p>
              ) : loadingItems ? (
                <Spinner />
              ) : items.length === 0 ? (
                <p className="text-sm text-muted text-center py-12">
                  No items in this category yet
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      {...staggerItem}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        'flex items-center gap-4 p-3 rounded-xl border transition-all',
                        isDark
                          ? 'border-gray-800 hover:border-gray-700'
                          : 'border-gray-100 hover:border-gray-200'
                      )}
                    >
                      {/* Thumbnail */}
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className={cn(
                            'w-14 h-14 rounded-lg flex items-center justify-center text-xl flex-shrink-0',
                            isDark ? 'bg-gray-800' : 'bg-gray-100'
                          )}
                        >
                          🍽
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <DietDot type={item.diet_type} />
                          <span className="text-sm font-semibold text-heading truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="font-bold text-heading">
                            {selectedRestaurant?.currency ?? 'INR'}{' '}
                            {item.price.toFixed(2)}
                          </span>
                          {item.preparation_time && (
                            <span>~{item.preparation_time} min</span>
                          )}
                        </div>
                      </div>

                      {/* Availability toggle */}
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors',
                          item.is_available
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                        )}
                      >
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className={ghostBtnCn(isDark)}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className={dangerBtnCn()}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════
     Render: Tables & QR tab
     ═══════════════════════════════════════════ */

  function renderTablesTab() {
    if (needsRestaurant) {
      return (
        <motion.div key="tables-empty" {...fadeSlide} className="text-center py-20">
          <div className="text-5xl mb-4">🪑</div>
          <h2 className="text-lg font-bold text-heading mb-2">No restaurant selected</h2>
          <p className="text-sm text-muted">Create a restaurant first on the Restaurants tab.</p>
        </motion.div>
      );
    }

    return (
      <motion.div key="tables" {...fadeSlide}>
        {/* Restaurant selector */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <FormField label="Restaurant">
              <select
                className={inputCn(isDark)}
                value={selectedRestaurantId ?? ''}
                onChange={(e) => setSelectedRestaurantId(Number(e.target.value))}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <button
            onClick={() => {
              resetTableForm();
              setShowTableForm(true);
            }}
            className={cn(primaryBtnCn(), 'mt-5')}
          >
            + Add Table
          </button>
        </div>

        {/* Table form */}
        <AnimatePresence>
          {showTableForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <SectionCard isDark={isDark}>
                <h3 className="text-sm font-semibold text-heading mb-4">Add Table</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Table Number *">
                    <input
                      className={inputCn(isDark)}
                      placeholder="e.g. T1"
                      value={tableForm.table_number}
                      onChange={(e) =>
                        setTableForm((f) => ({ ...f, table_number: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Label">
                    <input
                      className={inputCn(isDark)}
                      placeholder="e.g. Window Seat"
                      value={tableForm.label}
                      onChange={(e) =>
                        setTableForm((f) => ({ ...f, label: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Capacity">
                    <input
                      type="number"
                      className={inputCn(isDark)}
                      value={tableForm.capacity}
                      onChange={(e) =>
                        setTableForm((f) => ({
                          ...f,
                          capacity: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </FormField>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleTableSubmit} className={primaryBtnCn()}>
                    Create Table
                  </button>
                  <button onClick={resetTableForm} className={ghostBtnCn(isDark)}>
                    Cancel
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table list */}
        {loadingTables ? (
          <Spinner />
        ) : tables.length === 0 ? (
          <motion.div {...fadeSlide} className="text-center py-16">
            <div className="text-5xl mb-4">🪑</div>
            <h2 className="text-lg font-bold text-heading mb-2">No tables yet</h2>
            <p className="text-sm text-muted mb-4">
              Add tables and generate QR codes for each one.
            </p>
            <button
              onClick={() => setShowTableForm(true)}
              className={primaryBtnCn()}
            >
              Add Your First Table
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table, i) => (
              <motion.div
                key={table.id}
                {...staggerItem}
                transition={{ delay: i * 0.04 }}
              >
                <SectionCard isDark={isDark} className="hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-heading">
                        Table {table.table_number}
                      </h4>
                      {table.label && (
                        <p className="text-xs text-muted">{table.label}</p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize',
                        TABLE_STATUS_STYLE[table.status] ?? TABLE_STATUS_STYLE.available
                      )}
                    >
                      {table.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted mb-3">
                    Capacity: {table.capacity} seats
                  </p>

                  {/* QR toggle */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() =>
                        setExpandedQr(expandedQr === table.id ? null : table.id)
                      }
                      className={ghostBtnCn(isDark)}
                    >
                      {expandedQr === table.id ? 'Hide QR' : 'Show QR'}
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className={dangerBtnCn()}
                    >
                      Delete
                    </button>
                  </div>

                  {/* QR code */}
                  <AnimatePresence>
                    {expandedQr === table.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                          <div className="bg-white p-3 rounded-xl">
                            <QRCodeSVG
                              value={`${window.location.origin}/menu/${table.qr_token}`}
                              size={200}
                              level="H"
                            />
                          </div>
                          <p className="text-[10px] text-muted text-center break-all max-w-[220px]">
                            {window.location.origin}/menu/{table.qr_token}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SectionCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  /* ═══════════════════════════════════════════
     Main render
     ═══════════════════════════════════════════ */

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">Restaurant Management</h1>
        <p className="text-sm text-muted mt-1">
          Manage your restaurants, menus, and table QR codes
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.key
                ? isDark
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'bg-indigo-50 text-indigo-700'
                : isDark
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'restaurants' && renderRestaurantsTab()}
        {activeTab === 'menu' && renderMenuTab()}
        {activeTab === 'tables' && renderTablesTab()}
      </AnimatePresence>
    </div>
  );
}
