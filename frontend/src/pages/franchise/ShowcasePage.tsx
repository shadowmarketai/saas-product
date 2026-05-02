import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductShowcase {
  type: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  gradient: string;
  gradientBg: string;
  startingPrice: string;
  features: string[];
  templateCount: number;
}

const PRODUCTS: ProductShowcase[] = [
  {
    type: 'vcard', name: 'Digital vCard & NFC', icon: '💳',
    tagline: 'Smart digital business cards',
    description: 'Create stunning digital visiting cards with QR codes, NFC tap-to-share, VCF downloads, and full analytics. Perfect for professionals who want to make a lasting impression.',
    gradient: 'from-indigo-500 to-violet-600', gradientBg: 'from-indigo-50 to-violet-50',
    startingPrice: '₹499/yr', templateCount: 12,
    features: ['QR Code sharing', 'NFC tap-to-share', 'VCF download', 'Social links', 'Business hours', 'Services showcase', 'Google Maps', 'Custom themes', 'Analytics tracking', 'Profile photo', 'WhatsApp integration', 'Multiple layouts'],
  },
  {
    type: 'website', name: 'Website Builder + AI', icon: '🌐',
    tagline: 'AI-powered business websites',
    description: 'Build SEO-optimized single page websites in minutes. AI generates content, hero sections, service grids, galleries, testimonials, and FAQ — all mobile responsive.',
    gradient: 'from-cyan-500 to-blue-600', gradientBg: 'from-cyan-50 to-blue-50',
    startingPrice: '₹1,999/yr', templateCount: 8,
    features: ['AI content generation', 'SEO optimization', 'Hero section', 'Services grid', 'Photo gallery', 'Testimonials', 'FAQ section', 'Contact form', 'Google Maps', 'Custom domain', 'Mobile responsive', 'Fast loading'],
  },
  {
    type: 'google_reviews', name: 'Google Reviews & QR', icon: '⭐',
    tagline: 'Smart review collection system',
    description: 'Auto-collect Google reviews with intelligent star-based routing. Positive reviews go to Google, negative feedback stays private. Boost your ranking overnight.',
    gradient: 'from-amber-500 to-orange-600', gradientBg: 'from-amber-50 to-orange-50',
    startingPrice: '₹499/mo', templateCount: 4,
    features: ['Smart QR collection', 'Star-based routing', 'Private feedback capture', 'Google redirect', 'AI reply suggestions', 'Review analytics', 'Custom branding', 'Thank you messages', 'Rating dashboard', 'Multi-location'],
  },
  {
    type: 'qr_menu', name: 'Restaurant QR Menu', icon: '🍽️',
    tagline: 'Interactive digital menus',
    description: 'Create beautiful digital menus with categories, item images, dietary indicators, bestseller badges, and real-time ordering capabilities.',
    gradient: 'from-red-500 to-rose-600', gradientBg: 'from-red-50 to-rose-50',
    startingPrice: '₹299/mo', templateCount: 6,
    features: ['Category management', 'Item images', 'Veg/Non-veg indicators', 'Bestseller badges', 'Spicy indicators', 'Price display', 'Grid/List layout', 'Sticky categories', 'Banner image', 'Custom currency', 'Allergen info', 'Daily specials'],
  },
  {
    type: 'social_poster', name: 'Social Media Poster', icon: '🎨',
    tagline: 'AI-powered poster studio',
    description: 'Generate stunning social media posts for festivals, offers, and events. AI creates captions, and you can share directly to WhatsApp, Instagram, and Facebook.',
    gradient: 'from-pink-500 to-fuchsia-600', gradientBg: 'from-pink-50 to-fuchsia-50',
    startingPrice: '₹199/mo', templateCount: 3,
    features: ['AI caption generation', 'Festival templates', 'Offer templates', 'Product templates', 'Event templates', 'Multi-platform share', 'WhatsApp share', 'Download HD', 'Calendar integration', 'Brand kit', 'Schedule posts', 'Analytics'],
  },
  {
    type: 'link_in_bio', name: 'Link-in-Bio Builder', icon: '🔗',
    tagline: 'Beautiful Linktree alternative',
    description: 'Create stunning bio pages with unlimited links, social icons, custom themes, and click analytics. Perfect for influencers and businesses.',
    gradient: 'from-purple-500 to-violet-600', gradientBg: 'from-purple-50 to-violet-50',
    startingPrice: '₹299/yr', templateCount: 6,
    features: ['Unlimited links', 'Social media buttons', 'Profile photo', 'Bio text', 'Cover image', 'Multiple layouts', 'Custom themes', 'Click analytics', 'YouTube embed', 'Custom icons', 'SEO friendly', 'Mobile optimized'],
  },
  {
    type: 'whatsapp_chatbot', name: 'WhatsApp Chatbot', icon: '💬',
    tagline: 'AI-powered auto-reply bot',
    description: 'Build automated WhatsApp conversation flows with smart menus, auto-replies, lead collection, and AI-powered responses. No code required.',
    gradient: 'from-emerald-500 to-green-600', gradientBg: 'from-emerald-50 to-green-50',
    startingPrice: '₹599/mo', templateCount: 3,
    features: ['Welcome message', 'Menu system', 'Auto-replies', 'Keyword triggers', 'Lead collection', 'Business hours', 'Away messages', 'AI smart replies', 'Flow builder', 'CRM integration', 'Multi-language', 'Analytics'],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export function ShowcasePage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">🚀 Product Showcase</h1>
        <p className="text-indigo-200 mt-2">Explore all 7 digital products you can sell to your customers</p>
        <div className="mt-5 relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full md:w-96 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Product Grid */}
      <motion.div initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
        {filtered.map((product, i) => (
          <motion.div key={product.type} variants={fadeUp} custom={i} layout>
            {/* Card */}
            <motion.div
              whileHover={expanded !== product.type ? { y: -4, scale: 1.01 } : {}}
              className="bg-card rounded-2xl shadow-md border border-theme overflow-hidden cursor-pointer"
              onClick={() => setExpanded(expanded === product.type ? null : product.type)}
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${product.gradient} p-5`}>
                <span className="text-4xl">{product.icon}</span>
                <h3 className="text-lg font-bold text-white mt-2">{product.name}</h3>
                <p className="text-sm text-white/80 mt-1">{product.tagline}</p>
              </div>

              <div className="p-5">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">From {product.startingPrice}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500">{product.features.length} features</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-500">{product.templateCount} templates</span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expanded === product.type && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-theme">
                        <h4 className="text-sm font-semibold text-heading mb-3">Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {product.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="text-green-500 text-sm">✓</span> {f}
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/franchise/create?type=${product.type}`); }}
                          className={`w-full mt-5 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${product.gradient} transition-transform hover:scale-[1.02] shadow-lg`}
                        >
                          Create {product.name} →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Toggle Indicator */}
                <div className="flex items-center justify-center mt-4 text-gray-300 text-sm">
                  {expanded === product.type ? '▲ Collapse' : '▼ Explore Product'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No products match your search</p>
        </div>
      )}

      {/* Bottom Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 bg-gray-50 rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: '7', label: 'Digital Products' },
            { value: '35+', label: 'Templates' },
            { value: '19', label: 'Pricing Plans' },
            { value: '∞', label: 'Revenue Potential' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-heading">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
