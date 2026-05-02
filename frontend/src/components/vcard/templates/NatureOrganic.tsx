import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function NatureOrganic({ card, onAction, preview }: VCardTemplateProps) {
  const cc = card.custom_colors;
  return (
    <div className={`min-h-screen ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: cc?.background || 'linear-gradient(180deg, #f5f0e8 0%, #e8dfd0 50%, #f5f0e8 100%)' }}>
      {/* Organic blob decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-700">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-58.4,80.4,-44.5C89,-30.6,93.2,-13.6,91.5,2.3C89.8,18.2,82.3,33,72.2,45.2C62.1,57.4,49.5,67,35.5,73.1C21.5,79.2,6.1,81.8,-9.4,80.7C-24.9,79.6,-40.5,74.8,-52.8,66C-65.1,57.2,-74.2,44.4,-79.6,30C-85,15.6,-86.8,-0.4,-83.2,-14.8C-79.6,-29.2,-70.7,-42,-59,-51.8C-47.3,-61.6,-32.8,-68.4,-18,-73.5C-3.2,-78.6,11.9,-82,25.6,-80.3C39.3,-78.6,51.5,-71.8,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="max-w-md mx-auto px-6 py-12 relative">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-emerald-200 to-amber-200 blur-sm" />
              <img src={card.profile_image_url} alt={card.name} className="relative w-28 h-28 rounded-full object-cover ring-4 ring-white" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-emerald-700">
              {card.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: cc?.nameColor || '#292524' }}>{card.name}</h1>
          {card.title && <p className="text-sm mt-1 italic" style={{ color: cc?.titleColor || '#78716c' }}>{card.title}</p>}
          {card.company && <p className="text-sm font-medium mt-0.5" style={{ color: cc?.primary || '#047857' }}>{card.company}</p>}
          {/* Leaf divider */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-px w-10" style={{ background: cc?.accent || '#6ee7b7' }} />
            <span className="text-sm" style={{ color: cc?.accent || '#10b981' }}>🌿</span>
            <div className="h-px w-10" style={{ background: cc?.accent || '#6ee7b7' }} />
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="mb-8">
          <VCardActions card={card} onAction={onAction} variant="light" />
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-10">
          <SocialIcons card={card} onAction={onAction} variant="light" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: cc?.accent || 'rgba(5,150,105,0.6)' }}>What I Do</h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-50" style={{ background: cc?.cardBg || 'rgba(255,255,255,0.6)' }}>
                  <span className="text-lg" style={{ color: cc?.accent }}>{s.icon || '🌱'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: cc?.textColor || '#292524' }}>{s.title}</p>
                    {s.description && <p className="text-xs mt-0.5" style={{ color: cc?.textColor || '#78716c' }}>{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6">
          <p className="text-xs text-stone-400">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
