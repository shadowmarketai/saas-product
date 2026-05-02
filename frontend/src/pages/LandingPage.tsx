import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HeroScene } from '@/components/three/HeroScene';
import type { ProductType } from '@/types';

const products: { name: string; type: ProductType; desc: string; icon: string; gradient: string }[] = [
  { name: 'Digital vCard & NFC', type: 'vcard', desc: 'Stunning digital visiting cards with QR & NFC tap-to-share technology', icon: '💳', gradient: 'from-indigo-500 to-violet-600' },
  { name: 'Website Builder + AI', type: 'website', desc: 'AI-powered SEO-optimized single page websites deployed in minutes', icon: '🌐', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Google Reviews & QR', type: 'google_reviews', desc: 'Auto-collect reviews & supercharge your Google ranking overnight', icon: '⭐', gradient: 'from-amber-500 to-orange-600' },
  { name: 'Restaurant QR Menu', type: 'qr_menu', desc: 'Interactive digital menus with real-time ordering & analytics', icon: '🍽️', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Social Media Poster', type: 'social_poster', desc: 'AI-generated social posts & festival posters — schedule & publish', icon: '📱', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Link-in-Bio Builder', type: 'link_in_bio', desc: 'Beautiful Linktree alternative with analytics & custom themes', icon: '🔗', gradient: 'from-purple-500 to-fuchsia-600' },
  { name: 'WhatsApp Chatbot', type: 'whatsapp_chatbot', desc: 'AI-powered auto-reply chatbot builder — no code required', icon: '💬', gradient: 'from-green-500 to-emerald-600' },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50+', label: 'Franchise Partners' },
  { value: '99.9%', label: 'Uptime' },
  { value: '7', label: 'Digital Products' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function GlowButton({ children, variant = 'primary', className = '' }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const base = variant === 'primary'
    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20';

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(5,5,16,0)', 'rgba(5,5,16,0.8)']);
  const navBlur = useTransform(scrollYProgress, [0, 0.05], ['blur(0px)', 'blur(12px)']);

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden" ref={heroRef}>
      <HeroScene />

      {/* --- Floating Nav --- */}
      <motion.nav
        style={{ backgroundColor: navBg, backdropFilter: navBlur, WebkitBackdropFilter: navBlur }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      >
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              NexaStack
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 items-center"
          >
            <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <GlowButton className="text-sm !px-6 !py-2.5">Get Started</GlowButton>
            </Link>
          </motion.div>
        </div>
      </motion.nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-sm text-indigo-300 font-medium">Now with AI-powered automation</span>
            </motion.div>

            <h2 className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="block text-white"
              >
                Launch. Sell. Scale.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="block mt-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Without Limits.
              </motion.span>
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-8 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              The ultimate white-label SaaS platform. 7 digital products, franchise model,
              AI-powered — all under <span className="text-white font-medium">one roof</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <GlowButton className="text-lg">
                  Start Free Trial
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </GlowButton>
              </Link>
              <Link to="/register">
                <GlowButton variant="secondary" className="text-lg">
                  Become a Partner
                </GlowButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- Stats Bar --- */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 py-16 border-y border-white/5"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- Products Section --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="text-center mb-20"
        >
          <motion.p variants={fadeUp} custom={0} className="text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-4">
            Everything you need
          </motion.p>
          <motion.h3 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-bold">
            7 Products.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              One Platform.
            </span>
          </motion.h3>
          <motion.p variants={fadeUp} custom={2} className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            Each product is a revenue stream. Your franchise partners sell them. You earn on every transaction.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {products.map((product, i) => (
            <motion.div
              key={product.name}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl p-[1px] overflow-hidden"
            >
              {/* Animated gradient border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] group-hover:opacity-0 transition-opacity duration-500" />

              <div className="relative bg-[#0a0a1a] rounded-2xl p-6 h-full backdrop-blur-sm">
                {/* Glow effect on hover */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`} />

                <div className="relative">
                  <div className="text-4xl mb-4">{product.icon}</div>
                  <h4 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed group-hover:text-gray-400 transition-colors">
                    {product.desc}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-indigo-400 transition-colors">
                    <span>Learn more</span>
                    <motion.span className="inline-block" whileHover={{ x: 4 }}>→</motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- CTA Section --- */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-8 text-center">
          {/* Glow backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="relative"
          >
            <motion.h3 variants={fadeUp} custom={0} className="text-4xl md:text-6xl font-bold leading-tight">
              Ready to build your
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                digital empire?
              </span>
            </motion.h3>
            <motion.p variants={fadeUp} custom={1} className="mt-6 text-xl text-gray-400 max-w-xl mx-auto">
              Join hundreds of entrepreneurs who are scaling their business with NexaStack.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <GlowButton className="text-lg">Start Free — No Card Needed</GlowButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                NexaStack
              </span>
              <span className="text-sm text-gray-600">Your Digital Empire Starts Here.</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
