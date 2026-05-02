interface WebsiteData {
  business_name?: string;
  tagline?: string;
  about?: string;
  logo_url?: string;
  hero_image?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  google_maps?: string;
  services?: { name: string; description: string; icon?: string }[];
  gallery?: string[];
  testimonials?: { name: string; text: string; rating: number }[];
  faq?: { question: string; answer: string }[];
  theme_primary?: string;
  theme_secondary?: string;
  theme_bg?: string;
  theme_text?: string;
  font_family?: string;
  cta_text?: string;
  cta_link?: string;
}

interface WebsiteRendererProps {
  data: WebsiteData;
  preview?: boolean;
}

export function WebsiteRenderer({ data, preview = false }: WebsiteRendererProps) {
  const primary = data.theme_primary || '#0077B6';
  const secondary = data.theme_secondary || '#00B4D8';
  const bg = data.theme_bg || '#FFFFFF';
  const text = data.theme_text || '#03045E';

  return (
    <div className={`${preview ? 'max-w-sm text-xs' : 'max-w-4xl text-base'} mx-auto`} style={{ backgroundColor: bg, color: text, fontFamily: data.font_family || 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {data.logo_url && <img src={data.logo_url} alt="" className="h-8 object-contain" />}
          <span className="font-bold" style={{ color: primary }}>{data.business_name || 'Business Name'}</span>
        </div>
        {data.phone && (
          <a href={`tel:${data.phone}`} className="px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primary }}>
            Call Now
          </a>
        )}
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-16 text-center" style={{ background: data.hero_image ? `url(${data.hero_image}) center/cover` : `linear-gradient(135deg, ${primary}15, ${secondary}15)` }}>
        {data.hero_image && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative">
          <h1 className={`${preview ? 'text-2xl' : 'text-4xl'} font-bold`} style={data.hero_image ? { color: '#fff' } : {}}>{data.business_name || 'Your Business'}</h1>
          {data.tagline && <p className={`${preview ? 'text-sm' : 'text-lg'} mt-3 opacity-80`} style={data.hero_image ? { color: '#fff' } : {}}>{data.tagline}</p>}
          {data.cta_text && (
            <a href={data.cta_link || '#contact'} className="inline-block mt-6 px-8 py-3 rounded-full text-white font-semibold shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: primary }}>
              {data.cta_text}
            </a>
          )}
        </div>
      </section>

      {/* About */}
      {data.about && (
        <section className="px-6 py-12">
          <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-center mb-4`} style={{ color: primary }}>About Us</h2>
          <p className="max-w-2xl mx-auto text-center opacity-75 leading-relaxed">{data.about}</p>
        </section>
      )}

      {/* Services */}
      {data.services && data.services.length > 0 && (
        <section className="px-6 py-12" style={{ backgroundColor: `${primary}05` }}>
          <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-center mb-8`} style={{ color: primary }}>Our Services</h2>
          <div className={`grid ${preview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6 max-w-4xl mx-auto`}>
            {data.services.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md text-center">
                <span className="text-3xl block mb-3">{s.icon || '✨'}</span>
                <h3 className="font-semibold mb-2">{s.name}</h3>
                <p className="text-sm opacity-60">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="px-6 py-12">
          <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-center mb-8`} style={{ color: primary }}>Gallery</h2>
          <div className={`grid ${preview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3 max-w-4xl mx-auto`}>
            {data.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section className="px-6 py-12" style={{ backgroundColor: `${primary}05` }}>
          <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-center mb-8`} style={{ color: primary }}>What Our Clients Say</h2>
          <div className={`grid ${preview ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6 max-w-3xl mx-auto`}>
            {data.testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex gap-1 mb-2">{Array.from({ length: t.rating }).map((_, j) => <span key={j}>⭐</span>)}</div>
                <p className="text-sm opacity-75 italic">"{t.text}"</p>
                <p className="mt-3 font-semibold text-sm" style={{ color: primary }}>— {t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {data.faq && data.faq.length > 0 && (
        <section className="px-6 py-12">
          <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-center mb-8`} style={{ color: primary }}>FAQ</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {data.faq.map((f, i) => (
              <details key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <summary className="font-semibold cursor-pointer">{f.question}</summary>
                <p className="mt-2 text-sm opacity-75">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="px-6 py-12 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
        <h2 className={`${preview ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>Get In Touch</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {data.phone && <a href={`tel:${data.phone}`} className="px-6 py-3 bg-white rounded-full font-medium shadow-md" style={{ color: primary }}>📞 {data.phone}</a>}
          {data.whatsapp && <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white rounded-full font-medium shadow-md text-green-600">💬 WhatsApp</a>}
          {data.email && <a href={`mailto:${data.email}`} className="px-6 py-3 bg-white rounded-full font-medium shadow-md" style={{ color: primary }}>✉️ {data.email}</a>}
        </div>
        {data.address && <p className="text-white/80 mt-4 text-sm">📍 {data.address}</p>}
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-xs opacity-30">
        Powered by NexaStack
      </footer>
    </div>
  );
}

export type { WebsiteData };
