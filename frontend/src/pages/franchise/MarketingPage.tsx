import { useState } from 'react';
import { motion } from 'framer-motion';

interface Caption {
  type: string;
  icon: string;
  text: string;
}

interface EmailTemplate {
  name: string;
  subject: string;
  preview: string;
  html: string;
}

interface Poster {
  title: string;
  productType: string;
  icon: string;
}

const CAPTIONS: Caption[] = [
  {
    type: 'VCard',
    icon: '💼',
    text: '🚀 Level up your networking! Share your digital business card instantly — no printing, no mess. Get yours today! #DigitalCard #Networking #NexaStack',
  },
  {
    type: 'VCard',
    icon: '💼',
    text: '📲 One tap. All your details. Your digital business card is ready 24/7. Make a lasting impression! #SmartBusiness #VCard',
  },
  {
    type: 'Website',
    icon: '🌐',
    text: '🌐 Your business deserves an online presence. Launch your professional mini-website today — no coding required! #Website #SmallBusiness',
  },
  {
    type: 'QR Menu',
    icon: '🍽️',
    text: '📱 Contactless menus are the future! Give your customers a seamless dining experience with our QR menu solution. #Restaurant #QRMenu #Hospitality',
  },
  {
    type: 'Reviews',
    icon: '⭐',
    text: '⭐ More Google reviews = more customers. Make it easy for happy customers to leave reviews with one scan! #GoogleReviews #LocalBusiness',
  },
];

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    name: 'Welcome Email',
    subject: 'Welcome to NexaStack — Your Digital Journey Starts Here!',
    preview: 'Hi [Name], we are thrilled to have you on board...',
    html: `<h2>Welcome to NexaStack!</h2><p>Hi [Name],</p><p>We're thrilled to have you on board. Your digital presence is ready to go live.</p><p>Get started by visiting your dashboard and creating your first product.</p><p>Cheers,<br/>The NexaStack Team</p>`,
  },
  {
    name: 'Product Launch',
    subject: '🚀 Your New Product is Live on NexaStack!',
    preview: 'Congratulations! Your [Product Name] is now live and ready...',
    html: `<h2>Your Product is Live! 🚀</h2><p>Hi [Name],</p><p>Congratulations! Your <strong>[Product Name]</strong> is now live and ready to share with the world.</p><p>Share your unique link: [link]</p><p>Cheers,<br/>The NexaStack Team</p>`,
  },
  {
    name: 'Special Offer',
    subject: '🎉 Exclusive Offer — Upgrade Your Plan Today!',
    preview: 'For a limited time, get 20% off on all Pro plans...',
    html: `<h2>Exclusive Offer Just for You! 🎉</h2><p>Hi [Name],</p><p>For a limited time, get <strong>20% off</strong> on all Pro plans when you upgrade today.</p><p>Use code: <strong>NEXAPRO20</strong></p><p>Offer expires in 48 hours!</p><p>Cheers,<br/>The NexaStack Team</p>`,
  },
];

const POSTERS: Poster[] = [
  { title: 'Digital Business Card', productType: 'VCard', icon: '💼' },
  { title: 'QR Menu Board', productType: 'QR Menu', icon: '📱' },
  { title: 'Google Reviews QR', productType: 'Reviews', icon: '⭐' },
];

const BRAND_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // silently ignore clipboard errors
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
    >
      {copied ? '✓ Copied!' : label}
    </motion.button>
  );
}

export function MarketingPage() {
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold font-heading text-heading">Marketing Resources</h1>
        <p className="text-muted mt-1">Ready-made assets to promote your products</p>
      </motion.div>

      {/* Brand Kit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-8 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <h2 className="text-lg font-semibold text-heading mb-1 flex items-center gap-2">
          <span>🎨</span> Brand Kit
        </h2>
        <p className="text-sm text-muted mb-5">Your brand colors and downloadable assets</p>

        {/* Color Swatches */}
        <div className="mb-6">
          <p className="text-sm font-medium text-heading mb-3">Brand Colors</p>
          <div className="flex gap-3 flex-wrap">
            {BRAND_COLORS.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl shadow-md" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-mono text-muted">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Downloadable Assets */}
        <div>
          <p className="text-sm font-medium text-heading mb-3">Downloadable Assets</p>
          <div className="space-y-2">
            {[
              { name: 'Brand Logo Pack (PNG)', size: '2.4 MB' },
              { name: 'Marketing Brochure (PDF)', size: '1.8 MB' },
              { name: 'Social Media Kit (ZIP)', size: '5.2 MB' },
            ].map((asset) => (
              <div key={asset.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-heading">{asset.name}</p>
                  <p className="text-xs text-muted">{asset.size}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.alert(`Downloading ${asset.name}...`)}
                  className="px-4 py-1.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Download
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Ready-made Captions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <h2 className="text-lg font-semibold text-heading mb-1 flex items-center gap-2">
          <span>✍️</span> Ready-made Captions
        </h2>
        <p className="text-sm text-muted mb-5">Copy and paste these captions for social media</p>
        <div className="space-y-4">
          {CAPTIONS.map((caption, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{caption.icon}</span>
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase">{caption.type}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{caption.text}</p>
                  </div>
                </div>
                <CopyButton text={caption.text} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Email Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <h2 className="text-lg font-semibold text-heading mb-1 flex items-center gap-2">
          <span>📧</span> Email Templates
        </h2>
        <p className="text-sm text-muted mb-5">Professional email templates ready to use</p>
        <div className="grid md:grid-cols-3 gap-4">
          {EMAIL_TEMPLATES.map((tmpl) => (
            <div key={tmpl.name} className="border border-theme rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
                <p className="text-white text-sm font-semibold">{tmpl.name}</p>
                <p className="text-indigo-200 text-xs mt-0.5 truncate">{tmpl.subject}</p>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted leading-relaxed mb-4">{tmpl.preview}</p>
                <CopyButton text={tmpl.html} label="Copy HTML" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* QR Posters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-card rounded-2xl p-6 shadow-md border border-theme"
      >
        <h2 className="text-lg font-semibold text-heading mb-1 flex items-center gap-2">
          <span>🪧</span> QR Posters
        </h2>
        <p className="text-sm text-muted mb-5">Print-ready poster layouts for your products</p>
        <div className="grid md:grid-cols-3 gap-4">
          {POSTERS.map((poster) => (
            <div key={poster.title} className="border border-theme rounded-xl overflow-hidden">
              {/* Poster Preview */}
              <div className="bg-gradient-to-br from-gray-900 to-indigo-900 p-8 flex flex-col items-center justify-center min-h-48">
                <span className="text-5xl mb-3">{poster.icon}</span>
                <p className="text-white text-sm font-bold text-center">{poster.title}</p>
                <p className="text-indigo-300 text-xs mt-1">{poster.productType}</p>
                <div className="mt-4 w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-indigo-300 text-[10px] mt-2">Scan to visit</p>
              </div>
              <div className="p-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.alert(`Downloading ${poster.title} poster...`)}
                  className="px-4 py-1.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Download
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
