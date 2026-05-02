import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const neu = 'shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff]';
const neuInset = 'shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]';

export default function NeumorphicSoft({ card, onAction, preview }: VCardTemplateProps) {
  const accent = card.custom_colors?.accent || '#6366f1';

  return (
    <div className={`min-h-screen ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: '#e8e8e8' }}>
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Profile card */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className={`rounded-3xl p-8 mb-6 ${neu}`} style={{ background: '#e8e8e8' }}>
          <div className="text-center">
            {card.profile_image_url ? (
              <div className={`w-28 h-28 rounded-full mx-auto mb-5 overflow-hidden ${neuInset} p-1`}>
                <img src={card.profile_image_url} alt={card.name} className="w-full h-full rounded-full object-cover" />
              </div>
            ) : (
              <div className={`w-28 h-28 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl font-bold ${neuInset}`} style={{ color: accent, background: '#e8e8e8' }}>
                {card.name[0]}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800">{card.name}</h1>
            {card.title && <p className="text-sm text-gray-500 mt-1">{card.title}</p>}
            {card.company && <p className="text-sm font-semibold mt-0.5" style={{ color: accent }}>{card.company}</p>}
          </div>
        </motion.div>

        {/* Action buttons - neumorphic style */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-8">
          {card.phone && (
            <a href={`tel:${card.phone}`} className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-gray-700 ${neu} active:${neuInset} transition-all`} style={{ background: '#e8e8e8' }}>
              📞 Call
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-gray-700 ${neu} transition-all`} style={{ background: '#e8e8e8' }}>
              ✉️ Email
            </a>
          )}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-gray-700 ${neu} transition-all`} style={{ background: '#e8e8e8' }}>
              💬 WhatsApp
            </a>
          )}
          <a href={`/api/v1/vcards/public/${card.slug}/vcf`} download className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-gray-700 ${neu} transition-all`} style={{ background: '#e8e8e8' }}>
            💾 Save
          </a>
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-10">
          <SocialIcons card={card} onAction={onAction} variant="light" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: accent }}>Services</h2>
            <div className="space-y-3">
              {card.services.map((s, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl ${neu}`} style={{ background: '#e8e8e8' }}>
                  <span className="text-lg">{s.icon || '◆'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6">
          <p className="text-xs text-gray-400">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
