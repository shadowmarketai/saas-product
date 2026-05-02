import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function BoldModern({ card, onAction, preview }: VCardTemplateProps) {
  const accent = card.custom_colors?.accent || '#ff4444';

  return (
    <div className={`min-h-screen bg-white ${preview ? 'max-h-[700px] overflow-auto' : ''}`}>
      <div className="max-w-md mx-auto">
        {/* Hero section with bold split */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="relative px-6 pt-12 pb-8">
          <div className="absolute top-0 left-0 w-1/2 h-full" style={{ background: accent }} />
          <div className="relative flex items-end gap-5">
            {card.profile_image_url ? (
              <img src={card.profile_image_url} alt={card.name} className="w-32 h-40 rounded-2xl object-cover shadow-2xl" />
            ) : (
              <div className="w-32 h-40 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl" style={{ background: `${accent}cc` }}>
                {card.name[0]}
              </div>
            )}
            <div className="pb-2">
              <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{card.name}</h1>
              {card.title && <p className="text-sm font-medium mt-1" style={{ color: accent }}>{card.title}</p>}
              {card.company && <p className="text-sm text-gray-500 font-medium">{card.company}</p>}
            </div>
          </div>
        </motion.div>

        <div className="px-6 pb-12">
          {/* Accent bar */}
          <div className="h-1 rounded-full mb-8" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

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
              <h2 className="text-lg font-black text-gray-900 mb-3">SERVICES</h2>
              <div className="space-y-2">
                {card.services.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: accent }}>
                      {s.icon || (i + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{s.title}</p>
                      {s.description && <p className="text-xs text-gray-500">{s.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-300 font-bold tracking-widest">NEXASTACK</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
