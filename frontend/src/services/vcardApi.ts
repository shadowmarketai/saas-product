import api from './api';
import type { VCardData, VCardCreatePayload, VCardUpdatePayload, VCardPublicData } from '@/types/vcard';

export const vcardApi = {
  list: () => api.get<VCardData[]>('/vcards/').then((r) => r.data),

  get: (id: number) => api.get<VCardData>(`/vcards/${id}`).then((r) => r.data),

  create: (data: VCardCreatePayload) =>
    api.post<VCardData>('/vcards/', data).then((r) => r.data),

  update: (id: number, data: VCardUpdatePayload) =>
    api.put<VCardData>(`/vcards/${id}`, data).then((r) => r.data),

  publish: (id: number) =>
    api.post<VCardData>(`/vcards/${id}/publish`).then((r) => r.data),

  archive: (id: number) =>
    api.post<VCardData>(`/vcards/${id}/archive`).then((r) => r.data),

  remove: (id: number) => api.delete(`/vcards/${id}`),

  getPublic: (slug: string) =>
    api.get<VCardPublicData>(`/vcards/public/${slug}`).then((r) => r.data),

  trackClick: (slug: string) => api.post(`/vcards/public/${slug}/click`),

  trackShare: (slug: string) => api.post(`/vcards/public/${slug}/share`),
};
