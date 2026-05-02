import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { VCardActions, SocialIcons } from '../VCardActions';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function GlassWave({ card, onAction, preview }: VCardTemplateProps) {
  const accent = card.custom_colors?.accent || '#38bdf8';

  return (
    <div className={`min-h-screen relative overflow-hidden ${preview ? 'max-h-[700px] overflow-auto' : ''}`} style={{ background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)` }}>
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path
            initial={{ d: "M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,208C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z" }}
            animate={{ d: "M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,213.3C960,235,1056,245,1152,234.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z" }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            fill={accent}
            fillOpacity="0.08"
          />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path
            initial={{ d: "M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L0,320Z" }}
            animate={{ d: "M0,256L48,261.3C96,267,192,277,288,272C384,267,480,245,576,234.7C672,224,768,224,864,234.7C960,245,1056,267,1152,272C1248,277,1344,267,1392,261.3L1440,256L1440,320L0,320Z" }}
            transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 1 }}
            fill={accent}
            fillOpacity="0.05"
          />
        </svg>
      </div>

      <div className="max-w-md mx-auto px-6 py-12 relative z-10">
        {/* Glass card */}
        <motion.div {...fade} transition={{ delay: 0.1 }} className="rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-8 mb-6 shadow-2xl">
          <div className="text-center">
            {card.profile_image_url ? (
              <img src={card.profile_image_url} alt={card.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-5 ring-2 ring-white/20 shadow-xl" />
            ) : (
              <div className="w-24 h-24 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl font-bold text-white/80" style={{ background: `linear-gradient(135deg, ${accent}40, ${accent}20)` }}>
                {card.name[0]}
              </div>
            )}
            {card.logo_url && <img src={card.logo_url} alt="" className="h-6 mx-auto mb-3 opacity-70" />}
            <h1 className="text-2xl font-bold text-white tracking-tight">{card.name}</h1>
            {card.title && <p className="text-sm text-white/50 mt-1">{card.title}</p>}
            {card.company && <p className="text-sm font-medium text-white/70 mt-0.5">{card.company}</p>}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="mb-6">
          <VCardActions card={card} onAction={onAction} variant="glass" />
        </motion.div>

        {/* Social */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-8">
          <SocialIcons card={card} onAction={onAction} variant="glass" />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.35 }} className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3 px-1">Services</h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/10">
                  <span className="text-lg">{s.icon || '◆'}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{s.title}</p>
                    {s.description && <p className="text-xs text-white/50 mt-0.5">{s.description}</p>}
                  </div>
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
