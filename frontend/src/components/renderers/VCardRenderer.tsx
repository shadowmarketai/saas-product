import { QRCodeSVG } from 'qrcode.react';
import { CARD_DESIGNS } from '@/components/ui/CardDesignSelector';
import type { CardDesign } from '@/components/ui/CardDesignSelector';

interface VCardData {
  full_name?: string;
  designation?: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  google_maps?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  profile_photo?: string;
  logo_url?: string;
  services?: string[];
  business_hours?: string;
  theme_primary?: string;
  theme_secondary?: string;
  theme_accent?: string;
  theme_bg?: string;
  theme_text?: string;
  font_family?: string;
  layout?: string;
  card_design?: string;
}

interface VCardRendererProps {
  data: VCardData;
  slug?: string;
  preview?: boolean;
}

function hexToRgb(hex: string): string {
  const c = hex.replace('#', '');
  return `${parseInt(c.substring(0, 2), 16)}, ${parseInt(c.substring(2, 4), 16)}, ${parseInt(c.substring(4, 6), 16)}`;
}

export function VCardRenderer({ data, slug, preview = false }: VCardRendererProps) {
  const primary = data.theme_primary || '#003049';
  const secondary = data.theme_secondary || '#669BBC';
  const font = data.font_family || 'Inter, sans-serif';

  // Get selected card design or default
  const design: CardDesign = CARD_DESIGNS.find((d) => d.id === data.card_design) || CARD_DESIGNS[0];

  // Replace var(--primary) / var(--secondary) in design strings
  const resolve = (s: string) =>
    s.replace(/var\(--primary\)/g, primary)
     .replace(/var\(--secondary\)/g, secondary)
     .replace(/var\(--primary-rgb\)/g, hexToRgb(primary));

  const bodyBg = resolve(design.bodyBg);
  const headerBg = resolve(design.headerBg);
  const pattern = resolve(design.pattern);
  const sectionColor = resolve(design.sectionColor);
  const contactBg = resolve(design.contactBg);
  const nameColor = resolve(design.nameColor);
  const subtitleColor = resolve(design.subtitleColor);
  const btnRadius = design.buttonStyle === 'pill' ? '9999px' : design.buttonStyle === 'sharp' ? '8px' : '12px';
  const socialRadius = design.socialStyle === 'square' ? '8px' : design.socialStyle === 'pill' ? '12px' : '50%';

  const shareUrl = slug ? `${window.location.origin}/p/${slug}` : '';

  const generateVcf = () => {
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${data.full_name || ''}`,
      `ORG:${data.company || ''}`,
      `TITLE:${data.designation || ''}`,
      data.phone ? `TEL;TYPE=CELL:${data.phone}` : '',
      data.email ? `EMAIL:${data.email}` : '',
      data.website ? `URL:${data.website}` : '',
      data.address ? `ADR:;;${data.address}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');

    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.full_name || 'contact').replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const socials = [
    data.facebook && { url: data.facebook, label: 'f', bg: '#1877F2' },
    data.instagram && { url: data.instagram, label: 'in', bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
    data.linkedin && { url: data.linkedin, label: 'Li', bg: '#0A66C2' },
    data.youtube && { url: data.youtube, label: 'Yt', bg: '#FF0000' },
    data.twitter && { url: data.twitter, label: '𝕏', bg: '#000000' },
  ].filter(Boolean) as { url: string; label: string; bg: string }[];

  return (
    <div
      className={`${preview ? 'max-w-sm' : 'max-w-md'} mx-auto overflow-hidden shadow-2xl`}
      style={{
        background: bodyBg,
        backgroundImage: pattern || undefined,
        fontFamily: font,
        borderRadius: design.cardRadius,
      }}
    >
      {/* Header Banner */}
      <div className="relative h-36" style={{ background: headerBg }}>
        {/* Logo */}
        {data.logo_url && (
          <img src={data.logo_url} alt="Logo" className="absolute top-4 left-4 h-10 object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        )}
        {/* Profile Photo */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          {data.profile_photo ? (
            <img src={data.profile_photo} alt={data.full_name} className="w-24 h-24 rounded-full border-4 shadow-lg object-cover" style={{ borderColor: bodyBg.startsWith('linear') ? '#fff' : bodyBg.startsWith('#') ? bodyBg : '#fff' }} />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 shadow-lg flex items-center justify-center text-3xl font-bold" style={{ background: headerBg, borderColor: bodyBg.startsWith('#') ? bodyBg : '#fff', color: '#fff' }}>
              {(data.full_name || 'U')[0]}
            </div>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="text-center pt-14 px-6">
        <h1 className="text-2xl font-bold" style={{ color: nameColor }}>{data.full_name || 'Your Name'}</h1>
        {data.designation && <p className="text-sm mt-1" style={{ color: subtitleColor }}>{data.designation}</p>}
        {data.company && <p className="text-sm font-medium mt-0.5" style={{ color: sectionColor }}>{data.company}</p>}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex justify-center gap-3 px-6 mt-5">
        {data.phone && (
          <a href={`tel:${data.phone}`} className="flex-1 py-2.5 text-white text-sm font-medium text-center transition-transform hover:scale-105" style={{ background: headerBg, borderRadius: btnRadius }}>
            📞 Call
          </a>
        )}
        {data.whatsapp && (
          <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-2.5 text-white text-sm font-medium text-center transition-transform hover:scale-105" style={{ backgroundColor: '#25D366', borderRadius: btnRadius }}>
            💬 WhatsApp
          </a>
        )}
        {data.email && (
          <a href={`mailto:${data.email}`} className="flex-1 py-2.5 text-white text-sm font-medium text-center transition-transform hover:scale-105" style={{ background: headerBg, opacity: 0.85, borderRadius: btnRadius }}>
            ✉️ Email
          </a>
        )}
      </div>

      {/* Contact Details */}
      <div className="px-6 mt-6 space-y-3">
        {[
          data.phone && { icon: '📞', label: 'Phone', value: data.phone, href: `tel:${data.phone}` },
          data.email && { icon: '✉️', label: 'Email', value: data.email, href: `mailto:${data.email}` },
          data.website && { icon: '🌐', label: 'Website', value: data.website, href: data.website },
          data.address && { icon: '📍', label: 'Address', value: data.address, href: data.google_maps },
        ].filter(Boolean).map((item) => {
          const c = item as { icon: string; label: string; value: string; href?: string };
          return (
            <div key={c.label} className="flex items-center gap-3 p-3" style={{ backgroundColor: contactBg, borderRadius: btnRadius }}>
              <span className="text-lg">{c.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs" style={{ color: subtitleColor, opacity: 0.7 }}>{c.label}</p>
                {c.href ? (
                  <a href={c.href} target={c.label === 'Website' ? '_blank' : undefined} rel="noreferrer" className="text-sm font-medium truncate block" style={{ color: sectionColor }}>{c.value}</a>
                ) : (
                  <p className="text-sm font-medium truncate" style={{ color: nameColor }}>{c.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Services */}
      {data.services && data.services.length > 0 && data.services[0] !== '' && (
        <div className="px-6 mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: sectionColor }}>Services</h3>
          <div className="flex flex-wrap gap-2">
            {data.services.map((s, i) => (
              <span key={i} className="px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: contactBg, color: sectionColor, borderRadius: btnRadius }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Business Hours */}
      {data.business_hours && (
        <div className="px-6 mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: sectionColor }}>Business Hours</h3>
          <p className="text-sm" style={{ color: subtitleColor }}>{data.business_hours}</p>
        </div>
      )}

      {/* Social Links */}
      {socials.length > 0 && (
        <div className="px-6 mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: sectionColor }}>Connect</h3>
          <div className="flex justify-center gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center text-white text-sm font-bold transition-transform hover:scale-110" style={{ background: s.bg, borderRadius: socialRadius }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* QR Code & Share */}
      {shareUrl && (
        <div className="px-6 mt-6 text-center">
          <div className="inline-block p-3 rounded-2xl shadow-md" style={{ backgroundColor: contactBg }}>
            <QRCodeSVG value={shareUrl} size={120} fgColor={nameColor.startsWith('#') ? nameColor : primary} bgColor="transparent" />
          </div>
          <p className="text-xs mt-2" style={{ color: subtitleColor, opacity: 0.5 }}>Scan to view this card</p>
        </div>
      )}

      {/* Save Contact Button */}
      <div className="px-6 py-6 mt-4">
        <button
          onClick={generateVcf}
          className="w-full py-3 text-white font-semibold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ background: headerBg, borderRadius: btnRadius }}
        >
          💾 Save Contact
        </button>
        {shareUrl && (
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="w-full mt-2 py-2.5 text-sm font-medium border-2 transition-colors"
            style={{ borderColor: sectionColor, color: sectionColor, borderRadius: btnRadius, backgroundColor: 'transparent' }}
          >
            🔗 Share Card
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-3 text-xs" style={{ color: subtitleColor, opacity: 0.3 }}>
        Powered by NexaStack
      </div>
    </div>
  );
}
