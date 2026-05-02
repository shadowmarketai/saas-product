import { motion } from 'framer-motion';
import type { VCardTemplateProps } from '../VCardRenderer';
import { SocialIcons } from '../VCardActions';
import type { TemplateConfig } from './templateConfigs';

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

interface Props extends VCardTemplateProps {
  config: TemplateConfig;
}

export default function ConfigurableTemplate({ card, onAction, preview, config }: Props) {
  const c = config;
  const cc = card.custom_colors || {};
  const hasHeader = c.headerHeight !== 'h-0';

  const profileRadius =
    c.profileShape === 'circle' ? 'rounded-full'
    : c.profileShape === 'rounded' ? 'rounded-2xl'
    : c.profileShape === 'hexagon' ? 'rounded-2xl'
    : 'rounded-lg';

  return (
    <div
      className={`min-h-screen ${preview ? 'max-h-[700px] overflow-auto' : ''}`}
      style={{ background: cc.background || c.pageBg }}
    >
      {/* Header area */}
      {hasHeader && (
        <div
          className={`${c.headerHeight} relative overflow-hidden`}
          style={{
            background: c.headerImage ? undefined : (cc.primary || c.headerBg),
          }}
        >
          {c.headerImage && (
            <img
              src={c.headerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {c.headerOverlay && (
            <div className="absolute inset-0" style={{ background: c.headerOverlay }} />
          )}
          {c.headerPattern && (
            <div className="absolute inset-0" style={{ backgroundImage: c.headerPattern }} />
          )}
        </div>
      )}

      <div
        className={`max-w-md mx-auto px-6 ${hasHeader ? '-mt-16' : 'pt-12'} pb-12 relative z-10`}
      >
        {/* Profile card */}
        <motion.div
          {...fade}
          transition={{ delay: 0.1 }}
          className={`${cc.cardBg ? '' : c.cardBg} ${c.cardRadius} ${c.cardBorder ? `border ${c.cardBorder}` : ''} ${c.cardShadow} ${c.cardBlur ? 'backdrop-blur-xl' : ''} p-8 mb-6`}
          style={cc.cardBg ? { background: cc.cardBg } : undefined}
        >
          <div className="text-center">
            {card.profile_image_url ? (
              <img
                src={card.profile_image_url}
                alt={card.name}
                className={`${c.profileSize} ${profileRadius} object-cover mx-auto ${hasHeader ? '-mt-20' : ''} mb-5 ${c.profileBorder} ${c.profileShadow}`}
              />
            ) : (
              <div
                className={`${c.profileSize} ${profileRadius} mx-auto ${hasHeader ? '-mt-20' : ''} mb-5 flex items-center justify-center text-2xl font-bold ${c.profileBorder} ${c.profileShadow} ${c.nameColor}`}
                style={{ background: c.pageBg }}
              >
                {card.name[0]}
              </div>
            )}
            {card.logo_url && (
              <img src={card.logo_url} alt="" className="h-6 mx-auto mb-3 opacity-70" />
            )}
            <h1 className={`text-2xl font-bold tracking-tight ${cc.nameColor ? '' : c.nameColor} ${c.fontClass}`} style={cc.nameColor ? { color: cc.nameColor } : undefined}>
              {card.name}
            </h1>
            {card.title && (
              <p className={`text-sm mt-1 ${cc.titleColor ? '' : c.titleColor} ${c.fontClass}`} style={cc.titleColor ? { color: cc.titleColor } : undefined}>{card.title}</p>
            )}
            {card.company && (
              <p className={`text-sm font-medium mt-0.5 ${cc.textColor ? '' : c.companyColor}`} style={cc.textColor ? { color: cc.textColor } : undefined}>{card.company}</p>
            )}

            {/* Contact info */}
            <div className="mt-4 space-y-1.5">
              {card.phone && (
                <p className={`text-xs ${cc.textColor ? '' : c.titleColor}`} style={cc.textColor ? { color: cc.textColor } : undefined}>{card.phone}</p>
              )}
              {card.email && (
                <p className={`text-xs ${cc.textColor ? '' : c.titleColor}`} style={cc.textColor ? { color: cc.textColor } : undefined}>{card.email}</p>
              )}
              {card.address && (
                <p className={`text-xs ${cc.textColor ? '' : c.titleColor}`} style={cc.textColor ? { color: cc.textColor } : undefined}>{card.address}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div {...fade} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 mb-6">
          {card.phone && (
            <a href={`tel:${card.phone}`} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${c.actionColors.call}`} onClick={() => onAction?.('call')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call
            </a>
          )}
          {card.email && (
            <a href={`mailto:${card.email}`} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${c.actionColors.email}`} onClick={() => onAction?.('email')}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email
            </a>
          )}
          {card.whatsapp && (
            <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener" className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${c.actionColors.whatsapp}`} onClick={() => onAction?.('whatsapp')}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              WhatsApp
            </a>
          )}
          <a href={`/api/v1/vcards/public/${card.slug}/vcf`} download className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${c.actionColors.save}`} onClick={() => onAction?.('save_contact')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Save
          </a>
        </motion.div>

        {/* Social icons */}
        <motion.div {...fade} transition={{ delay: 0.25 }} className="mb-8">
          <SocialIcons
            card={card}
            onAction={onAction}
            variant={c.pageBg.startsWith('#0') || c.pageBg.startsWith('#1') ? 'dark' : 'light'}
          />
        </motion.div>

        {/* Services */}
        {card.services.length > 0 && (
          <motion.div {...fade} transition={{ delay: 0.3 }} className="mb-8">
            <h2 className={`text-xs font-semibold uppercase tracking-widest ${cc.accent ? '' : c.sectionTitleColor} mb-3 px-1`} style={cc.accent ? { color: cc.accent } : undefined}>
              Services
            </h2>
            <div className="space-y-2">
              {card.services.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-4 rounded-2xl ${c.serviceBg} border ${c.serviceBorder}`}
                >
                  {s.icon && (
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${c.serviceIconBg}`}>
                      {s.icon}
                    </span>
                  )}
                  <div>
                    <p className={`text-sm font-medium ${cc.nameColor ? '' : c.nameColor}`} style={cc.nameColor ? { color: cc.nameColor } : undefined}>{s.title}</p>
                    {s.description && (
                      <p className={`text-xs mt-0.5 ${cc.textColor ? '' : c.titleColor}`} style={cc.textColor ? { color: cc.textColor } : undefined}>{s.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div {...fade} transition={{ delay: 0.4 }} className="text-center pt-6">
          <div className={`${c.dividerStyle} mb-4`} />
          <p className={`text-xs ${c.footerColor}`}>Powered by NexaStack</p>
        </motion.div>
      </div>
    </div>
  );
}
