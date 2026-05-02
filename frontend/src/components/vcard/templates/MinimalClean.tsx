import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function MinimalClean({ card, onAction, preview }: VCardTemplateProps) {
  const cc = card.custom_colors;
  return (
    <div className={`min-h-screen ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: cc?.background || '#FAFAFA' }}>
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <img src={card.profile_image_url} alt={card.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-6 ring-4 ring-gray-100" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-gray-400">
              {card.name[0]}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: cc?.nameColor || '#111827' }}>{card.name}</h1>
          {card.title && <p className="text-sm mt-1" style={{ color: cc?.titleColor || '#6b7280' }}>{card.title}</p>}
          {card.company && <p className="text-sm font-medium mt-0.5" style={{ color: cc?.textColor || '#374151' }}>{card.company}</p>}
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
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: cc?.accent || '#9ca3af' }}>Services</h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100" style={{ background: cc?.cardBg || '#ffffff' }}>
                  <span className="text-lg" style={{ color: cc?.accent }}>{s.icon || '◆'}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: cc?.textColor || '#111827' }}>{s.title}</p>
                    {s.description && <p className="text-xs mt-0.5" style={{ color: cc?.textColor || '#6b7280' }}>{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6 border-t" style={{ borderColor: cc?.accent || '#f3f4f6' }}>
          <p className="text-xs text-gray-400">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
