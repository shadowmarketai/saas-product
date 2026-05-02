import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { vcardApi } from '@/services/vcardApi';
import { minisiteApi } from '@/services/minisiteApi';
import api from '@/services/api';
import type { Product } from '@/types';
import type { VCardData } from '@/types/vcard';
import type { MiniSiteData } from '@/types/minisite';

type FilterTab = 'all' | 'vcards' | 'websites' | 'products';

interface QRItem {
  id: string;
  name: string;
  type: 'vcard' | 'website' | 'product';
  url: string;
  typeBadge: string;
}

function buildPublicUrl(type: 'vcard' | 'website' | 'product', slug: string): string {
  const base = window.location.origin;
  if (type === 'vcard') return `${base}/card/${slug}`;
  if (type === 'website') return `${base}/site/${slug}`;
  return `${base}/p/${slug}`;
}

function handlePrintQR(url: string, name: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>QR - ${name}</title></head>
    <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;">
      <h2>${name}</h2>
      <div id="qr"></div>
      <p style="margin-top:12px;font-size:12px;color:#666;">${url}</p>
      <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
      <script>
        QRCode.toCanvas(document.createElement('canvas'), '${url}', function(err, canvas) {
          if (!err) document.getElementById('qr').appendChild(canvas);
          window.print();
        });
      </script>
    </body></html>
  `);
  win.document.close();
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // silently ignore clipboard errors in non-secure contexts
  }
}

export function QRCodesPage() {
  const [vcards, setVcards] = useState<VCardData[]>([]);
  const [sites, setSites] = useState<MiniSiteData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([
      vcardApi.list(),
      minisiteApi.list(),
      api.get<Product[]>('/products/', { params: { is_published: true } }),
    ]).then(([vRes, sRes, pRes]) => {
      if (vRes.status === 'fulfilled') setVcards(vRes.value);
      if (sRes.status === 'fulfilled') setSites(sRes.value);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleCopy = async (id: string, url: string) => {
    await copyToClipboard(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Build unified QR items
  const vcardItems: QRItem[] = vcards
    .filter((v) => v.status === 'published')
    .map((v) => ({
      id: `vcard-${v.id}`,
      name: v.name || `VCard #${v.id}`,
      type: 'vcard' as const,
      url: buildPublicUrl('vcard', v.slug),
      typeBadge: 'VCard',
    }));

  const websiteItems: QRItem[] = sites
    .filter((s) => s.status === 'published')
    .map((s) => ({
      id: `site-${s.id}`,
      name: s.site_name || `Site #${s.id}`,
      type: 'website' as const,
      url: buildPublicUrl('website', s.slug),
      typeBadge: 'Website',
    }));

  const productItems: QRItem[] = products
    .filter((p) => p.is_published)
    .map((p) => ({
      id: `product-${p.id}`,
      name: p.name,
      type: 'product' as const,
      url: buildPublicUrl('product', p.slug),
      typeBadge: p.product_type.replace(/_/g, ' '),
    }));

  const allItems = [...vcardItems, ...websiteItems, ...productItems];

  const filtered =
    activeTab === 'all'
      ? allItems
      : activeTab === 'vcards'
      ? vcardItems
      : activeTab === 'websites'
      ? websiteItems
      : productItems;

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allItems.length },
    { key: 'vcards', label: 'VCards', count: vcardItems.length },
    { key: 'websites', label: 'Websites', count: websiteItems.length },
    { key: 'products', label: 'Products', count: productItems.length },
  ];

  const TYPE_COLORS: Record<QRItem['type'], string> = {
    vcard: 'bg-indigo-50 text-indigo-700',
    website: 'bg-sky-50 text-sky-700',
    product: 'bg-emerald-50 text-emerald-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-heading">QR Codes</h1>
        <p className="text-muted mt-1">Download or share QR codes for your published items</p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* QR Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <span className="text-5xl">📱</span>
          <p className="mt-4 text-heading font-semibold">No published items yet</p>
          <p className="text-muted text-sm mt-1">Publish a VCard, website, or product to generate QR codes</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
        >
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02, y: -3 }}
              className="bg-card rounded-2xl p-5 shadow-md border border-theme flex flex-col items-center gap-3 hover:shadow-lg transition-shadow"
            >
              {/* Type badge */}
              <span className={`self-start px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${TYPE_COLORS[item.type]}`}>
                {item.typeBadge}
              </span>

              {/* Name */}
              <p className="text-sm font-semibold text-heading text-center">{item.name}</p>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <QRCodeSVG value={item.url} size={120} level="M" />
              </div>

              {/* URL */}
              <p className="text-[10px] text-muted text-center break-all leading-relaxed">{item.url}</p>

              {/* Actions */}
              <div className="flex gap-2 w-full mt-auto">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handlePrintQR(item.url, item.name)}
                  className="flex-1 py-2 text-xs font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  Download
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCopy(item.id, item.url)}
                  className="flex-1 py-2 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {copiedId === item.id ? '✓ Copied' : 'Copy Link'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
