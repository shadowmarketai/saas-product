import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import type { Product } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
};

const POST_TYPES = ['festival', 'offer', 'product', 'event', 'custom'];
const TONES = ['professional', 'fun', 'urgent'];
const PLATFORMS: { key: string; icon: string; label: string }[] = [
  { key: 'instagram', icon: '📸', label: 'Instagram' },
  { key: 'facebook', icon: '👤', label: 'Facebook' },
  { key: 'whatsapp', icon: '💬', label: 'WhatsApp' },
];

interface CaptionResult {
  captions: Record<string, string>;
  hashtags: string[];
  emojis: string[];
}

interface AiPanelProps {
  businessName: string;
  onClose: () => void;
}

function AiCaptionPanel({ businessName, onClose }: AiPanelProps) {
  const [form, setForm] = useState({ business_name: businessName, post_type: 'festival', details: '', tone: 'fun' });
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { isDark } = useTheme();
  const toast = useToast();

  const generate = async () => {
    setGenerating(true);
    toast.info('Generating captions...');
    try {
      const res = await api.post<CaptionResult>('/ai/generate-caption', { ...form, platforms: ['instagram', 'facebook', 'whatsapp'] });
      setResult(res.data);
    } finally {
      setGenerating(false);
    }
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={cn('w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden', isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-heading">✨ AI Caption Generator</h2>
            <p className="text-xs text-muted mt-0.5">Generate social media captions for all platforms</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Form */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Business Name</label>
              <input
                value={form.business_name}
                onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/30', isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200')}
                placeholder="e.g. Spice Garden"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1 block">Post Type</label>
              <select
                value={form.post_type}
                onChange={(e) => setForm((f) => ({ ...f, post_type: e.target.value }))}
                className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 capitalize', isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200')}
              >
                {POST_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Details / Offer</label>
            <textarea
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              rows={2}
              className={cn('w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none', isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200')}
              placeholder="e.g. 50% off on all biryani this weekend"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted mb-1 block">Tone</label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, tone: t }))}
                  className={cn('px-4 py-2 rounded-xl text-xs font-medium capitalize transition-colors border', form.tone === t ? 'bg-indigo-600 text-white border-indigo-600' : isDark ? 'border-gray-700 text-gray-400 hover:border-gray-600' : 'border-gray-200 text-gray-600 hover:border-gray-300')}
                >
                  {t === 'professional' ? '💼' : t === 'fun' ? '🎉' : '🔥'} {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !form.business_name}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? '✨ Generating...' : '✨ Generate Captions'}
          </button>

          {/* Results */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Generated Captions</p>
              {PLATFORMS.map(({ key, icon, label }) => result.captions[key] && (
                <div key={key} className={cn('rounded-xl p-4', isDark ? 'bg-gray-800' : 'bg-gray-50')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-heading">{icon} {label}</span>
                    <button
                      onClick={() => copy(result.captions[key], key)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      {copied === key ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-body whitespace-pre-wrap leading-relaxed">{result.captions[key]}</p>
                </div>
              ))}
              {result.hashtags.length > 0 && (
                <div className={cn('rounded-xl p-4', isDark ? 'bg-gray-800' : 'bg-gray-50')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-heading"># Hashtags</span>
                    <button onClick={() => copy(result.hashtags.join(' '), 'hashtags')} className="text-xs font-medium text-indigo-600">
                      {copied === 'hashtags' ? '✓ Copied!' : 'Copy all'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SocialPosterPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPanel, setAiPanel] = useState<{ open: boolean; businessName: string }>({ open: false, businessName: '' });

  useEffect(() => {
    api.get<Product[]>('/products/', { params: { product_type: 'social_poster' } })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await api.delete(`/products/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Deleted');
  };

  const handlePublish = async (id: number) => {
    const res = await api.patch<Product>(`/products/${id}`, { is_published: true });
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* AI Caption Panel Modal */}
      <AnimatePresence>
        {aiPanel.open && (
          <AiCaptionPanel businessName={aiPanel.businessName} onClose={() => setAiPanel({ open: false, businessName: '' })} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">Social Posters</h1>
          <p className="text-sm text-muted mt-1">AI-powered social media captions and posters</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAiPanel({ open: true, businessName: '' })}
            className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
          >
            ✨ AI Captions
          </button>
          <button
            onClick={() => navigate('new')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            + Create Poster
          </button>
        </div>
      </div>

      {/* Empty state */}
      {products.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-xl font-bold text-heading mb-2">No social posters yet</h2>
          <p className="text-sm text-muted mb-6">Create AI-powered social posters for festivals, offers, and events.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setAiPanel({ open: true, businessName: '' })} className="px-5 py-2.5 rounded-xl border border-purple-200 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors">
              ✨ Try AI Captions
            </button>
            <button onClick={() => navigate('new')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg">
              Create First Poster
            </button>
          </div>
        </motion.div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, i) => {
          const status = product.is_published ? 'published' : 'draft';
          const businessName = (product.config_data?.business_name as string) || product.name;
          const totalShared = (product.config_data?.total_shared as number) ?? 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn('rounded-2xl border p-5 transition-all hover:shadow-lg', isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300')}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold', isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700')}>🎨</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-heading truncate">{businessName}</h3>
                  <p className="text-xs text-muted truncate">{product.name}</p>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block', STATUS_COLORS[status])}>{status}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-xs text-muted">
                <span>📤 {totalShared} shared</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setAiPanel({ open: true, businessName })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors"
                >
                  ✨ AI Caption
                </button>
                <button
                  onClick={() => navigate(`${product.id}/edit`)}
                  className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                >
                  Edit
                </button>
                {!product.is_published && (
                  <button onClick={() => handlePublish(product.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                    Publish
                  </button>
                )}
                {product.is_published && (
                  <a href={`/p/${product.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors">
                    View
                  </a>
                )}
                <button onClick={() => handleDelete(product.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto">
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
