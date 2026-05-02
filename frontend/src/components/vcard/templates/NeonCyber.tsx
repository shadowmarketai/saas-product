import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function NeonCyber({ card, onAction, preview }: VCardTemplateProps) {
  const neon = card.custom_colors?.accent || '#00ff88';
  const neon2 = card.custom_colors?.secondary || '#ff00ff';

  return (
    <div className={`min-h-screen relative overflow-hidden ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: '#050510' }}>
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `linear-gradient(${neon}15 1px, transparent 1px), linear-gradient(90deg, ${neon}15 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />
      {/* Glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 -left-20 w-60 h-60 rounded-full blur-[80px]"
        style={{ background: neon }}
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute bottom-40 -right-20 w-60 h-60 rounded-full blur-[80px]"
        style={{ background: neon2 }}
      />

      <div className="max-w-md mx-auto px-6 py-12 relative z-10">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <div className="relative inline-block mb-6">
              <img src={card.profile_image_url} alt={card.name} className="w-28 h-28 rounded-2xl object-cover" style={{ boxShadow: `0 0 30px ${neon}40, 0 0 60px ${neon}20` }} />
              <div className="absolute inset-0 rounded-2xl border-2" style={{ borderColor: `${neon}60` }} />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold border-2" style={{ borderColor: `${neon}60`, color: neon, background: `${neon}10` }}>
              {card.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ textShadow: `0 0 20px ${neon}60` }}>{card.name}</h1>
          {card.title && <p className="text-sm mt-1 font-mono tracking-wide" style={{ color: `${neon}99` }}>&lt;{card.title}/&gt;</p>}
          {card.company && <p className="text-sm font-medium text-white/50 mt-0.5">{card.company}</p>}
        </motion.div>

        {/* Actions - custom neon style */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-8">
          {card.phone && (
            <a href={`tel:${card.phone}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border" style={{ borderColor: `${neon}40`, color: neon, background: `${neon}10`, boxShadow: `0 0 15px ${neon}20` }}>
              <span>📞</span> Call
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border" style={{ borderColor: `${neon2}40`, color: neon2, background: `${neon2}10`, boxShadow: `0 0 15px ${neon2}20` }}>
              <span>✉️</span> Email
            </a>
          )}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border" style={{ borderColor: `${neon}40`, color: neon, background: `${neon}10` }}>
              <span>💬</span> WhatsApp
            </a>
          )}
          <a href={`/api/v1/vcards/public/${card.slug}/vcf`} download className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all border" style={{ borderColor: `${neon2}40`, color: neon2, background: `${neon2}10` }}>
            <span>💾</span> Save
          </a>
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-10">
          <SocialIcons card={card} onAction={onAction} variant="dark" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest mb-3 px-1" style={{ color: `${neon}80` }}>// services</h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <motion.div key={i} whileHover={{ x: 4 }} className="p-4 rounded-xl border transition-colors" style={{ borderColor: `${neon}15`, background: `${neon}05` }}>
                  <p className="text-sm font-medium text-white">{s.icon ? `${s.icon} ` : '▹ '}{s.title}</p>
                  {s.description && <p className="text-xs text-white/40 mt-1 font-mono">{s.description}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6 border-t" style={{ borderColor: `${neon}10` }}>
          <p className="text-xs font-mono" style={{ color: `${neon}30` }}>{'<'} NexaStack {'/'}{'>'}  </p>
        </motion.div>
      </div>
    </div>
  );
}
