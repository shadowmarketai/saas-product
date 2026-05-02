import { useState } from 'react';

interface PosterItem {
  id: string;
  title: string;
  image_url?: string;
  caption?: string;
  category: string;
  created_at?: string;
}

interface SocialPosterData {
  business_name?: string;
  logo_url?: string;
  posters?: PosterItem[];
  categories?: string[];
  upcoming_events?: { name: string; date: string; type: string }[];
  total_shared?: number;
  total_downloads?: number;
  theme_primary?: string;
  theme_secondary?: string;
  theme_bg?: string;
  theme_text?: string;
  font_family?: string;
}

interface SocialPosterRendererProps {
  data: SocialPosterData;
  preview?: boolean;
}

export function SocialPosterRenderer({ data, preview = false }: SocialPosterRendererProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);

  const primary = data.theme_primary || '#E91E63';
  const secondary = data.theme_secondary || '#9C27B0';
  const bg = data.theme_bg || '#FAFAFA';
  const text = data.theme_text || '#1A1A2E';
  const font = data.font_family || 'Inter, sans-serif';
  const posters = data.posters || [];
  const categories = ['All', ...(data.categories || ['Festival', 'Offer', 'Product', 'Event', 'Custom'])];
  const events = data.upcoming_events || [];

  const filtered = activeCategory === 'All' ? posters : posters.filter((p) => p.category === activeCategory);

  const copyCaption = (caption: string, id: string) => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(id);
    setTimeout(() => setCopiedCaption(null), 2000);
  };

  return (
    <div className={`${preview ? 'max-w-sm' : 'max-w-4xl'} mx-auto min-h-screen`} style={{ backgroundColor: bg, color: text, fontFamily: font }}>
      {/* Header */}
      <div className="px-6 py-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
        {data.logo_url && <img src={data.logo_url} alt="" className="h-12 mx-auto mb-3 object-contain" />}
        <h1 className="text-2xl font-bold text-white">{data.business_name || 'Business Name'}</h1>
        <p className="text-sm text-white/80 mt-1">Social Media Poster Studio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-6 -mt-5">
        {[
          { icon: '🎨', value: posters.length, label: 'Posters' },
          { icon: '📤', value: data.total_shared || 0, label: 'Shared' },
          { icon: '⬇️', value: data.total_downloads || 0, label: 'Downloads' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 text-center shadow-md border border-gray-100">
            <span className="text-lg">{s.icon}</span>
            <p className="text-lg font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="px-6 mt-6 overflow-x-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={activeCategory === cat ? { backgroundColor: primary, color: '#fff' } : { backgroundColor: '#f3f4f6' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Poster Grid */}
      <div className={`px-6 mt-6 grid ${preview ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 opacity-40">
            <p className="text-4xl mb-2">🎨</p>
            <p>No posters in this category</p>
          </div>
        ) : (
          filtered.map((poster) => (
            <div key={poster.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-transform hover:scale-[1.02]">
              {/* Poster Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {poster.image_url ? (
                  <img src={poster.image_url} alt={poster.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primary}20, ${secondary}20)` }}>
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
                {/* Category Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primary }}>
                  {poster.category}
                </span>
              </div>

              <div className="p-3">
                <h4 className="font-semibold text-sm truncate">{poster.title}</h4>
                {poster.caption && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{poster.caption}</p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-white" style={{ backgroundColor: '#25D366' }} title="Share on WhatsApp">
                    WhatsApp
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-white" style={{ background: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)' }} title="Share on Instagram">
                    Instagram
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xs bg-gray-100 hover:bg-gray-200 transition-colors" title="Download">
                    ⬇️
                  </button>
                </div>

                {/* Copy Caption */}
                {poster.caption && (
                  <button
                    onClick={() => copyCaption(poster.caption!, poster.id)}
                    className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-medium border transition-colors"
                    style={{ borderColor: primary, color: copiedCaption === poster.id ? '#10B981' : primary }}
                  >
                    {copiedCaption === poster.id ? '✓ Copied!' : '📋 Copy Caption'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div className="px-6 mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: primary }}>📅 Upcoming Events</h3>
          <div className="space-y-2">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${primary}15` }}>
                  {ev.type === 'Festival' ? '🎉' : ev.type === 'Holiday' ? '🏖️' : ev.type === 'Season' ? '🌸' : '📌'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{ev.name}</p>
                  <p className="text-xs text-gray-400">{ev.date}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${primary}15`, color: primary }}>
                  {ev.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-6 text-xs opacity-30 mt-4">
        Powered by NexaStack
      </div>
    </div>
  );
}

export type { SocialPosterData, PosterItem };
