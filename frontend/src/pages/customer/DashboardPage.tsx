import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/services/api';
import type { Product, ProductType, Analytics } from '@/types';

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

function StatCard({ icon, value, label, gradient }: { icon: string; value: number | string; label: string; gradient: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-card rounded-2xl p-5 shadow-md border border-theme relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: gradient }} />
      <span className="text-2xl">{icon}</span>
      <p className="text-3xl font-bold mt-2 text-heading">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </motion.div>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const publicUrl = `${window.location.origin}/p/${product.slug}`;
  const color = TYPE_COLORS[product.product_type];

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-card rounded-2xl shadow-md border border-theme overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${color}15` }}>
              {TYPE_ICONS[product.product_type]}
            </div>
            <div>
              <h4 className="font-semibold text-heading">{product.name}</h4>
              <p className="text-xs text-muted capitalize">{product.product_type.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${product.is_published ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
            {product.is_published ? 'Live' : 'Draft'}
          </span>
        </div>

        {product.is_published && (
          <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-50">
            <QRCodeSVG value={publicUrl} size={40} fgColor={color} />
            <div className="flex-1 min-w-0">
              <code className="text-[10px] text-muted bg-gray-50 px-2 py-0.5 rounded block truncate">{publicUrl}</code>
              <div className="flex gap-3 mt-1">
                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(publicUrl); }} className="text-[10px] font-medium" style={{ color }}>Copy</button>
                <a href={publicUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-medium" style={{ color }}>Open</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-medium text-green-600">WhatsApp</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickAction({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <motion.button
      variants={fadeUp}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-md border border-theme text-left w-full transition-shadow hover:shadow-lg"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm text-heading">{title}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
      <span className="text-gray-300">→</span>
    </motion.button>
  );
}

export function CustomerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      api.get<Product[]>('/products/'),
      api.get<Analytics>('/analytics/dashboard'),
    ]).then(([prodRes, analyticsRes]) => {
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const published = products.filter((p) => p.is_published).length;
  const views = analytics?.total_views || 0;
  const clicks = analytics?.total_clicks || 0;
  const scans = analytics?.total_scans || 0;
  const leads = analytics?.total_leads || 0;

  return (
    <div data-testid="dashboard">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back! 👋</h1>
            <p className="text-indigo-200 mt-1 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/dashboard/analytics')} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              📊 Analytics
            </button>
            <button onClick={() => navigate('/dashboard/support')} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              🎧 Support
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <StatCard icon="📦" value={products.length} label="Total Products" gradient="linear-gradient(90deg, #6366F1, #8B5CF6)" />
        <StatCard icon="🌐" value={published} label="Published" gradient="linear-gradient(90deg, #10B981, #34D399)" />
        <StatCard icon="👁️" value={views} label="Total Views" gradient="linear-gradient(90deg, #0EA5E9, #38BDF8)" />
        <StatCard icon="🖱️" value={clicks} label="Total Clicks" gradient="linear-gradient(90deg, #F59E0B, #FBBF24)" />
        <StatCard icon="📱" value={scans} label="QR Scans" gradient="linear-gradient(90deg, #EC4899, #F472B6)" />
        <StatCard icon="🎯" value={leads} label="Leads" gradient="linear-gradient(90deg, #EF4444, #F87171)" />
      </motion.div>

      {/* Product Performance */}
      {products.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme mt-6">
          <h3 className="text-lg font-semibold text-heading mb-4">📊 Product Overview</h3>
          <div className="space-y-3">
            {products.map((p) => {
              const color = TYPE_COLORS[p.product_type];
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-lg w-8">{TYPE_ICONS[p.product_type]}</span>
                  <span className="text-sm font-medium text-gray-700 w-32 truncate">{p.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, Math.random() * 80 + 20)}%`, backgroundColor: color }} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-muted'}`}>
                    {p.is_published ? 'Live' : 'Draft'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-heading mb-4">Your Products</h3>
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl p-12 shadow-md border border-theme text-center">
            <p className="text-5xl mb-4">📦</p>
            <h4 className="text-lg font-semibold text-heading">No products yet</h4>
            <p className="text-muted mt-2 text-sm">Contact your franchise partner to create your first digital product!</p>
          </motion.div>
        ) : (
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => navigate(`/dashboard/products/${product.id}/edit`)} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-heading mb-4">Quick Actions</h3>
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 gap-3">
          <QuickAction icon="💼" title="My VCards" desc="Create and manage digital visiting cards" onClick={() => navigate('/dashboard/vcards')} />
          <QuickAction icon="🌐" title="My Websites" desc="Build and publish your mini websites" onClick={() => navigate('/dashboard/websites')} />
          <QuickAction icon="🍽️" title="QR Menu" desc="Manage your digital restaurant menu" onClick={() => navigate('/dashboard/qrmenu')} />
          <QuickAction icon="📊" title="View All Analytics" desc="Track views, clicks, and leads" onClick={() => navigate('/dashboard/analytics')} />
          <QuickAction icon="💳" title="Billing & Plans" desc="Manage your subscriptions" onClick={() => navigate('/dashboard/billing')} />
          <QuickAction icon="🎧" title="Get Support" desc="Need help? Reach out to us" onClick={() => navigate('/dashboard/support')} />
          <QuickAction icon="📱" title="Share Products" desc="Share your products via QR or link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        </motion.div>
      </div>

      {/* Activity Timeline */}
      {products.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card rounded-2xl p-6 shadow-md border border-theme mt-6">
          <h3 className="text-lg font-semibold text-heading mb-4">Recent Activity</h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100" />
            {products.slice(0, 5).map((p, i) => (
              <div key={p.id} className="relative flex items-start gap-3">
                <div className="absolute left-[-18px] w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: TYPE_COLORS[p.product_type] }} />
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{p.name}</span>
                    {p.is_published ? ' was published' : ' is in draft'}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {i === 0 && ' · Latest'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
