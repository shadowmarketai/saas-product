import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { Product, ProductType, User } from '@/types';

const TYPE_ICONS: Record<ProductType, string> = {
  vcard: '💼', website: '🌐', google_reviews: '⭐', qr_menu: '🍽️',
  social_poster: '🎨', link_in_bio: '🔗', whatsapp_chatbot: '💬',
};

const TYPE_COLORS: Record<ProductType, string> = {
  vcard: '#6366F1', website: '#0EA5E9', google_reviews: '#F59E0B',
  qr_menu: '#EF4444', social_poster: '#EC4899', link_in_bio: '#8B5CF6',
  whatsapp_chatbot: '#10B981',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

function GradStatCard({ icon, value, label, gradient }: { icon: string; value: number | string; label: string; gradient: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-card rounded-2xl p-5 shadow-md border border-theme relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: gradient }} />
      <span className="text-2xl">{icon}</span>
      <p className="text-3xl font-bold mt-2 text-heading">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

export function FranchiseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Product[]>('/products/'),
      api.get<User[]>('/users/?role=customer'),
    ]).then(([prodRes, custRes]) => {
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);
      if (custRes.status === 'fulfilled') setCustomers(custRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const published = products.filter((p) => p.is_published).length;
  const productsByType = (Object.keys(TYPE_ICONS) as ProductType[]).map((type) => ({
    type,
    count: products.filter((p) => p.product_type === type).length,
  }));

  const quickActions = [
    { icon: '👥', title: 'Add Customer', desc: 'Onboard a new customer', path: '/franchise/customers' },
    { icon: '➕', title: 'Create Product', desc: 'Build a new digital product', path: '/franchise/create' },
    { icon: '🚀', title: 'Product Showcase', desc: 'Explore all 7 products', path: '/franchise/showcase' },
    { icon: '💰', title: 'View Earnings', desc: 'Track your commissions', path: '/franchise/earnings' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'Partner'} 🤝</h1>
            <p className="text-orange-200 mt-1 text-sm">Franchise Dashboard &middot; Gold Tier</p>
          </div>
          <button onClick={() => navigate('/franchise/create')} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
            ➕ Create Product
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <GradStatCard icon="👥" value={customers.length} label="Customers" gradient="linear-gradient(90deg, #6366F1, #8B5CF6)" />
        <GradStatCard icon="📦" value={products.length} label="Products" gradient="linear-gradient(90deg, #0EA5E9, #38BDF8)" />
        <GradStatCard icon="🌐" value={published} label="Published" gradient="linear-gradient(90deg, #10B981, #34D399)" />
        <GradStatCard icon="👁️" value={0} label="Total Views" gradient="linear-gradient(90deg, #F59E0B, #FBBF24)" />
        <GradStatCard icon="💰" value="₹0" label="Revenue" gradient="linear-gradient(90deg, #EF4444, #F87171)" />
        <GradStatCard icon="🏦" value="₹0" label="Earnings" gradient="linear-gradient(90deg, #EC4899, #F472B6)" />
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.title}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -3, scale: 1.02 }}
            onClick={() => navigate(action.path)}
            className="bg-card rounded-2xl p-5 shadow-md border border-theme text-left transition-shadow hover:shadow-lg"
          >
            <span className="text-3xl">{action.icon}</span>
            <h4 className="font-semibold text-heading mt-3">{action.title}</h4>
            <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
          </motion.button>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Customers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">👥 Recent Customers</h3>
            <button onClick={() => navigate('/franchise/customers')} className="text-xs text-indigo-500 font-medium">View All →</button>
          </div>
          {customers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No customers yet. Add your first customer!</p>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {(c.full_name || c.email)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{c.full_name || c.email}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Types */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme">
          <h3 className="text-lg font-semibold text-heading mb-4">📊 Products by Type</h3>
          <div className="space-y-3">
            {productsByType.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${TYPE_COLORS[type]}15` }}>
                  {TYPE_ICONS[type]}
                </div>
                <span className="text-sm font-medium text-gray-700 w-28 capitalize">{type.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: count > 0 ? `${Math.max(10, (count / Math.max(...productsByType.map(p => p.count), 1)) * 100)}%` : '0%', backgroundColor: TYPE_COLORS[type] }} />
                </div>
                <span className="text-sm font-bold text-heading w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/franchise/create')}
            className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm transition-transform hover:scale-[1.02] shadow-lg"
          >
            ➕ Create New Product
          </button>
        </motion.div>
      </div>
    </div>
  );
}
