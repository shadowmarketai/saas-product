import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import api from '@/services/api';
import type { Product, ProductType } from '@/types';

const PRODUCT_LABELS: Record<ProductType, string> = {
  vcard: 'vCard',
  website: 'Website',
  google_reviews: 'Reviews',
  qr_menu: 'QR Menu',
  social_poster: 'Poster',
  link_in_bio: 'Link Bio',
  whatsapp_chatbot: 'Chatbot',
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? { product_type: filter } : {};
    api.get<Product[]>('/products/', { params })
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">{products.length} products across all franchises</p>
      </motion.div>

      <div className="mt-6">
        <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm" value={filter} onChange={(e) => { setLoading(true); setFilter(e.target.value); }}>
          <option value="">All Types</option>
          {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4"><Badge label={PRODUCT_LABELS[p.product_type]} variant="info" /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.slug}</td>
                <td className="px-6 py-4"><Badge label={p.is_published ? 'Published' : 'Draft'} variant={p.is_published ? 'success' : 'neutral'} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
