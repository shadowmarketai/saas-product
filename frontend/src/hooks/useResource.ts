import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { Product, Tenant, Plan } from '@/types';

export function useProducts(page = 1) {
  return useQuery({
    queryKey: ['products', page],
    queryFn: () => api.get<Product[]>(`/products?skip=${(page - 1) * 20}&limit=20`).then((r) => r.data),
  });
}

export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get<Tenant[]>('/tenants').then((r) => r.data),
  });
}

export function usePlans(productType?: string) {
  return useQuery({
    queryKey: ['plans', productType],
    queryFn: () =>
      api.get<Plan[]>('/subscriptions/plans', { params: { product_type: productType } }).then((r) => r.data),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { product_type: string; name: string; customer_id: number; config_data?: Record<string, unknown> }) =>
      api.post('/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
