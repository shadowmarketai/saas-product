import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { Product } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
};

export function WhatsAppListPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Product[]>('/products/', { params: { product_type: 'whatsapp_chatbot' } })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePublish = async (id: number) => {
    const res = await api.patch<Product>(`/products/${id}`, { is_published: true });
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">WhatsApp Bots</h1>
          <p className="text-sm text-muted mt-1">Create and manage your WhatsApp chatbots</p>
        </div>
        <button
          onClick={() => navigate('new')}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#25D366' }}
        >
          + Create WhatsApp Bot
        </button>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-bold text-heading mb-2">No WhatsApp bots yet</h2>
          <p className="text-sm text-muted mb-6">Create your first WhatsApp chatbot and automate customer conversations.</p>
          <button
            onClick={() => navigate('new')}
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg"
            style={{ background: '#25D366' }}
          >
            Create Your First Bot
          </button>
        </motion.div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, i) => {
          const status = product.is_published ? 'published' : 'draft';
          const businessName = (product.config_data?.business_name as string) || product.name;
          const whatsappNumber = (product.config_data?.whatsapp_number as string) || '';
          const waLink = whatsappNumber
            ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
            : null;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'rounded-2xl border p-5 transition-all hover:shadow-lg group',
                isDark
                  ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: '#25D366' }}
                >
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-heading truncate">{businessName}</h3>
                  {whatsappNumber && (
                    <p className="text-xs text-muted truncate">{whatsappNumber}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[status])}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`${product.id}/edit`)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  Edit
                </button>
                {!product.is_published && (
                  <button
                    onClick={() => handlePublish(product.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                  >
                    Publish
                  </button>
                )}
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-white"
                    style={{ background: '#25D366' }}
                  >
                    Test Bot
                  </a>
                )}
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
