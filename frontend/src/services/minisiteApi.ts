import api from './api';
import type { MiniSiteData, MiniSiteCreatePayload, MiniSiteUpdatePayload, MiniSitePublicData } from '@/types/minisite';

export const minisiteApi = {
  list: () => api.get<MiniSiteData[]>('/minisites/').then((r) => r.data),

  get: (id: number) => api.get<MiniSiteData>(`/minisites/${id}`).then((r) => r.data),

  create: (data: MiniSiteCreatePayload) =>
    api.post<MiniSiteData>('/minisites/', data).then((r) => r.data),

  update: (id: number, data: MiniSiteUpdatePayload) =>
    api.put<MiniSiteData>(`/minisites/${id}`, data).then((r) => r.data),

  publish: (id: number) =>
    api.post<MiniSiteData>(`/minisites/${id}/publish`).then((r) => r.data),

  archive: (id: number) =>
    api.post<MiniSiteData>(`/minisites/${id}/archive`).then((r) => r.data),

  remove: (id: number) => api.delete(`/minisites/${id}`),

  getPublic: (slug: string) =>
    api.get<MiniSitePublicData>(`/minisites/public/${slug}`).then((r) => r.data),
};
