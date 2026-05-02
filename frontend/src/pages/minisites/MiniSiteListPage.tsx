import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { minisiteApi } from '@/services/minisiteApi';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import type { MiniSiteData } from '@/types/minisite';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400',
};

export function MiniSiteListPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [sites, setSites] = useState<MiniSiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  useEffect(() => {
    minisiteApi.list().then(setSites).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await minisiteApi.remove(id);
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePublish = async (id: number) => {
    const updated = await minisiteApi.publish(id);
    setSites((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/site/${slug}`);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">My Websites</h1>
          <p className="text-sm text-muted mt-1">Create and manage your mini websites</p>
        </div>
        <button onClick={() => navigate('new')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
          + Create Website
        </button>
      </div>

      {sites.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-xl font-bold text-heading mb-2">No websites yet</h2>
          <p className="text-sm text-muted mb-6">Create your first mini website with one of 60 premium templates.</p>
          <button onClick={() => navigate('new')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg">
            Create Your First Website
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((site, i) => (
          <motion.div key={site.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={cn('rounded-2xl border p-5 transition-all hover:shadow-lg', isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300')}>
            <div className="flex items-start gap-3 mb-4">
              {site.logo_url ? (
                <img src={site.logo_url} alt={site.site_name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold', isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700')}>
                  {site.site_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-heading truncate">{site.site_name}</h3>
                {site.tagline && <p className="text-xs text-muted truncate">{site.tagline}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[site.status])}>{site.status}</span>
                  <span className="text-[10px] text-muted">👁 {site.view_count}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate(`${site.id}/edit`)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>Edit</button>
              {site.status === 'draft' && (
                <button onClick={() => handlePublish(site.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">Publish</button>
              )}
              {site.status === 'published' && (
                <>
                  <a href={`/site/${site.slug}`} target="_blank" rel="noopener" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors">View</a>
                  <button onClick={() => copyLink(site.slug)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">Copy Link</button>
                  <button onClick={() => setQrSlug(qrSlug === site.slug ? null : site.slug)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">QR</button>
                </>
              )}
              <button onClick={() => handleDelete(site.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto">Delete</button>
            </div>

            {/* QR Code popup */}
            {qrSlug === site.slug && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center">
                <div className={cn('inline-block p-4 rounded-xl', isDark ? 'bg-white' : 'bg-gray-50')}>
                  <QRCodeSVG value={`${window.location.origin}/site/${site.slug}`} size={160} level="H" />
                </div>
                <p className="text-xs text-muted mt-2">Scan to open website</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
