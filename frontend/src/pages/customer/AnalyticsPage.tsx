import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/StatCard';
import api from '@/services/api';
import type { Product, Analytics } from '@/types';

export function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Product[]>('/products/').then((r) => {
      setProducts(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId > 0) {
      api.get<Analytics>(`/analytics/product/${selectedId}`).then((r) => setAnalytics(r.data)).catch(() => setAnalytics(null));
    }
  }, [selectedId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your product performance</p>
      </motion.div>

      <div className="mt-6">
        <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm" value={selectedId} onChange={(e) => setSelectedId(Number(e.target.value))}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.product_type})</option>)}
        </select>
      </div>

      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatCard label="Total Views" value={analytics.total_views} icon="👁️" />
          <StatCard label="Total Clicks" value={analytics.total_clicks} icon="🖱️" />
          <StatCard label="QR Scans" value={analytics.total_scans} icon="📱" />
          <StatCard label="Leads" value={analytics.total_leads} icon="🎯" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-white rounded-2xl p-12 shadow-md border border-gray-100 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-500">
            {products.length === 0 ? 'No products yet. Analytics will appear once you have products.' : 'Select a product to view analytics.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
