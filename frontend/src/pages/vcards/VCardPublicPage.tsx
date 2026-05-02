import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { vcardApi } from '@/services/vcardApi';
import { VCardRenderer } from '@/components/vcard/VCardRenderer';
import type { VCardPublicData } from '@/types/vcard';

export function VCardPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<VCardPublicData | null>(null);
  const [error, setError] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!slug) return;
    vcardApi.getPublic(slug).then(setCard).catch(() => setError(true));
  }, [slug]);

  const handleAction = () => {
    if (slug) vcardApi.trackClick(slug);
  };

  const handleShare = async () => {
    if (!slug) return;
    vcardApi.trackShare(slug);
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: card?.name || 'VCard', url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Card Not Found</h1>
          <p className="text-sm text-gray-500">This card doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <VCardRenderer card={card} onAction={handleAction} />

      {/* Floating action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-4 py-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          QR
        </button>
      </div>

      {/* QR overlay */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <QRCodeSVG value={window.location.href} size={200} level="H" />
            <p className="text-sm text-gray-500 mt-4">Scan to open this card</p>
            <p className="text-xs font-medium text-gray-800 mt-1">{card.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
