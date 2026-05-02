import api from './api';
import type {
  Restaurant,
  MenuCategory,
  MenuItem,
  RestaurantTable,
  Order,
  PublicMenu,
} from '@/types/qrmenu';

const P = '/qrmenu';

/* ══════ Restaurants ══════ */

export const restaurantApi = {
  list: () => api.get<Restaurant[]>(`${P}/restaurants`).then((r) => r.data),
  get: (id: number) => api.get<Restaurant>(`${P}/restaurants/${id}`).then((r) => r.data),
  create: (data: Partial<Restaurant>) =>
    api.post<Restaurant>(`${P}/restaurants`, data).then((r) => r.data),
  update: (id: number, data: Partial<Restaurant>) =>
    api.put<Restaurant>(`${P}/restaurants/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`${P}/restaurants/${id}`),
};

/* ══════ Menu Categories ══════ */

export const categoryApi = {
  list: (restaurantId: number) =>
    api.get<MenuCategory[]>(`${P}/restaurants/${restaurantId}/categories`).then((r) => r.data),
  create: (restaurantId: number, data: Partial<MenuCategory>) =>
    api.post<MenuCategory>(`${P}/restaurants/${restaurantId}/categories`, data).then((r) => r.data),
  update: (id: number, data: Partial<MenuCategory>) =>
    api.put<MenuCategory>(`${P}/categories/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`${P}/categories/${id}`),
};

/* ══════ Menu Items ══════ */

export const menuItemApi = {
  list: (categoryId: number) =>
    api.get<MenuItem[]>(`${P}/categories/${categoryId}/items`).then((r) => r.data),
  create: (categoryId: number, data: Partial<MenuItem>) =>
    api.post<MenuItem>(`${P}/categories/${categoryId}/items`, data).then((r) => r.data),
  update: (id: number, data: Partial<MenuItem>) =>
    api.put<MenuItem>(`${P}/items/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`${P}/items/${id}`),
};

/* ══════ Tables ══════ */

export const tableApi = {
  list: (restaurantId: number) =>
    api.get<RestaurantTable[]>(`${P}/restaurants/${restaurantId}/tables`).then((r) => r.data),
  create: (restaurantId: number, data: { table_number: string; label?: string; capacity?: number }) =>
    api.post<RestaurantTable>(`${P}/restaurants/${restaurantId}/tables`, data).then((r) => r.data),
  update: (id: number, data: Partial<RestaurantTable>) =>
    api.put<RestaurantTable>(`${P}/tables/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`${P}/tables/${id}`),
};

/* ══════ Orders (Management — auth required) ══════ */

export const orderApi = {
  listActive: (restaurantId: number) =>
    api.get<Order[]>(`${P}/restaurants/${restaurantId}/orders/active`).then((r) => r.data),
  listAll: (restaurantId: number, status?: string) =>
    api.get<Order[]>(`${P}/restaurants/${restaurantId}/orders`, { params: status ? { status } : {} }).then((r) => r.data),
  updateStatus: (orderId: number, status: string) =>
    api.patch<Order>(`${P}/orders/${orderId}/status`, { status }).then((r) => r.data),
};

/* ══════ Public (No auth — customer facing) ══════ */

export const publicMenuApi = {
  getMenu: (qrToken: string) =>
    api.get<PublicMenu>(`${P}/public/menu/${qrToken}`).then((r) => r.data),
  placeOrder: (qrToken: string, data: { items: { menu_item_id: number; quantity: number; notes?: string }[]; notes?: string }) =>
    api.post<Order>(`${P}/public/order/${qrToken}`, data).then((r) => r.data),
  getOrders: (qrToken: string) =>
    api.get<Order[]>(`${P}/public/orders/${qrToken}`).then((r) => r.data),
  callWaiter: (orderId: number) =>
    api.post(`${P}/public/orders/${orderId}/call-waiter`),
  requestBill: (orderId: number) =>
    api.post(`${P}/public/orders/${orderId}/request-bill`),
};
