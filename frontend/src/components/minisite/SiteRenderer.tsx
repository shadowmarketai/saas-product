import { motion } from 'framer-motion';
import type { MiniSitePublicData } from '@/types/minisite';
import type { SiteTemplateConfig } from './siteTemplateConfigs';

export interface SiteRendererProps {
  site: MiniSitePublicData;
  config: SiteTemplateConfig;
  preview?: boolean;
}

const fadeUp = { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-50px' }, transition: { duration: 0.6 } };

/* ═══════════════════════════════════════════════
   SVG DECORATIONS — these make templates look unique
   ═══════════════════════════════════════════════ */

function WaveDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ marginTop: -1, marginBottom: -1 }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
        <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120Z" fill={color} />
      </svg>
    </div>
  );
}

function DiagonalDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ marginTop: -1 }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-12 md:h-20">
        <polygon points="0,80 1440,0 1440,80" fill={color} />
      </svg>
    </div>
  );
}

function CurveDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ marginTop: -1 }}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-14 md:h-20">
        <path d="M0,100 Q720,-40 1440,100 L1440,100 L0,100Z" fill={color} />
      </svg>
    </div>
  );
}

function ZigzagDivider({ color }: { color: string }) {
  return (
    <div className="w-full overflow-hidden leading-none" style={{ marginTop: -1 }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-8 md:h-14">
        <polygon points="0,60 60,0 120,60 180,0 240,60 300,0 360,60 420,0 480,60 540,0 600,60 660,0 720,60 780,0 840,60 900,0 960,60 1020,0 1080,60 1140,0 1200,60 1260,0 1320,60 1380,0 1440,60" fill={color} />
      </svg>
    </div>
  );
}

function SectionDivider({ type, color, flip }: { type?: string; color: string; flip?: boolean }) {
  if (!type || type === 'none') return null;
  switch (type) {
    case 'wave': return <WaveDivider color={color} flip={flip} />;
    case 'diagonal': return <DiagonalDivider color={color} flip={flip} />;
    case 'curve': return <CurveDivider color={color} flip={flip} />;
    case 'zigzag': return <ZigzagDivider color={color} />;
    default: return null;
  }
}

function HeroDecoration({ type, color }: { type?: string; color: string }) {
  if (!type || type === 'none') return null;
  const o = '0.08';
  switch (type) {
    case 'blobs':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: color, opacity: 0.15 }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl" style={{ background: color, opacity: 0.1 }} />
          <div className="absolute top-1/3 left-1/4 w-60 h-60 rounded-full blur-3xl" style={{ background: color, opacity: 0.08 }} />
        </div>
      );
    case 'waves':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,192L60,208C120,224,240,256,360,245.3C480,235,600,181,720,181.3C840,181,960,235,1080,245.3C1200,256,1320,224,1380,208L1440,192L1440,320L0,320Z" fill={color} fillOpacity={o} />
          </svg>
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,256L60,240C120,224,240,192,360,192C480,192,600,224,720,234.7C840,245,960,235,1080,213.3C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z" fill={color} fillOpacity="0.05" />
          </svg>
        </div>
      );
    case 'grid-dots':
      return (
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(${color}30 1.5px, transparent 1.5px)`,
          backgroundSize: '30px 30px',
          opacity: 0.4,
        }} />
      );
    case 'circles':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border-2 opacity-10" style={{ borderColor: color }} />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full border-2 opacity-10" style={{ borderColor: color }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5" style={{ borderColor: color }} />
        </div>
      );
    case 'diagonal':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, ${color}08 40px, ${color}08 42px)`,
        }} />
      );
    case 'geometric':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-10 right-20 w-32 h-32 opacity-10" viewBox="0 0 100 100"><polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="none" stroke={color} strokeWidth="2" /></svg>
          <svg className="absolute bottom-20 left-16 w-20 h-20 opacity-10" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="none" stroke={color} strokeWidth="2" transform="rotate(15 50 50)" /></svg>
          <svg className="absolute top-1/3 left-1/3 w-16 h-16 opacity-10" viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="none" stroke={color} strokeWidth="2" /></svg>
        </div>
      );
    case 'particles':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse" style={{
              background: color,
              opacity: 0.2 + Math.random() * 0.3,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }} />
          ))}
        </div>
      );
    default: return null;
  }
}


/* ═══════════════════════════════════════════════
   MAIN RENDERER
   ═══════════════════════════════════════════════ */

/** Check if a value is a hex/rgb color (not a Tailwind class) */
function isColor(v: string) { return v.startsWith('#') || v.startsWith('rgb'); }

/** Return inline style for color if it's a hex/rgb value, otherwise empty */
function cs(v: string): React.CSSProperties { return isColor(v) ? { color: v } : {}; }

/** Return inline style for background if it's a hex/rgb/gradient value */
function bg(v: string): React.CSSProperties { return (isColor(v) || v.startsWith('linear')) ? { background: v } : {}; }

export function SiteRenderer({ site, config: rawConfig, preview }: SiteRendererProps) {
  const s = site;
  const cc = s.custom_colors || {};

  // Apply custom_colors overrides to config
  const c: SiteTemplateConfig = {
    ...rawConfig,
    ...(cc.pageBg && { pageBg: cc.pageBg }),
    ...(cc.heroBg && { heroBg: cc.heroBg }),
    ...(cc.heroText && { heroTextColor: cc.heroText }),
    ...(cc.heroSubText && { heroSubColor: cc.heroSubText }),
    ...(cc.accent && { accentColor: cc.accent }),
    ...(cc.sectionTitle && { sectionTitleColor: cc.sectionTitle }),
    ...(cc.aboutBg && { aboutBg: cc.aboutBg }),
    ...(cc.aboutText && { aboutSubColor: cc.aboutText, aboutTextColor: cc.aboutText }),
    ...(cc.featureBg && { featureBg: cc.featureBg }),
    ...(cc.featureCardBg && { featureCardBg: cc.featureCardBg }),
    ...(cc.featureTitle && { featureTitleColor: cc.featureTitle }),
    ...(cc.featureText && { featureTextColor: cc.featureText }),
    ...(cc.testimonialBg && { testimonialBg: cc.testimonialBg }),
    ...(cc.testimonialText && { testimonialTextColor: cc.testimonialText, testimonialNameColor: cc.testimonialText }),
    ...(cc.ctaBg && { ctaBg: cc.ctaBg }),
    ...(cc.ctaText && { ctaTextColor: cc.ctaText }),
    ...(cc.footerBg && { footerBg: cc.footerBg }),
    ...(cc.footerText && { footerTextColor: cc.footerText, footerSubColor: cc.footerText }),
  };

  const isDark = c.pageBg.startsWith('#0') || c.pageBg.startsWith('#1');

  return (
    <div className={`min-w-0 ${preview ? 'max-h-[700px] overflow-auto' : ''} ${c.fontClass}`} style={{ background: c.pageBg }}>

      {/* ══════ NAVBAR ══════ */}
      <nav className={`${c.navPosition === 'fixed' ? 'fixed' : c.navPosition === 'static' ? 'relative' : 'sticky'} top-0 z-50 w-full transition-all ${
        c.navStyle === 'glass' ? 'backdrop-blur-xl bg-opacity-70' : ''
      } ${c.navBg}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {s.logo_url && <img src={s.logo_url} alt="" className="h-9 w-9 rounded-xl object-cover shadow-sm" />}
            <span className="text-base font-bold tracking-tight" style={cs(c.navTextColor)}>{s.site_name}</span>
          </div>
          <div className="flex items-center gap-5">
            {s.phone && <a href={`tel:${s.phone}`} className="text-xs font-medium opacity-60 hover:opacity-100 transition hidden md:block" style={cs(c.navTextColor)}>{s.phone}</a>}
            {(s.hero_cta_text || s.whatsapp) && (
              <a href={s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}` : (s.hero_cta_url || '#')} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all hover:scale-105 ${c.heroBtnClass}`}>
                {s.whatsapp ? 'WhatsApp' : s.hero_cta_text}
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ HERO SECTION ══════ */}
      {(s.hero_title || s.hero_subtitle) && (
        <section className={`relative overflow-hidden ${c.heroHeight}`} style={{ background: c.heroImage ? undefined : c.heroBg }}>
          {/* Background image */}
          {(c.heroImage || s.hero_image_url) && c.heroLayout !== 'split' && (
            <img src={c.heroImage || s.hero_image_url!} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {c.heroOverlay && <div className="absolute inset-0" style={{ background: c.heroOverlay }} />}
          {!c.heroImage && s.hero_image_url && c.heroLayout !== 'split' && (
            <div className="absolute inset-0 bg-black/40" />
          )}

          {/* Decorative elements */}
          <HeroDecoration type={c.heroDecor} color={c.accentColor} />

          {/* Content */}
          <div className={`relative z-10 h-full flex items-center ${c.heroLayout === 'fullscreen' ? 'min-h-screen' : ''}`}>
            <div className={`w-full max-w-6xl mx-auto px-6 ${
              c.heroLayout === 'centered' ? 'text-center' :
              c.heroLayout === 'split' ? 'flex flex-col md:flex-row items-center gap-12' :
              ''
            }`}>
              <div className={c.heroLayout === 'split' ? 'flex-1 md:pr-8' : c.heroLayout === 'centered' ? 'max-w-3xl mx-auto' : 'max-w-2xl'}>
                {s.tagline && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${c.heroBtnClass} opacity-80`}>
                      {s.tagline}
                    </span>
                  </motion.div>
                )}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
                  style={cs(c.heroTextColor)}
                >
                  {s.hero_title}
                </motion.h1>
                {s.hero_subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`mt-6 text-lg md:text-xl leading-relaxed ${c.heroLayout === 'centered' ? 'mx-auto' : ''} max-w-xl`}
                    style={cs(c.heroSubColor)}
                  >
                    {s.hero_subtitle}
                  </motion.p>
                )}
                {s.hero_cta_text && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex items-center gap-4 flex-wrap" style={{ justifyContent: c.heroLayout === 'centered' ? 'center' : 'flex-start' }}>
                    <a href={s.hero_cta_url || '#'} className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${c.heroBtnClass}`}>
                      {s.hero_cta_text}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </a>
                    {s.phone && (
                      <a href={`tel:${s.phone}`} className={`inline-flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-semibold border transition-all hover:scale-105 ${isDark ? 'border-white/20 text-white/80 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Call Us
                      </a>
                    )}
                  </motion.div>
                )}
              </div>
              {/* Split layout image */}
              {c.heroLayout === 'split' && s.hero_image_url && (
                <motion.div initial={{ opacity: 0, x: 40, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="flex-1 hidden md:block">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl" style={{ background: c.accentColor }} />
                    <img src={s.hero_image_url} alt="" className={`relative ${c.borderRadius} shadow-2xl max-h-[450px] w-full object-cover`} />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Divider: Hero → About */}
      <SectionDivider type={c.sectionDivider} color={c.aboutBg.startsWith('bg-') ? c.pageBg : c.aboutBg} />

      {/* ══════ ABOUT SECTION ══════ */}
      {(s.about_title || s.about_text) && (
        <section className={c.sectionPadding} style={bg(c.aboutBg)}>
          <div className="max-w-6xl mx-auto px-6">
            {c.aboutLayout === 'centered' ? (
              <div className="max-w-3xl mx-auto text-center">
                {s.about_image_url && (
                  <motion.img {...fadeUp} src={s.about_image_url} alt="" className={`w-full max-h-72 object-cover ${c.borderRadius} shadow-lg mb-8`} />
                )}
                {s.about_title && <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-bold mb-6" style={cs(c.sectionTitleColor)}>{s.about_title}</motion.h2>}
                {s.about_text && <motion.p {...fadeUp} className="text-base md:text-lg leading-relaxed" style={cs(c.aboutSubColor)}>{s.about_text}</motion.p>}
              </div>
            ) : (
              <div className={`flex flex-col ${c.aboutLayout === 'text-right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
                {s.about_image_url && (
                  <motion.div {...fadeUp} className="flex-1 w-full">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-3xl opacity-10 blur-xl" style={{ background: c.accentColor }} />
                      <img src={s.about_image_url} alt="" className={`relative w-full max-h-80 object-cover ${c.borderRadius} shadow-xl`} />
                    </div>
                  </motion.div>
                )}
                <motion.div {...fadeUp} className="flex-1">
                  {s.about_title && <h2 className="text-3xl md:text-4xl font-bold mb-4" style={cs(c.sectionTitleColor)}>{s.about_title}</h2>}
                  <div className="w-16 h-1 rounded-full mb-6" style={{ background: c.accentColor }} />
                  {s.about_text && <p className="text-base leading-relaxed" style={cs(c.aboutSubColor)}>{s.about_text}</p>}
                </motion.div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Divider: About → Features */}
      <SectionDivider type={c.sectionDivider} color={c.featureBg.startsWith('bg-') ? c.pageBg : c.featureBg} />

      {/* ══════ FEATURES SECTION ══════ */}
      {s.features.length > 0 && (
        <section className={`${c.sectionPadding} relative`} style={bg(c.featureBg)}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={cs(c.sectionTitleColor)}>Features</h2>
              <div className="w-12 h-1 rounded-full mx-auto mt-4" style={{ background: c.accentColor }} />
            </motion.div>

            {/* Feature cards with different styles */}
            {(c.featureCardStyle === 'icon-top-centered' || !c.featureCardStyle) && c.featureLayout === 'grid-3' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={`text-center p-8 border ${c.featureCardBorder} ${c.featureCardShadow} ${c.borderRadius} hover:shadow-xl transition-all hover:-translate-y-1`} style={bg(c.featureCardBg)}>
                    {f.icon && <span className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-5 ${c.featureIconBg}`}>{f.icon}</span>}
                    <h3 className="text-lg font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                    {f.description && <p className="mt-2 text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            {c.featureCardStyle === 'left-icon-row' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={`flex items-start gap-5 p-6 border ${c.featureCardBorder} ${c.featureCardShadow} ${c.borderRadius} hover:shadow-lg transition-all`} style={bg(c.featureCardBg)}>
                    {f.icon && <span className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${c.featureIconBg}`}>{f.icon}</span>}
                    <div>
                      <h3 className="text-base font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                      {f.description && <p className="mt-1.5 text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {c.featureCardStyle === 'elevated' && (
              <div className={`grid ${c.featureLayout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={`relative p-8 ${c.borderRadius} shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden`} style={bg(c.featureCardBg)}>
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: c.accentColor }} />
                    {f.icon && <span className="text-3xl mb-4 block">{f.icon}</span>}
                    <h3 className="text-lg font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                    {f.description && <p className="mt-2 text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            {c.featureCardStyle === 'bordered' && (
              <div className={`grid ${c.featureLayout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={`p-6 border-2 ${c.featureCardBorder} ${c.borderRadius} hover:border-opacity-100 transition-all`} style={{ borderColor: `${c.accentColor}30` }}>
                    <div className="flex items-center gap-3 mb-3">
                      {f.icon && <span className="text-xl">{f.icon}</span>}
                      <h3 className="text-base font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                    </div>
                    {f.description && <p className="text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            {c.featureCardStyle === 'gradient-border' && (
              <div className={`grid ${c.featureLayout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="p-[2px] rounded-2xl" style={{ background: `linear-gradient(135deg, ${c.accentColor}, ${c.accentColor}40)` }}>
                    <div className="p-6 h-full rounded-[14px]" style={bg(c.featureCardBg)}>
                      {f.icon && <span className={`inline-flex w-12 h-12 rounded-xl items-center justify-center text-xl mb-4 ${c.featureIconBg}`}>{f.icon}</span>}
                      <h3 className="text-base font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                      {f.description && <p className="mt-2 text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {c.featureCardStyle === 'flat' && (
              <div className={`grid ${c.featureLayout === 'grid-2' ? 'grid-cols-1 md:grid-cols-2 gap-10' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'}`}>
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                    {f.icon && <span className="text-3xl mb-3 block">{f.icon}</span>}
                    <h3 className="text-lg font-bold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                    <div className="w-8 h-0.5 mt-2 mb-3" style={{ background: c.accentColor }} />
                    {f.description && <p className="text-sm leading-relaxed" style={cs(c.featureTextColor)}>{f.description}</p>}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Fallback for configs without featureCardStyle */}
            {!c.featureCardStyle && c.featureLayout !== 'grid-3' && (
              <div className={
                c.featureLayout === 'grid-2' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' :
                c.featureLayout === 'list' ? 'max-w-2xl mx-auto space-y-6' :
                'space-y-12'
              }>
                {s.features.map((f, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={
                    c.featureLayout === 'alternating'
                      ? `flex items-start gap-6 ${i % 2 !== 0 ? 'flex-row-reverse text-right' : ''}`
                      : `p-6 border ${c.featureCardBorder} ${c.featureCardShadow} ${c.borderRadius} hover:shadow-lg transition-all`
                  } style={c.featureLayout !== 'alternating' ? bg(c.featureCardBg) : undefined}>
                    {f.icon && <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${c.featureIconBg}`}>{f.icon}</span>}
                    <div className={c.featureLayout !== 'alternating' ? 'mt-4' : ''}>
                      <h3 className="text-lg font-semibold" style={cs(c.featureTitleColor)}>{f.title}</h3>
                      {f.description && <p className="mt-2 text-sm" style={cs(c.featureTextColor)}>{f.description}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════ GALLERY SECTION ══════ */}
      {s.gallery.length > 0 && (
        <section className={c.sectionPadding} style={bg(c.galleryBg)}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div {...fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold" style={cs(c.sectionTitleColor)}>Gallery</h2>
            </motion.div>
            <div className={
              c.galleryLayout === 'masonry' ? 'columns-2 md:columns-3 gap-4 space-y-4' :
              'grid grid-cols-2 md:grid-cols-3 gap-4'
            }>
              {s.gallery.map((img, i) => (
                <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.05 }} className={`overflow-hidden ${c.borderRadius} group ${c.galleryLayout === 'masonry' ? 'break-inside-avoid' : ''}`}>
                  <img src={img} alt="" className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${c.galleryLayout === 'masonry' ? '' : 'aspect-square'}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Divider: Gallery → Testimonials */}
      {s.testimonials.length > 0 && <SectionDivider type={c.sectionDivider} color={c.testimonialBg.startsWith('bg-') ? c.pageBg : c.testimonialBg} />}

      {/* ══════ TESTIMONIALS SECTION ══════ */}
      {s.testimonials.length > 0 && (
        <section className={c.sectionPadding} style={bg(c.testimonialBg)}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={cs(c.sectionTitleColor)}>What People Say</h2>
              <div className="w-12 h-1 rounded-full mx-auto mt-4" style={{ background: c.accentColor }} />
            </motion.div>

            {/* Quote Large style */}
            {c.testimonialStyle === 'quote-large' && (
              <div className="max-w-3xl mx-auto space-y-10">
                {s.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="text-center">
                    <span className="text-5xl leading-none opacity-20" style={{ color: c.accentColor }}>"</span>
                    <p className="text-xl md:text-2xl leading-relaxed italic -mt-6" style={cs(c.testimonialTextColor)}>{t.text}</p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      {t.avatar_url && <img src={t.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />}
                      <div>
                        <p className="text-sm font-bold" style={cs(c.testimonialNameColor)}>{t.name}</p>
                        {t.role && <p className="text-xs opacity-60" style={cs(c.testimonialTextColor)}>{t.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bubble style */}
            {c.testimonialStyle === 'bubble' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {s.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                    <div className={`relative p-6 border ${c.testimonialCardBorder} ${c.borderRadius}`} style={bg(c.testimonialCardBg)}>
                      <p className="text-sm leading-relaxed" style={cs(c.testimonialTextColor)}>"{t.text}"</p>
                      <div className="absolute -bottom-2 left-8 w-4 h-4 rotate-45 border-r border-b" style={{ background: 'inherit', borderColor: 'inherit' }} />
                    </div>
                    <div className="flex items-center gap-3 mt-5 ml-4">
                      {t.avatar_url && <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />}
                      <div>
                        <p className="text-sm font-bold" style={cs(c.testimonialNameColor)}>{t.name}</p>
                        {t.role && <p className="text-xs opacity-60" style={cs(c.testimonialTextColor)}>{t.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Minimal line style */}
            {c.testimonialStyle === 'minimal-line' && (
              <div className="max-w-2xl mx-auto divide-y" style={{ borderColor: `${c.accentColor}20` }}>
                {s.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="py-8">
                    <p className="text-base leading-relaxed" style={cs(c.testimonialTextColor)}>"{t.text}"</p>
                    <p className="text-sm font-semibold mt-3" style={cs(c.testimonialNameColor)}>— {t.name}{t.role ? `, ${t.role}` : ''}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Default card style */}
            {(!c.testimonialStyle || c.testimonialStyle === 'card') && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {s.testimonials.map((t, i) => (
                  <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className={`p-6 border ${c.testimonialCardBorder} ${c.borderRadius} hover:shadow-lg transition-all`} style={bg(c.testimonialCardBg)}>
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => <span key={j} className="text-amber-400 text-sm">★</span>)}
                    </div>
                    <p className="text-sm italic leading-relaxed" style={cs(c.testimonialTextColor)}>"{t.text}"</p>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t" style={{ borderColor: `${c.accentColor}15` }}>
                      {t.avatar_url ? (
                        <img src={t.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `${c.accentColor}15`, color: c.accentColor }}>{t.name[0]}</div>
                      )}
                      <div>
                        <p className="text-sm font-semibold" style={cs(c.testimonialNameColor)}>{t.name}</p>
                        {t.role && <p className="text-xs opacity-60" style={cs(c.testimonialTextColor)}>{t.role}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════ CTA SECTION ══════ */}
      {(s.cta_title || s.cta_button_text) && (
        <>
          <SectionDivider type={c.sectionDivider} color={c.ctaBg.startsWith('bg-') ? c.pageBg : c.ctaBg} />
          <section className={`${c.sectionPadding} relative overflow-hidden`} style={{ background: c.ctaBg.startsWith('bg-') ? undefined : c.ctaBg }} >
            <HeroDecoration type={c.heroDecor} color={isDark ? '#ffffff' : c.accentColor} />
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              {s.cta_title && (
                <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-bold" style={cs(c.ctaTextColor)}>
                  {s.cta_title}
                </motion.h2>
              )}
              {s.cta_subtitle && (
                <motion.p {...fadeUp} className="mt-4 text-lg opacity-70 max-w-xl mx-auto" style={cs(c.ctaTextColor)}>
                  {s.cta_subtitle}
                </motion.p>
              )}
              {s.cta_button_text && (
                <motion.div {...fadeUp} className="mt-8">
                  <a href={s.cta_button_url || '#'} className={`inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-xl ${c.ctaBtnClass}`}>
                    {s.cta_button_text}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </a>
                </motion.div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ══════ FOOTER ══════ */}
      <footer className={c.sectionPadding} style={bg(c.footerBg)}>
        <div className="max-w-6xl mx-auto px-6">
          {(c.footerStyle === 'columns' || !c.footerStyle) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  {s.logo_url && <img src={s.logo_url} alt="" className="h-10 w-10 rounded-xl object-cover" />}
                  <span className="text-lg font-bold" style={cs(c.footerTextColor)}>{s.site_name}</span>
                </div>
                {s.tagline && <p className="text-sm leading-relaxed" style={cs(c.footerSubColor)}>{s.tagline}</p>}
              </div>
              <div>
                <h4 className="text-sm font-bold mb-4" style={cs(c.footerTextColor)}>Contact</h4>
                <div className="space-y-2.5 text-sm" style={cs(c.footerSubColor)}>
                  {s.phone && <p className="flex items-center gap-2">📞 {s.phone}</p>}
                  {s.email && <p className="flex items-center gap-2">✉️ {s.email}</p>}
                  {s.address && <p className="flex items-center gap-2">📍 {s.address}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold mb-4" style={cs(c.footerTextColor)}>Follow Us</h4>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { k: 'website', u: s.website, l: '🌐' },
                    { k: 'linkedin', u: s.linkedin, l: 'in' },
                    { k: 'instagram', u: s.instagram, l: 'IG' },
                    { k: 'twitter', u: s.twitter, l: '𝕏' },
                    { k: 'youtube', u: s.youtube, l: '▶' },
                    { k: 'github', u: s.github, l: 'GH' },
                  ].filter(l => l.u).map(l => (
                    <a key={l.k} href={l.u!} target="_blank" rel="noopener" className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-110 hover:shadow-md`} style={{ background: `${c.accentColor}15`, color: c.accentColor }}>
                      {l.l}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {c.footerStyle === 'centered-minimal' && (
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2.5 mb-3">
                {s.logo_url && <img src={s.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                <span className="text-lg font-bold" style={cs(c.footerTextColor)}>{s.site_name}</span>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap mt-4">
                {s.phone && <a href={`tel:${s.phone}`} className="text-xs hover:opacity-80" style={cs(c.footerSubColor)}>{s.phone}</a>}
                {s.email && <a href={`mailto:${s.email}`} className="text-xs hover:opacity-80" style={cs(c.footerSubColor)}>{s.email}</a>}
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                {[s.website, s.linkedin, s.instagram, s.twitter, s.youtube, s.github]
                  .filter(Boolean).map((url, i) => (
                  <a key={i} href={url!} target="_blank" rel="noopener" className="w-8 h-8 rounded-full flex items-center justify-center text-xs hover:opacity-80 border" style={{ borderColor: `${c.accentColor}20`, ...cs(c.footerSubColor) }}>•</a>
                ))}
              </div>
            </div>
          )}

          {c.footerStyle === 'simple' && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                {s.logo_url && <img src={s.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                <span className="text-base font-bold" style={cs(c.footerTextColor)}>{s.site_name}</span>
              </div>
              <div className="flex items-center gap-4">
                {s.phone && <a href={`tel:${s.phone}`} className="text-xs" style={cs(c.footerSubColor)}>{s.phone}</a>}
                {s.email && <a href={`mailto:${s.email}`} className="text-xs" style={cs(c.footerSubColor)}>{s.email}</a>}
              </div>
            </div>
          )}

          <div className="border-t pt-6 text-center text-xs" style={{ borderColor: `${c.accentColor}15`, ...cs(c.footerSubColor) }}>
            {s.footer_text || `© ${new Date().getFullYear()} ${s.site_name}. All rights reserved.`}
            <span className="block mt-1 opacity-40">Powered by NexaStack</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
