import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { vcardApi } from '@/services/vcardApi';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { TEMPLATE_LIST } from '@/components/vcard/VCardRenderer';
import type { VCardData } from '@/types/vcard';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400',
};

export function VCardListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isDark } = useTheme();
  const [cards, setCards] = useState<VCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  useEffect(() => {
    vcardApi.list().then(setCards).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    await vcardApi.remove(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success('VCard deleted');
  };

  const handlePublish = async (id: number) => {
    const updated = await vcardApi.publish(id);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    toast.success('VCard published!');
  };

  const copyShareLink = (slug: string) => {
    const url = `${window.location.origin}/card/${slug}`;
    navigator.clipboard.writeText(url);
  };

  const getTemplateName = (templateId: string) =>
    TEMPLATE_LIST.find((t) => t.id === templateId)?.name || templateId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading">My VCards</h1>
          <p className="text-sm text-muted mt-1">Create and manage your digital visiting cards</p>
        </div>
        <button
          data-testid="create-vcard-btn"
          onClick={() => navigate('new')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          + Create VCard
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
          <div className="text-6xl mb-4">📇</div>
          <h2 className="text-xl font-bold text-heading mb-2">No VCards yet</h2>
          <p className="text-sm text-muted mb-6">Create your first digital visiting card and share it with the world.</p>
          <button onClick={() => navigate('new')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg">
            Create Your First VCard
          </button>
        </motion.div>
      )}

      {/* Cards grid */}
      <div data-testid="vcard-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            data-testid="vcard-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-2xl border p-5 transition-all hover:shadow-lg group',
              isDark ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
            )}
          >
            {/* Card header */}
            <div className="flex items-start gap-3 mb-4">
              {card.profile_image_url ? (
                <img src={card.profile_image_url} alt={card.name} className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold', isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700')}>
                  {card.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-heading truncate">{card.name}</h3>
                {card.title && <p className="text-xs text-muted truncate">{card.title}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[card.status])}>
                    {card.status}
                  </span>
                  <span className="text-[10px] text-muted">{getTemplateName(card.template_id)}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-muted">
              <span>👁 {card.view_count}</span>
              <span>👆 {card.click_count}</span>
              <span>📤 {card.share_count}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => navigate(`${card.id}/edit`)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors', isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                Edit
              </button>
              {card.status === 'draft' && (
                <button onClick={() => handlePublish(card.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                  Publish
                </button>
              )}
              {card.status === 'published' && (
                <>
                  <a href={`/card/${card.slug}`} target="_blank" rel="noopener" className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 transition-colors">
                    View
                  </a>
                  <button onClick={() => copyShareLink(card.slug)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                    Copy Link
                  </button>
                  <button onClick={() => setQrSlug(qrSlug === card.slug ? null : card.slug)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors">
                    QR
                  </button>
                </>
              )}
              <button onClick={() => handleDelete(card.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors ml-auto">
                Delete
              </button>
            </div>

            {/* QR Code popup */}
            {qrSlug === card.slug && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 text-center">
                <div className={cn('inline-block p-4 rounded-xl', isDark ? 'bg-white' : 'bg-gray-50')}>
                  <QRCodeSVG value={`${window.location.origin}/card/${card.slug}`} size={160} level="H" />
                </div>
                <p className="text-xs text-muted mt-2">Scan to open card</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
