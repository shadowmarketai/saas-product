/* QR Menu + Smart Ordering System types */

export interface Restaurant {
  id: number;
  user_id: number;
  tenant_id: number | null;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  tax_percent: number;
  primary_color: string;
  accent_color: string;
  template_id: string;
  is_active: boolean;
  accept_orders: boolean;
  created_at: string | null;
}

export type RestaurantCreatePayload = Omit<
  Restaurant,
  'id' | 'user_id' | 'tenant_id' | 'slug' | 'is_active' | 'accept_orders' | 'created_at'
>;

export interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  diet_type: 'veg' | 'non_veg' | 'vegan' | 'egg';
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  preparation_time: number | null;
}

export interface RestaurantTable {
  id: number;
  restaurant_id: number;
  table_number: string;
  label: string | null;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qr_token: string;
}

export interface OrderItem {
  id: number;
  menu_item_id: number | null;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
}

export interface Order {
  id: number;
  restaurant_id: number;
  table_id: number | null;
  order_number: string;
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  notes: string | null;
  total_amount: number;
  call_waiter: boolean;
  request_bill: boolean;
  items: OrderItem[];
  table_number: string | null;
  placed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  served_at: string | null;
}

/* Public menu response (customer-facing) */

export interface PublicMenuItem {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  diet_type: 'veg' | 'non_veg' | 'vegan' | 'egg';
  is_available: boolean;
  is_popular: boolean;
  preparation_time: number | null;
}

export interface PublicMenuCategory {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  items: PublicMenuItem[];
}

export interface PublicMenu {
  restaurant_name: string;
  restaurant_slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  currency: string;
  tax_percent: number;
  primary_color: string;
  accent_color: string;
  template_id: string;
  table_number: string;
  table_id: number;
  categories: PublicMenuCategory[];
}

/* Cart (frontend-only state) */

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  diet_type: string;
}
