import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function CorporateClassic({ card, onAction, preview }: VCardTemplateProps) {
  const primary = card.custom_colors?.primary || '#1e3a5f';

  return (
    <div className={`min-h-screen bg-gray-50 ${preview ? 'max-h-[700px] overflow-auto' : ''}`}>
      {/* Header band */}
      <div className="h-48 relative" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
        }} />
      </div>

      <div className="max-w-md mx-auto px-6 -mt-20 relative z-10 pb-12">
        {/* Card */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            {card.profile_image_url ? (
              <img src={card.profile_image_url} alt={card.name} className="w-24 h-24 rounded-full object-cover mx-auto -mt-20 mb-4 ring-4 ring-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto -mt-20 mb-4 ring-4 ring-white shadow-lg flex items-center justify-center text-2xl font-bold text-white" style={{ background: primary }}>
                {card.name[0]}
              </div>
            )}
            {card.logo_url && <img src={card.logo_url} alt="" className="h-8 mx-auto mb-3" />}
            <h1 className="text-xl font-bold text-gray-900">{card.name}</h1>
            {card.title && <p className="text-sm text-gray-500 mt-0.5">{card.title}</p>}
            {card.company && (
              <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ background: primary }}>
                {card.company}
              </span>
            )}
          </div>

          {/* Contact info row */}
          <div className="mt-6 space-y-2">
            {card.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${primary}10`, color: primary }}>📞</span>
                {card.phone}
              </div>
            )}
            {card.email && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${primary}10`, color: primary }}>✉️</span>
                {card.email}
              </div>
            )}
            {card.address && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs" style={{ background: `${primary}10`, color: primary }}>📍</span>
                {card.address}
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="mb-6">
          <VCardActions card={card} onAction={onAction} variant="light" />
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-8">
          <SocialIcons card={card} onAction={onAction} variant="light" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-bold mb-3" style={{ color: primary }}>Services</h2>
            <div className="space-y-3">
              {card.services.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: primary }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div {...fade} transition={{ delay: 0.6 }} className="text-center pt-6">
          <p className="text-xs text-gray-300">Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
