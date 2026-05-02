import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function DarkLuxury({ card, onAction, preview }: VCardTemplateProps) {
  const cc = card.custom_colors;
  return (
    <div className={`min-h-screen text-white ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: cc?.background || '#0a0a0a' }}>
      {/* Gold accent line */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(to right, transparent, ${cc?.accent || '#f59e0b'}, transparent)` }} />

      <div className="max-w-md mx-auto px-6 py-12">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <div className="relative inline-block mb-6">
              <img src={card.profile_image_url} alt={card.name} className="w-28 h-28 rounded-full object-cover ring-2 ring-amber-500/50" />
              <div className="absolute inset-0 rounded-full ring-1 ring-amber-500/20 ring-offset-4 ring-offset-[#0a0a0a]" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-amber-400 border border-amber-500/30">
              {card.name[0]}
            </div>
          )}
          {card.logo_url && <img src={card.logo_url} alt="" className="h-6 mx-auto mb-4 opacity-60" />}
          <h1 className="text-2xl font-bold tracking-tight" style={cc?.nameColor ? { color: cc.nameColor } : { background: 'linear-gradient(to right, #fde68a, #fde047, #fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{card.name}</h1>
          {card.title && <p className="text-sm mt-1 tracking-wide uppercase text-xs" style={{ color: cc?.titleColor || 'rgba(255,255,255,0.4)' }}>{card.title}</p>}
          {card.company && <p className="text-sm font-medium mt-1" style={{ color: cc?.textColor || 'rgba(245,158,11,0.7)' }}>{card.company}</p>}
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${cc?.accent || 'rgba(245,158,11,0.5)'})` }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cc?.accent || '#f59e0b' }} />
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${cc?.accent || 'rgba(245,158,11,0.5)'})` }} />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="mb-8">
          <VCardActions card={card} onAction={onAction} variant="dark" />
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-10">
          <SocialIcons card={card} onAction={onAction} variant="dark" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 px-1" style={{ color: cc?.accent || 'rgba(245,158,11,0.6)' }}>Services</h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-colors" style={{ background: cc?.cardBg || 'rgba(255,255,255,0.03)' }}>
                  <p className="text-sm font-medium" style={{ color: cc?.textColor || 'rgba(255,255,255,0.9)' }}>{s.icon ? `${s.icon} ` : ''}{s.title}</p>
                  {s.description && <p className="text-xs mt-1" style={{ color: cc?.textColor ? `${cc.textColor}99` : 'rgba(255,255,255,0.4)' }}>{s.description}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6 border-t border-white/5">
          <p className="text-xs text-white/15">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
