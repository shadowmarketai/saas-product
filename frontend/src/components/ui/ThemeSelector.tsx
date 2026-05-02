import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  category: string;
}

const THEMES: Theme[] = [
  // ===== OCEAN & WATER =====
  { id: 'ocean-wave', name: 'Ocean Wave', primary: '#0077B6', secondary: '#00B4D8', accent: '#90E0EF', bg: '#CAF0F8', text: '#03045E', category: 'Nature' },
  { id: 'deep-sea', name: 'Deep Sea', primary: '#023E8A', secondary: '#0077B6', accent: '#48CAE4', bg: '#EBF5FB', text: '#012A4A', category: 'Nature' },
  { id: 'arctic-frost', name: 'Arctic Frost', primary: '#4CC9F0', secondary: '#7DF9FF', accent: '#B8F2E6', bg: '#F0FFFE', text: '#1B3A4B', category: 'Nature' },
  { id: 'coral-reef', name: 'Coral Reef', primary: '#FF6B6B', secondary: '#FFA07A', accent: '#20B2AA', bg: '#FFF5F5', text: '#2D3436', category: 'Nature' },

  // ===== SUNSET & WARM =====
  { id: 'golden-sunset', name: 'Golden Sunset', primary: '#E85D04', secondary: '#F48C06', accent: '#FAA307', bg: '#FFF8E1', text: '#370617', category: 'Warm' },
  { id: 'desert-sand', name: 'Desert Sand', primary: '#C2956B', secondary: '#D4A574', accent: '#E8C99B', bg: '#FFF8F0', text: '#3E2723', category: 'Warm' },
  { id: 'autumn-leaves', name: 'Autumn Leaves', primary: '#B7410E', secondary: '#D2691E', accent: '#DAA520', bg: '#FFF3E0', text: '#3E2723', category: 'Warm' },
  { id: 'warm-coral', name: 'Warm Coral', primary: '#F72585', secondary: '#FF6B6B', accent: '#FFA07A', bg: '#FFF0F5', text: '#3A0CA3', category: 'Warm' },
  { id: 'peach-blossom', name: 'Peach Blossom', primary: '#FF8C69', secondary: '#FFB09C', accent: '#FFD1C1', bg: '#FFF5F0', text: '#5D2E1F', category: 'Warm' },
  { id: 'terracotta', name: 'Terracotta', primary: '#C05621', secondary: '#DD6B20', accent: '#ED8936', bg: '#FFFAF0', text: '#652B19', category: 'Warm' },

  // ===== NATURE & EARTH =====
  { id: 'forest-green', name: 'Forest Green', primary: '#2D6A4F', secondary: '#40916C', accent: '#95D5B2', bg: '#D8F3DC', text: '#1B4332', category: 'Nature' },
  { id: 'bamboo', name: 'Bamboo', primary: '#4A7C59', secondary: '#6BAF7C', accent: '#A3D9A5', bg: '#F0FFF4', text: '#1C3D2A', category: 'Nature' },
  { id: 'sakura', name: 'Sakura', primary: '#D1477A', secondary: '#E88EAD', accent: '#F2C1D1', bg: '#FFF0F3', text: '#4A1028', category: 'Nature' },
  { id: 'lavender-field', name: 'Lavender Field', primary: '#7C3AED', secondary: '#A78BFA', accent: '#DDD6FE', bg: '#F5F3FF', text: '#3B0764', category: 'Nature' },
  { id: 'fresh-mint', name: 'Fresh Mint', primary: '#06D6A0', secondary: '#10B981', accent: '#6EE7B7', bg: '#ECFDF5', text: '#064E3B', category: 'Nature' },
  { id: 'olive-grove', name: 'Olive Grove', primary: '#6B7A3D', secondary: '#8B9A5B', accent: '#C5D68F', bg: '#F7F8F0', text: '#2D3319', category: 'Nature' },

  // ===== DARK & LUXURY =====
  { id: 'midnight', name: 'Midnight', primary: '#1A1A2E', secondary: '#16213E', accent: '#E94560', bg: '#0F3460', text: '#FFFFFF', category: 'Dark' },
  { id: 'noir', name: 'Noir', primary: '#000000', secondary: '#1A1A1A', accent: '#FFD700', bg: '#111111', text: '#F5F5F5', category: 'Dark' },
  { id: 'dark-nebula', name: 'Dark Nebula', primary: '#2D1B69', secondary: '#5B21B6', accent: '#8B5CF6', bg: '#0F0B1F', text: '#E9E5F5', category: 'Dark' },
  { id: 'charcoal', name: 'Charcoal', primary: '#2D3748', secondary: '#4A5568', accent: '#63B3ED', bg: '#1A202C', text: '#E2E8F0', category: 'Dark' },
  { id: 'dark-rose', name: 'Dark Rose', primary: '#9D174D', secondary: '#BE185D', accent: '#F472B6', bg: '#1F0413', text: '#FDF2F8', category: 'Dark' },

  // ===== PROFESSIONAL & CORPORATE =====
  { id: 'professional', name: 'Professional', primary: '#003049', secondary: '#669BBC', accent: '#FDF0D5', bg: '#FFFFFF', text: '#1A1A2E', category: 'Corporate' },
  { id: 'corporate-blue', name: 'Corporate Blue', primary: '#1E3A5F', secondary: '#3B82F6', accent: '#93C5FD', bg: '#FFFFFF', text: '#0F172A', category: 'Corporate' },
  { id: 'executive', name: 'Executive', primary: '#1F2937', secondary: '#374151', accent: '#D97706', bg: '#FFFFFF', text: '#111827', category: 'Corporate' },
  { id: 'slate-steel', name: 'Slate Steel', primary: '#475569', secondary: '#64748B', accent: '#38BDF8', bg: '#F8FAFC', text: '#0F172A', category: 'Corporate' },
  { id: 'navy-gold', name: 'Navy Gold', primary: '#1B2A4A', secondary: '#2C4A7C', accent: '#D4AF37', bg: '#FAFBFD', text: '#0D1B2A', category: 'Corporate' },

  // ===== ELEGANT & ROYAL =====
  { id: 'royal-purple', name: 'Royal Purple', primary: '#7209B7', secondary: '#560BAD', accent: '#B5179E', bg: '#F3E5F5', text: '#240046', category: 'Elegant' },
  { id: 'elegant-gold', name: 'Elegant Gold', primary: '#B08968', secondary: '#7F5539', accent: '#DDB892', bg: '#FFF8F0', text: '#3E2723', category: 'Elegant' },
  { id: 'champagne', name: 'Champagne', primary: '#8B7355', secondary: '#A89070', accent: '#D4C4A8', bg: '#FAF7F2', text: '#3E3329', category: 'Elegant' },
  { id: 'rose-gold', name: 'Rose Gold', primary: '#B76E79', secondary: '#D4A0A7', accent: '#F0D0D4', bg: '#FFF5F6', text: '#5C2A2F', category: 'Elegant' },
  { id: 'emerald-luxury', name: 'Emerald Luxury', primary: '#065F46', secondary: '#047857', accent: '#D4AF37', bg: '#F0FDF4', text: '#022C22', category: 'Elegant' },
  { id: 'ruby-red', name: 'Ruby Red', primary: '#9B1B30', secondary: '#C41E3A', accent: '#FFD700', bg: '#FFF5F5', text: '#4A0E1C', category: 'Elegant' },

  // ===== MODERN & TRENDY =====
  { id: 'neon-glow', name: 'Neon Glow', primary: '#00F5FF', secondary: '#FF00E5', accent: '#FAFF00', bg: '#0A0A0F', text: '#EEEEFF', category: 'Modern' },
  { id: 'synthwave', name: 'Synthwave', primary: '#FF2975', secondary: '#F222FF', accent: '#8B31FF', bg: '#120320', text: '#F8E3FF', category: 'Modern' },
  { id: 'gradient-pop', name: 'Gradient Pop', primary: '#6366F1', secondary: '#EC4899', accent: '#8B5CF6', bg: '#FFFFFF', text: '#1E1B4B', category: 'Modern' },
  { id: 'pastel-dream', name: 'Pastel Dream', primary: '#A78BFA', secondary: '#FDA4AF', accent: '#FDE68A', bg: '#FEFCE8', text: '#4C1D95', category: 'Modern' },
  { id: 'electric-blue', name: 'Electric Blue', primary: '#2563EB', secondary: '#3B82F6', accent: '#06B6D4', bg: '#FFFFFF', text: '#1E3A8A', category: 'Modern' },
  { id: 'candy-pink', name: 'Candy Pink', primary: '#EC4899', secondary: '#F472B6', accent: '#FBCFE8', bg: '#FDF2F8', text: '#831843', category: 'Modern' },

  // ===== MINIMAL & CLEAN =====
  { id: 'minimal', name: 'Minimal', primary: '#2B2D42', secondary: '#8D99AE', accent: '#EF233C', bg: '#EDF2F4', text: '#2B2D42', category: 'Minimal' },
  { id: 'pure-white', name: 'Pure White', primary: '#111827', secondary: '#6B7280', accent: '#3B82F6', bg: '#FFFFFF', text: '#111827', category: 'Minimal' },
  { id: 'soft-gray', name: 'Soft Gray', primary: '#4B5563', secondary: '#9CA3AF', accent: '#6366F1', bg: '#F9FAFB', text: '#1F2937', category: 'Minimal' },
  { id: 'paper', name: 'Paper', primary: '#44403C', secondary: '#78716C', accent: '#D97706', bg: '#FAFAF9', text: '#292524', category: 'Minimal' },
  { id: 'ink', name: 'Ink', primary: '#18181B', secondary: '#3F3F46', accent: '#A1A1AA', bg: '#FAFAFA', text: '#09090B', category: 'Minimal' },

  // ===== HEALTHCARE =====
  { id: 'clinical-teal', name: 'Clinical Teal', primary: '#0D9488', secondary: '#14B8A6', accent: '#5EEAD4', bg: '#F0FDFA', text: '#134E4A', category: 'Industry' },
  { id: 'healing-blue', name: 'Healing Blue', primary: '#0284C7', secondary: '#38BDF8', accent: '#7DD3FC', bg: '#F0F9FF', text: '#0C4A6E', category: 'Industry' },

  // ===== FOOD & RESTAURANT =====
  { id: 'spice', name: 'Spice', primary: '#DC2626', secondary: '#FB923C', accent: '#FDE68A', bg: '#FFF7ED', text: '#1C1917', category: 'Industry' },
  { id: 'cafe-latte', name: 'Cafe Latte', primary: '#78350F', secondary: '#92400E', accent: '#D4A574', bg: '#FFFBEB', text: '#451A03', category: 'Industry' },
  { id: 'fresh-organic', name: 'Fresh Organic', primary: '#15803D', secondary: '#22C55E', accent: '#86EFAC', bg: '#F0FDF4', text: '#052E16', category: 'Industry' },

  // ===== BEAUTY & FASHION =====
  { id: 'blush', name: 'Blush', primary: '#BE185D', secondary: '#EC4899', accent: '#FBCFE8', bg: '#FFF1F2', text: '#500724', category: 'Industry' },
  { id: 'mauve', name: 'Mauve', primary: '#7E22CE', secondary: '#A855F7', accent: '#E9D5FF', bg: '#FAF5FF', text: '#3B0764', category: 'Industry' },
];

const CATEGORIES = ['All', 'Nature', 'Warm', 'Dark', 'Corporate', 'Elegant', 'Modern', 'Minimal', 'Industry'];

interface ThemeSelectorProps {
  selected: string;
  onSelect: (theme: Theme) => void;
}

export function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(true);

  const filtered = category === 'All' ? THEMES : THEMES.filter((t) => t.category === category);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
      >
        <span>🎨 Design Themes ({THEMES.length} styles)</span>
        <span className="text-gray-400 text-xs">{expanded ? '▲ Collapse' : '▼ Expand'}</span>
      </button>

      {expanded && (
        <>
          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {filtered.map((theme) => {
              const isSelected = selected === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelect(theme)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                    isSelected
                      ? 'border-blue-500 shadow-lg scale-[1.03] ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                  }`}
                >
                  {/* Mini preview */}
                  <div className="h-20 relative" style={{ backgroundColor: theme.bg }}>
                    {/* Header bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-7"
                      style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
                    />
                    {/* Circle avatar */}
                    <div
                      className="absolute top-4 left-3 w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: theme.accent, borderColor: theme.bg }}
                    />
                    {/* Text lines */}
                    <div className="absolute top-5 left-11 right-3 space-y-1">
                      <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: theme.text, opacity: 0.7 }} />
                      <div className="h-1 rounded-full w-1/2" style={{ backgroundColor: theme.text, opacity: 0.3 }} />
                    </div>
                    {/* Button */}
                    <div
                      className="absolute bottom-2 left-3 right-3 h-3 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }}
                    />
                    {/* Selected check */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Name + colors */}
                  <div className="px-2.5 py-2 bg-white">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{theme.name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[theme.primary, theme.secondary, theme.accent, theme.bg, theme.text].map((c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {filtered.length} themes shown &middot; Click to apply
          </p>
        </>
      )}
    </div>
  );
}

export { THEMES };
export type { Theme };
