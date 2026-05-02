import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import type { Product, ProductType, Tenant, Template } from '@/types';

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
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

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

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Tenant[]>('/tenants/'),
      api.get<Product[]>('/products/'),
      api.get<Template[]>('/templates/'),
      api.get('/users/'),
    ]).then(([tRes, pRes, tmRes, uRes]) => {
      if (tRes.status === 'fulfilled') setTenants(tRes.value.data);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
      if (tmRes.status === 'fulfilled') setTemplates(tmRes.value.data);
      if (uRes.status === 'fulfilled') setUserCount(Array.isArray(uRes.value.data) ? uRes.value.data.length : 0);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const published = products.filter((p) => p.is_published).length;
  const productsByType = (Object.keys(TYPE_ICONS) as ProductType[]).map((type) => ({
    type,
    count: products.filter((p) => p.product_type === type).length,
  }));
  const maxCount = Math.max(...productsByType.map((p) => p.count), 1);

  return (
    <div>
      {/* Platform Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">NexaStack Admin 🏛️</h1>
            <p className="text-indigo-300 mt-1 text-sm">Platform Overview &middot; {tenants.length} Franchise{tenants.length !== 1 ? 's' : ''} Active</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/super-admin/franchises')} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              🏢 Franchises
            </button>
            <button onClick={() => navigate('/super-admin/templates')} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              🎨 Templates
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <GradStatCard icon="🏢" value={tenants.length} label="Franchises" gradient="linear-gradient(90deg, #6366F1, #8B5CF6)" />
        <GradStatCard icon="👥" value={userCount} label="Total Users" gradient="linear-gradient(90deg, #0EA5E9, #38BDF8)" />
        <GradStatCard icon="📦" value={products.length} label="Products" gradient="linear-gradient(90deg, #10B981, #34D399)" />
        <GradStatCard icon="🌐" value={published} label="Published" gradient="linear-gradient(90deg, #F59E0B, #FBBF24)" />
        <GradStatCard icon="🎨" value={templates.length} label="Templates" gradient="linear-gradient(90deg, #EC4899, #F472B6)" />
        <GradStatCard icon="📋" value={19} label="Plans" gradient="linear-gradient(90deg, #8B5CF6, #A78BFA)" />
        <GradStatCard icon="💳" value={0} label="Subscriptions" gradient="linear-gradient(90deg, #EF4444, #F87171)" />
        <GradStatCard icon="💰" value="₹0" label="MRR" gradient="linear-gradient(90deg, #059669, #34D399)" />
      </motion.div>

      {/* Platform Health */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme mt-6">
        <h3 className="text-lg font-semibold text-heading mb-4">🏥 Platform Health</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Database', status: 'Healthy', icon: '🗄️' },
            { name: 'API Server', status: 'Running', icon: '⚡' },
            { name: 'Storage', status: 'OK', icon: '💾' },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-sm font-medium text-heading">{s.name}</p>
                <p className="text-xs text-green-600 font-medium">{s.status}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 ml-auto animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { icon: '🏢', title: 'Create Franchise', desc: 'Onboard a new partner', path: '/super-admin/franchises' },
          { icon: '🎨', title: 'Add Template', desc: 'Create product template', path: '/super-admin/templates' },
          { icon: '💳', title: 'Process Payouts', desc: 'Handle commission payouts', path: '/super-admin' },
          { icon: '📦', title: 'View Products', desc: 'Browse all products', path: '/super-admin/products' },
        ].map((action, i) => (
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
        {/* Recent Franchises */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-heading">🏢 Franchises</h3>
            <button onClick={() => navigate('/super-admin/franchises')} className="text-xs text-indigo-500 font-medium">Manage →</button>
          </div>
          {tenants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No franchises yet</p>
          ) : (
            <div className="space-y-3">
              {tenants.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.slug}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    t.tier === 'platinum' ? 'bg-purple-50 text-purple-600' :
                    t.tier === 'gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.tier}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Distribution */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme">
          <h3 className="text-lg font-semibold text-heading mb-4">📊 Product Distribution</h3>
          <div className="space-y-3">
            {productsByType.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-lg w-8">{TYPE_ICONS[type]}</span>
                <span className="text-sm font-medium text-gray-700 w-28 capitalize">{type.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: count > 0 ? `${(count / maxCount) * 100}%` : '0%', backgroundColor: TYPE_COLORS[type] }} />
                </div>
                <span className="text-sm font-bold w-8 text-right text-heading">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
