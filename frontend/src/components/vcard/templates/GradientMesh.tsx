import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function GradientMesh({ card, onAction, preview }: VCardTemplateProps) {
  const c1 = card.custom_colors?.primary || '#667eea';
  const c2 = card.custom_colors?.secondary || '#764ba2';
  const c3 = card.custom_colors?.tertiary || '#f093fb';

  return (
    <div className={`min-h-screen relative overflow-hidden ${preview ? 'max-h-[700px] overflow-auto' : ''}`}>
      {/* Mesh gradient background */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 20% 20%, ${c1}90 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, ${c3}70 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, ${c2}80 0%, transparent 50%),
          linear-gradient(180deg, #1a1a2e, #16213e)
        `,
      }} />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />

      <div className="max-w-md mx-auto px-6 py-12 relative z-10">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-1 rounded-full opacity-60 blur-md" style={{ background: `linear-gradient(135deg, ${c1}, ${c3})` }} />
              <img src={card.profile_image_url} alt={card.name} className="relative w-28 h-28 rounded-full object-cover ring-2 ring-white/30" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white/90" style={{ background: `linear-gradient(135deg, ${c1}80, ${c2}80)` }}>
              {card.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">{card.name}</h1>
          {card.title && <p className="text-sm text-white/60 mt-1">{card.title}</p>}
          {card.company && <p className="text-sm font-medium text-white/80 mt-0.5">{card.company}</p>}
        </motion.div>

        {/* Actions */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="mb-8">
          <VCardActions card={card} onAction={onAction} variant="glass" />
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-10">
          <SocialIcons card={card} onAction={onAction} variant="glass" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3 px-1">Services</h2>
            <div className="grid grid-cols-2 gap-2">
              {card.services.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/10 text-center">
                  <span className="text-2xl block mb-2">{s.icon || '✦'}</span>
                  <p className="text-sm font-medium text-white">{s.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6">
          <p className="text-xs text-white/20">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
