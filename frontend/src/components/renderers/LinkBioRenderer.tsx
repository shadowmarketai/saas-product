interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface LinkBioData {
  display_name?: string;
  bio?: string;
  profile_photo?: string;
  cover_image?: string;
  links?: BioLink[];
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_linkedin?: string;
  social_twitter?: string;
  theme_primary?: string;
  theme_secondary?: string;
  theme_bg?: string;
  theme_text?: string;
  layout?: 'rounded' | 'sharp' | 'pill';
}

interface LinkBioRendererProps {
  data: LinkBioData;
  preview?: boolean;
}

const LINK_ICONS: Record<string, string> = {
  website: '🌐', whatsapp: '💬', youtube: '▶️', instagram: '📸',
  facebook: '👤', linkedin: '💼', email: '✉️', phone: '📞',
  maps: '📍', shop: '🛒', menu: '🍽️', booking: '📅',
  portfolio: '💎', blog: '📝', music: '🎵', podcast: '🎙️',
};

export function LinkBioRenderer({ data, preview = false }: LinkBioRendererProps) {
  const primary = data.theme_primary || '#7209B7';
  const secondary = data.theme_secondary || '#560BAD';
  const bg = data.theme_bg || '#F3E5F5';
  const text = data.theme_text || '#240046';
  const links = data.links || [];
  const layout = data.layout || 'rounded';
  const radius = layout === 'pill' ? '9999px' : layout === 'sharp' ? '8px' : '16px';

  const socials = [
    data.social_facebook && { url: data.social_facebook, icon: '👤', label: 'Facebook' },
    data.social_instagram && { url: data.social_instagram, icon: '📸', label: 'Instagram' },
    data.social_youtube && { url: data.social_youtube, icon: '▶️', label: 'YouTube' },
    data.social_linkedin && { url: data.social_linkedin, icon: '💼', label: 'LinkedIn' },
    data.social_twitter && { url: data.social_twitter, icon: '🐦', label: 'Twitter' },
  ].filter(Boolean) as { url: string; icon: string; label: string }[];

  return (
    <div className={`${preview ? 'max-w-sm' : 'max-w-md'} mx-auto min-h-screen px-4 py-8`} style={{ backgroundColor: bg, color: text, fontFamily: 'Inter, sans-serif' }}>
      {/* Cover Image */}
      {data.cover_image && (
        <div className="h-32 rounded-2xl overflow-hidden mb-6 bg-cover bg-center" style={{ backgroundImage: `url(${data.cover_image})` }} />
      )}

      {/* Profile */}
      <div className="text-center mb-8">
        {data.profile_photo ? (
          <img src={data.profile_photo} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: '#fff' }}>
            {(data.display_name || 'U')[0]}
          </div>
        )}
        <h1 className="text-xl font-bold">{data.display_name || 'Your Name'}</h1>
        {data.bio && <p className="text-sm opacity-70 mt-1 max-w-xs mx-auto">{data.bio}</p>}
      </div>

      {/* Social Icons */}
      {socials.length > 0 && (
        <div className="flex justify-center gap-3 mb-6">
          {socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform hover:scale-110" style={{ backgroundColor: primary }}>
              {s.icon}
            </a>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="space-y-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="block w-full px-5 py-3.5 text-center font-medium text-sm border-2 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: primary,
              borderRadius: radius,
              color: primary,
              backgroundColor: '#FFFFFF',
            }}
          >
            <span className="mr-2">{link.icon ? (LINK_ICONS[link.icon] || '🔗') : '🔗'}</span>
            {link.title}
          </a>
        ))}
        {links.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <p className="text-3xl mb-2">🔗</p>
            <p className="text-sm">No links added yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-xs opacity-30">
        Powered by NexaStack
      </div>
    </div>
  );
}

export type { LinkBioData, BioLink };
