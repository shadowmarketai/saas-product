import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function GeometricAbstract({ card, onAction, preview }: VCardTemplateProps) {
  const c1 = card.custom_colors?.primary || '#8b5cf6';
  const c2 = card.custom_colors?.secondary || '#ec4899';

  return (
    <div className={`min-h-screen relative overflow-hidden bg-[#fafafa] ${preview ? 'max-h-[700px] overflow-auto' : ''}`}>
      {/* Geometric shapes background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -right-20 w-80 h-80 opacity-[0.06]"
          style={{ border: `3px solid ${c1}`, borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-20 w-96 h-96 opacity-[0.05]"
          style={{ border: `3px solid ${c2}`, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        />
        {/* Triangle */}
        <svg className="absolute top-40 left-8 w-16 h-16 opacity-[0.06]" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke={c1} strokeWidth="3" />
        </svg>
        {/* Circle */}
        <svg className="absolute bottom-60 right-12 w-12 h-12 opacity-[0.08]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke={c2} strokeWidth="3" />
        </svg>
        {/* Dots grid */}
        <div className="absolute top-20 left-10 opacity-[0.04]" style={{
          width: 200, height: 200,
          backgroundImage: `radial-gradient(${c1} 2px, transparent 2px)`,
          backgroundSize: '20px 20px',
        }} />
      </div>

      <div className="max-w-md mx-auto px-6 py-12 relative z-10">
        {/* Profile */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="text-center mb-10">
          {card.profile_image_url ? (
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-1 rounded-2xl" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, transform: 'rotate(3deg)' }} />
              <img src={card.profile_image_url} alt={card.name} className="relative w-28 h-28 rounded-2xl object-cover" />
            </div>
          ) : (
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, transform: 'rotate(3deg)' }} />
              <div className="relative w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                {card.name[0]}
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{card.name}</h1>
          {card.title && <p className="text-sm mt-1" style={{ color: c1 }}>{card.title}</p>}
          {card.company && <p className="text-sm text-gray-500 font-medium">{card.company}</p>}
          {/* Geometric divider */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-3 h-3 rotate-45" style={{ background: `${c1}30` }} />
            <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${c1}50, ${c2}50)` }} />
            <div className="w-3 h-3 rotate-45" style={{ background: `${c2}30` }} />
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
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: c1 }}>Services</h2>
            <div className="grid grid-cols-2 gap-3">
              {card.services.map((s, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 opacity-10" style={{
                    background: i % 2 === 0 ? c1 : c2,
                    borderRadius: '0 0 0 100%',
                  }} />
                  <span className="text-xl block mb-2">{s.icon || '◇'}</span>
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
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
