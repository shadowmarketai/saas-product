import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_veg?: boolean;
  is_bestseller?: boolean;
  is_spicy?: boolean;
  is_available?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface QRMenuData {
  restaurant_name?: string;
  tagline?: string;
  logo_url?: string;
  banner_url?: string;
  categories?: MenuCategory[];
  currency?: string;
  theme_primary?: string;
  theme_secondary?: string;
  theme_bg?: string;
  theme_text?: string;
  show_images?: boolean;
  layout?: 'list' | 'grid';
}

interface QRMenuRendererProps {
  data: QRMenuData;
  preview?: boolean;
}

export function QRMenuRenderer({ data, preview = false }: QRMenuRendererProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const primary = data.theme_primary || '#D62828';
  const bg = data.theme_bg || '#FFF8F0';
  const text = data.theme_text || '#2B2D42';
  const currency = data.currency || '₹';
  const categories = data.categories || [];
  const layout = data.layout || 'list';

  return (
    <div className={`${preview ? 'max-w-sm' : 'max-w-lg'} mx-auto min-h-screen`} style={{ backgroundColor: bg, color: text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      {data.banner_url && (
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${data.banner_url})` }}>
          <div className="h-full w-full bg-gradient-to-b from-transparent to-black/50 flex items-end p-4">
            <h1 className="text-2xl font-bold text-white">{data.restaurant_name}</h1>
          </div>
        </div>
      )}
      {!data.banner_url && (
        <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}CC)` }}>
          {data.logo_url && <img src={data.logo_url} alt="" className="h-16 mx-auto mb-3 object-contain" />}
          <h1 className="text-2xl font-bold text-white">{data.restaurant_name || 'Restaurant Name'}</h1>
          {data.tagline && <p className="text-sm text-white/80 mt-1">{data.tagline}</p>}
        </div>
      )}

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-10 overflow-x-auto flex gap-1 p-2 border-b" style={{ backgroundColor: bg }}>
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(i)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === i ? 'text-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
              style={activeCategory === i ? { backgroundColor: primary } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div className="p-4">
        {categories.length === 0 ? (
          <div className="text-center py-16 opacity-40">
            <p className="text-4xl mb-2">🍽️</p>
            <p>No menu items yet</p>
          </div>
        ) : (
          <div className={layout === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
            {(categories[activeCategory]?.items || []).map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-md ${
                  !item.is_available ? 'opacity-50' : ''
                }`}
                style={{ backgroundColor: '#FFFFFF' }}
              >
                {data.show_images && item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.is_veg !== undefined && (
                          <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
                            item.is_veg ? 'border-green-600' : 'border-red-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </span>
                        )}
                        <h3 className="font-semibold text-sm">{item.name}</h3>
                      </div>
                      {item.description && <p className="text-xs opacity-60 mt-1 line-clamp-2">{item.description}</p>}
                      <div className="flex gap-1.5 mt-2">
                        {item.is_bestseller && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${primary}15`, color: primary }}>Bestseller</span>}
                        {item.is_spicy && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-50 text-red-600">Spicy 🌶️</span>}
                        {!item.is_available && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">Unavailable</span>}
                      </div>
                    </div>
                    <span className="font-bold text-sm whitespace-nowrap" style={{ color: primary }}>
                      {currency}{item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs opacity-30">
        Powered by NexaStack
      </div>
    </div>
  );
}

export type { QRMenuData, MenuCategory, MenuItem };
