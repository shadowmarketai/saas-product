import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MenuTemplateConfig } from './menuTemplateConfigs';
import type {
  PublicMenu,
  PublicMenuCategory,
  PublicMenuItem,
  CartItem,
} from '@/types/qrmenu';

/* ═══════════════════════════════════════════
   Constants & Helpers
   ═══════════════════════════════════════════ */

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
};

function formatCurrency(amount: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' ';
  return `${sym}${amount.toFixed(2)}`;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getSpacingClass(spacing: 'compact' | 'normal' | 'spacious'): string {
  const map: Record<string, string> = {
    compact: 'gap-2 p-2',
    normal: 'gap-4 p-4',
    spacious: 'gap-6 p-6',
  };
  return map[spacing];
}

function getSectionGap(spacing: 'compact' | 'normal' | 'spacious'): string {
  const map: Record<string, string> = {
    compact: 'mb-4',
    normal: 'mb-6',
    spacious: 'mb-8',
  };
  return map[spacing];
}

function getLogoSizeClass(size: 'sm' | 'md' | 'lg'): string {
  const map: Record<string, string> = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  return map[size];
}

function getImageSizeClass(
  size: 'sm' | 'md' | 'lg',
  layout: string
): string {
  if (layout === 'vertical' || layout === 'grid-square') return 'w-full h-40';
  if (layout === 'detailed') return 'w-full h-48';
  const map: Record<string, string> = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  return map[size];
}

function getImageShapeClass(
  style: 'rounded' | 'square' | 'circle' | 'none'
): string {
  const map: Record<string, string> = {
    rounded: 'rounded-lg',
    square: 'rounded-none',
    circle: 'rounded-full',
    none: '',
  };
  return map[style];
}

function getCartItemQty(cart: CartItem[], menuItemId: number): number {
  const found = cart.find((c) => c.menuItemId === menuItemId);
  return found ? found.quantity : 0;
}

/* ═══════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════ */

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' },
  }),
};

const cartBounceAnimation = {
  scale: [1, 1.15, 1],
  transition: { duration: 0.35 },
};

/* ═══════════════════════════════════════════
   Diet Badge Sub-component
   ═══════════════════════════════════════════ */

interface DietBadgeProps {
  type: string;
  badgeStyle: 'dot' | 'tag' | 'icon' | 'border';
}

const DIET_CONFIG: Record<string, { border: string; fill: string; label: string; emoji: string }> = {
  veg: { border: 'border-green-600', fill: 'bg-green-600', label: 'Veg', emoji: '🟢' },
  non_veg: { border: 'border-red-600', fill: 'bg-red-600', label: 'Non-Veg', emoji: '🔴' },
  vegan: { border: 'border-green-700', fill: 'bg-green-700', label: 'Vegan', emoji: '🌿' },
  egg: { border: 'border-yellow-500', fill: 'bg-yellow-500', label: 'Egg', emoji: '🟡' },
};

function DietBadge({ type, badgeStyle }: DietBadgeProps) {
  const c = DIET_CONFIG[type] ?? DIET_CONFIG.veg;

  if (badgeStyle === 'dot') {
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 border-2 ${c.border} rounded-sm shrink-0`}
        title={c.label}
      >
        <span className={`block w-1.5 h-1.5 rounded-full ${c.fill}`} />
      </span>
    );
  }

  if (badgeStyle === 'tag') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded ${c.fill} text-white shrink-0`}
      >
        {c.label}
      </span>
    );
  }

  if (badgeStyle === 'icon') {
    return (
      <span className="text-sm shrink-0" title={c.label}>
        {c.emoji}
      </span>
    );
  }

  /* border */
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 ${c.border} rounded-full shrink-0`}
      title={c.label}
    >
      <span className={`block w-2 h-2 rounded-full ${c.fill}`} />
    </span>
  );
}

/* ═══════════════════════════════════════════
   Header Section
   ═══════════════════════════════════════════ */

interface HeaderProps {
  menu: PublicMenu;
  template: MenuTemplateConfig;
}

function MenuHeader({ menu, template }: HeaderProps) {
  const { header, page } = template;
  const logoSize = getLogoSizeClass(header.logoSize);

  const renderLogo = () =>
    menu.logo_url ? (
      <img
        src={menu.logo_url}
        alt={menu.restaurant_name}
        className={`${logoSize} object-cover rounded-full`}
      />
    ) : null;

  const renderText = () => (
    <div className={header.layout === 'centered' ? 'text-center' : ''}>
      <h1 className={`text-2xl font-bold ${header.textColor}`}>
        {menu.restaurant_name}
      </h1>
      {menu.description && (
        <p className={`mt-1 text-sm opacity-70 ${header.textColor}`}>
          {menu.description}
        </p>
      )}
      <span
        className={`inline-block mt-2 px-3 py-0.5 text-xs font-medium ${page.borderRadius} bg-black/10`}
      >
        Table {menu.table_number}
      </span>
    </div>
  );

  /* Overlay layout with cover image */
  if (header.layout === 'overlay' && header.showCover && menu.cover_image_url) {
    return (
      <div className="relative w-full h-52 overflow-hidden">
        <img
          src={menu.cover_image_url}
          alt="cover"
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 ${header.overlay ?? 'bg-black/40'} flex flex-col items-center justify-center`}
        >
          {renderLogo()}
          <div className="mt-2 text-center">
            <h1 className={`text-2xl font-bold ${header.textColor}`}>
              {menu.restaurant_name}
            </h1>
            {menu.description && (
              <p className={`mt-1 text-sm opacity-80 ${header.textColor}`}>
                {menu.description}
              </p>
            )}
            <span
              className={`inline-block mt-2 px-3 py-0.5 text-xs font-medium ${page.borderRadius} bg-white/20 ${header.textColor}`}
            >
              Table {menu.table_number}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* Split layout: logo left, text right */
  if (header.layout === 'split') {
    return (
      <div className={`${header.bgStyle} px-4 py-5`}>
        {header.showCover && menu.cover_image_url && (
          <div className="relative w-full h-32 overflow-hidden rounded-lg mb-4">
            <img
              src={menu.cover_image_url}
              alt="cover"
              className="w-full h-full object-cover"
            />
            {header.overlay && (
              <div className={`absolute inset-0 ${header.overlay}`} />
            )}
          </div>
        )}
        <div className="flex items-center gap-4">
          {renderLogo()}
          {renderText()}
        </div>
      </div>
    );
  }

  /* Minimal-bar layout */
  if (header.layout === 'minimal-bar') {
    return (
      <div className={`${header.bgStyle} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          {renderLogo()}
          <h1 className={`text-lg font-bold ${header.textColor}`}>
            {menu.restaurant_name}
          </h1>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-medium ${page.borderRadius} bg-black/10 ${header.textColor}`}
        >
          T-{menu.table_number}
        </span>
      </div>
    );
  }

  /* Left-aligned layout */
  if (header.layout === 'left-aligned') {
    return (
      <div className={`${header.bgStyle} px-4 py-5`}>
        {header.showCover && menu.cover_image_url && (
          <div className="relative w-full h-36 overflow-hidden rounded-lg mb-4">
            <img
              src={menu.cover_image_url}
              alt="cover"
              className="w-full h-full object-cover"
            />
            {header.overlay && (
              <div className={`absolute inset-0 ${header.overlay}`} />
            )}
          </div>
        )}
        <div className="flex items-start gap-4">
          {renderLogo()}
          {renderText()}
        </div>
      </div>
    );
  }

  /* Centered (default) */
  return (
    <div className={`${header.bgStyle} px-4 py-6`}>
      {header.showCover && menu.cover_image_url && (
        <div className="relative w-full h-40 overflow-hidden rounded-lg mb-4">
          <img
            src={menu.cover_image_url}
            alt="cover"
            className="w-full h-full object-cover"
          />
          {header.overlay && (
            <div className={`absolute inset-0 ${header.overlay}`} />
          )}
        </div>
      )}
      <div className="flex flex-col items-center">
        {renderLogo()}
        <div className="mt-2">{renderText()}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Category Navigation
   ═══════════════════════════════════════════ */

interface CategoryNavProps {
  categories: PublicMenuCategory[];
  activeCategoryId: number;
  onSelect: (id: number) => void;
  template: MenuTemplateConfig;
}

function CategoryNav({ categories, activeCategoryId, onSelect, template }: CategoryNavProps) {
  const { categoryNav, page } = template;
  const scrollRef = useRef<HTMLDivElement>(null);

  const positionClass =
    categoryNav.position === 'sticky-top'
      ? 'sticky top-0 z-20'
      : categoryNav.position === 'floating'
        ? 'sticky top-2 z-20 mx-2 rounded-xl shadow-lg'
        : '';

  const renderItem = (cat: PublicMenuCategory) => {
    const isActive = cat.id === activeCategoryId;
    const baseClasses = 'whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0';

    if (categoryNav.style === 'pills') {
      return (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${baseClasses} px-4 py-1.5 text-sm font-medium ${page.borderRadius} ${
            isActive ? categoryNav.activeStyle : `${categoryNav.textColor} hover:opacity-80`
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </motion.button>
      );
    }

    if (categoryNav.style === 'tabs') {
      return (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${baseClasses} px-4 py-2 text-sm font-medium rounded-t-lg ${
            isActive ? categoryNav.activeStyle : `${categoryNav.textColor} hover:opacity-80`
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </motion.button>
      );
    }

    if (categoryNav.style === 'underline') {
      return (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${baseClasses} px-3 py-2 text-sm font-medium border-b-2 border-transparent ${
            isActive ? categoryNav.activeStyle : `${categoryNav.textColor} hover:opacity-80`
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </motion.button>
      );
    }

    if (categoryNav.style === 'chips') {
      return (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${baseClasses} px-3 py-1 text-xs font-semibold rounded-full border ${
            isActive
              ? categoryNav.activeStyle
              : `${categoryNav.textColor} border-current hover:opacity-80`
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </motion.button>
      );
    }

    if (categoryNav.style === 'scroll-cards') {
      return (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`${baseClasses} flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium ${page.borderRadius} border ${
            isActive
              ? categoryNav.activeStyle
              : `${categoryNav.textColor} border-transparent hover:opacity-80`
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {cat.icon && <span className="text-lg">{cat.icon}</span>}
          <span>{cat.name}</span>
        </motion.button>
      );
    }

    /* sidebar — rendered as vertical list */
    return (
      <motion.button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={`${baseClasses} block w-full text-left px-3 py-2 text-sm font-medium rounded-lg ${
          isActive ? categoryNav.activeStyle : `${categoryNav.textColor} hover:opacity-80`
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {cat.icon && <span className="mr-1">{cat.icon}</span>}
        {cat.name}
      </motion.button>
    );
  };

  /* Sidebar renders as a vertical column — handled in main layout */
  if (categoryNav.style === 'sidebar') {
    return (
      <nav
        className={`${categoryNav.bgStyle} ${positionClass} flex flex-col gap-1 p-2 overflow-y-auto max-h-screen`}
      >
        {categories.map(renderItem)}
      </nav>
    );
  }

  return (
    <nav
      ref={scrollRef}
      className={`${categoryNav.bgStyle} ${positionClass} flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide`}
    >
      {categories.map(renderItem)}
    </nav>
  );
}

/* ═══════════════════════════════════════════
   Quantity Controls
   ═══════════════════════════════════════════ */

interface QuantityControlProps {
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  accentColor: string;
}

function QuantityControl({ quantity, onAdd, onRemove, accentColor }: QuantityControlProps) {
  if (quantity === 0) {
    return (
      <motion.button
        onClick={onAdd}
        className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-md border-2 border-${accentColor} text-${accentColor} hover:bg-${accentColor} hover:text-white transition-colors`}
        whileTap={{ scale: 0.9 }}
      >
        Add
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={onRemove}
        className={`w-7 h-7 flex items-center justify-center rounded-md border-2 border-${accentColor} text-${accentColor} font-bold text-sm`}
        whileTap={{ scale: 0.85 }}
      >
        -
      </motion.button>
      <span className="text-sm font-bold w-5 text-center">{quantity}</span>
      <motion.button
        onClick={onAdd}
        className={`w-7 h-7 flex items-center justify-center rounded-md bg-${accentColor} text-white font-bold text-sm`}
        whileTap={{ scale: 0.85 }}
      >
        +
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Popular Badge
   ═══════════════════════════════════════════ */

function PopularBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded bg-amber-100 text-amber-700">
      <span className="text-amber-500">★</span> Popular
    </span>
  );
}

/* ═══════════════════════════════════════════
   Menu Item Card
   ═══════════════════════════════════════════ */

interface MenuItemCardProps {
  item: PublicMenuItem;
  template: MenuTemplateConfig;
  currency: string;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  index: number;
}

function MenuItemCard({
  item,
  template,
  currency,
  quantity,
  onAdd,
  onRemove,
  index,
}: MenuItemCardProps) {
  const { itemCard, page, dietBadge } = template;
  const showImg = itemCard.showImage && item.image_url;
  const imgSize = getImageSizeClass(itemCard.imageSize, itemCard.layout);
  const imgShape = getImageShapeClass(itemCard.imageStyle);

  const unavailableClasses = !item.is_available ? 'opacity-50 pointer-events-none' : '';

  /* Compact layout: no image, minimal */
  if (itemCard.layout === 'compact') {
    return (
      <motion.div
        custom={index}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        className={`${itemCard.bgStyle} ${itemCard.borderStyle} ${itemCard.shadow} ${itemCard.hoverEffect} ${unavailableClasses} flex items-center justify-between py-3 px-2`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <DietBadge type={item.diet_type} badgeStyle={dietBadge.style} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`${itemCard.nameStyle} truncate`}>{item.name}</span>
              {item.is_popular && <PopularBadge />}
            </div>
            {item.description && (
              <p className={`${itemCard.descStyle} truncate`}>{item.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className={itemCard.priceStyle}>
            {formatCurrency(item.price, currency)}
          </span>
          {item.is_available && (
            <QuantityControl
              quantity={quantity}
              onAdd={onAdd}
              onRemove={onRemove}
              accentColor={page.accentColor}
            />
          )}
        </div>
      </motion.div>
    );
  }

  /* Detailed layout: large image, full description, prep time */
  if (itemCard.layout === 'detailed') {
    return (
      <motion.div
        custom={index}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        className={`${itemCard.bgStyle} ${itemCard.borderStyle} ${page.borderRadius} ${itemCard.shadow} ${itemCard.hoverEffect} ${unavailableClasses} overflow-hidden`}
      >
        {showImg && (
          <div className={`${imgSize} overflow-hidden`}>
            <img
              src={item.image_url as string}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <DietBadge type={item.diet_type} badgeStyle={dietBadge.style} />
              <h3 className={`${itemCard.nameStyle}`}>{item.name}</h3>
              {item.is_popular && <PopularBadge />}
            </div>
            <span className={`${itemCard.priceStyle} shrink-0`}>
              {formatCurrency(item.price, currency)}
            </span>
          </div>
          {item.description && (
            <p className={`${itemCard.descStyle} mt-2`}>{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {item.preparation_time && (
                <span className="text-xs opacity-60">
                  ⏱ {formatTime(item.preparation_time)}
                </span>
              )}
              {!item.is_available && (
                <span className="text-xs text-red-500 font-medium">Unavailable</span>
              )}
            </div>
            {item.is_available && (
              <QuantityControl
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                accentColor={page.accentColor}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* Vertical layout: image on top, content below (card grid) */
  if (itemCard.layout === 'vertical') {
    return (
      <motion.div
        custom={index}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        className={`${itemCard.bgStyle} ${itemCard.borderStyle} ${page.borderRadius} ${itemCard.shadow} ${itemCard.hoverEffect} ${unavailableClasses} overflow-hidden flex flex-col`}
      >
        {showImg && (
          <div className={`${imgSize} overflow-hidden`}>
            <img
              src={item.image_url as string}
              alt={item.name}
              className={`w-full h-full object-cover ${imgShape}`}
            />
          </div>
        )}
        <div className="p-3 flex flex-col flex-1">
          <div className="flex items-center gap-1.5">
            <DietBadge type={item.diet_type} badgeStyle={dietBadge.style} />
            <h3 className={`${itemCard.nameStyle} truncate`}>{item.name}</h3>
          </div>
          {item.is_popular && (
            <div className="mt-1">
              <PopularBadge />
            </div>
          )}
          {item.description && (
            <p className={`${itemCard.descStyle} mt-1 line-clamp-2`}>{item.description}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className={itemCard.priceStyle}>
              {formatCurrency(item.price, currency)}
            </span>
            {item.is_available && (
              <QuantityControl
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                accentColor={page.accentColor}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* Grid-square layout: square cards in 2-col grid */
  if (itemCard.layout === 'grid-square') {
    return (
      <motion.div
        custom={index}
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-20px' }}
        className={`${itemCard.bgStyle} ${itemCard.borderStyle} ${page.borderRadius} ${itemCard.shadow} ${itemCard.hoverEffect} ${unavailableClasses} overflow-hidden flex flex-col`}
      >
        {showImg && (
          <div className="aspect-square overflow-hidden">
            <img
              src={item.image_url as string}
              alt={item.name}
              className={`w-full h-full object-cover ${imgShape}`}
            />
          </div>
        )}
        <div className="p-2 flex flex-col flex-1">
          <div className="flex items-center gap-1">
            <DietBadge type={item.diet_type} badgeStyle={dietBadge.style} />
            <h3 className={`${itemCard.nameStyle} truncate text-sm`}>{item.name}</h3>
          </div>
          {item.is_popular && (
            <div className="mt-0.5">
              <PopularBadge />
            </div>
          )}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className={`${itemCard.priceStyle} text-sm`}>
              {formatCurrency(item.price, currency)}
            </span>
            {item.is_available && (
              <QuantityControl
                quantity={quantity}
                onAdd={onAdd}
                onRemove={onRemove}
                accentColor={page.accentColor}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* Horizontal layout (default): image left, content right */
  return (
    <motion.div
      custom={index}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className={`${itemCard.bgStyle} ${itemCard.borderStyle} ${page.borderRadius} ${itemCard.shadow} ${itemCard.hoverEffect} ${unavailableClasses} flex gap-3 p-3`}
    >
      {showImg && (
        <div className={`${imgSize} shrink-0 overflow-hidden ${imgShape}`}>
          <img
            src={item.image_url as string}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <DietBadge type={item.diet_type} badgeStyle={dietBadge.style} />
          <h3 className={`${itemCard.nameStyle} truncate`}>{item.name}</h3>
        </div>
        {item.is_popular && (
          <div className="mt-0.5">
            <PopularBadge />
          </div>
        )}
        {item.description && (
          <p className={`${itemCard.descStyle} mt-1 line-clamp-2`}>{item.description}</p>
        )}
        {item.preparation_time && (
          <span className="text-xs opacity-60 mt-1">
            ⏱ {formatTime(item.preparation_time)}
          </span>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className={itemCard.priceStyle}>
            {formatCurrency(item.price, currency)}
          </span>
          {item.is_available && (
            <QuantityControl
              quantity={quantity}
              onAdd={onAdd}
              onRemove={onRemove}
              accentColor={page.accentColor}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Category Section
   ═══════════════════════════════════════════ */

interface CategorySectionProps {
  category: PublicMenuCategory;
  template: MenuTemplateConfig;
  currency: string;
  cart: CartItem[];
  onAddToCart: (item: PublicMenuItem) => void;
  onRemoveFromCart: (menuItemId: number) => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}

function CategorySection({
  category,
  template,
  currency,
  cart,
  onAddToCart,
  onRemoveFromCart,
  sectionRef,
}: CategorySectionProps) {
  const { itemCard, page } = template;
  const spacing = getSpacingClass(page.spacing);

  const isGridLayout =
    itemCard.layout === 'vertical' || itemCard.layout === 'grid-square';

  return (
    <section ref={sectionRef} className={getSectionGap(page.spacing)}>
      <div className="px-4 mb-3">
        <h2 className={`text-lg font-bold ${template.header.textColor}`}>
          {category.icon && <span className="mr-1.5">{category.icon}</span>}
          {category.name}
        </h2>
        {category.description && (
          <p className="text-sm opacity-60 mt-0.5">{category.description}</p>
        )}
      </div>

      {isGridLayout ? (
        <div className={`grid grid-cols-2 ${spacing} px-4`}>
          {category.items.map((item, idx) => (
            <MenuItemCard
              key={item.id}
              item={item}
              template={template}
              currency={currency}
              quantity={getCartItemQty(cart, item.id)}
              onAdd={() => onAddToCart(item)}
              onRemove={() => onRemoveFromCart(item.id)}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <div className={`flex flex-col ${spacing} px-4`}>
          {category.items.map((item, idx) => (
            <MenuItemCard
              key={item.id}
              item={item}
              template={template}
              currency={currency}
              quantity={getCartItemQty(cart, item.id)}
              onAdd={() => onAddToCart(item)}
              onRemove={() => onRemoveFromCart(item.id)}
              index={idx}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════
   Cart Floating Button
   ═══════════════════════════════════════════ */

interface CartButtonProps {
  template: MenuTemplateConfig;
  cartCount: number;
  cartTotal: number;
  currency: string;
  onOpenCart: () => void;
  bounceKey: number;
}

function CartFloatingButton({
  template,
  cartCount,
  cartTotal,
  currency,
  onOpenCart,
  bounceKey,
}: CartButtonProps) {
  const { cartButton, page } = template;

  if (cartCount === 0) return null;

  const shapeClass =
    cartButton.shape === 'pill'
      ? 'rounded-full'
      : cartButton.shape === 'square'
        ? 'rounded-lg'
        : 'rounded-2xl';

  const positionClass =
    cartButton.position === 'bottom-right'
      ? 'bottom-4 right-4'
      : cartButton.position === 'floating'
        ? 'bottom-6 left-1/2 -translate-x-1/2'
        : 'bottom-4 left-1/2 -translate-x-1/2';

  return (
    <motion.button
      key={bounceKey}
      onClick={onOpenCart}
      className={`fixed z-30 ${positionClass} ${cartButton.style} ${shapeClass} px-6 py-3 shadow-xl flex items-center gap-3 ${page.fontFamily}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={
        bounceKey > 0
          ? cartBounceAnimation
          : { scale: 1, opacity: 1 }
      }
      exit={{ scale: 0, opacity: 0 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-sm font-bold">
        {cartCount} {cartCount === 1 ? 'item' : 'items'}
      </span>
      <span className="w-px h-4 bg-current opacity-30" />
      <span className="text-sm font-bold">
        {formatCurrency(cartTotal, currency)}
      </span>
      <span className="ml-1">→</span>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   Main Renderer
   ═══════════════════════════════════════════ */

interface QRMenuTemplateRendererProps {
  menu: PublicMenu;
  template: MenuTemplateConfig;
  cart: CartItem[];
  onAddToCart: (item: PublicMenuItem) => void;
  onRemoveFromCart: (menuItemId: number) => void;
  onOpenCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export function QRMenuTemplateRenderer({
  menu,
  template,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  cartCount,
  cartTotal,
}: QRMenuTemplateRendererProps) {
  const { page, categoryNav } = template;
  const activeCategories = useMemo(
    () => menu.categories.filter((cat) => cat.items.length > 0),
    [menu.categories]
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number>(
    activeCategories[0]?.id ?? 0
  );

  const [bounceKey, setBounceKey] = useState(0);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  /* Bounce cart button when items change */
  const prevCartCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setBounceKey((k) => k + 1);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  /* Scroll to category section on nav click */
  const handleCategorySelect = useCallback((categoryId: number) => {
    setActiveCategoryId(categoryId);
    const section = sectionRefs.current[categoryId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* Intersection observer to update active category on scroll */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const entries = Object.entries(sectionRefs.current);

    entries.forEach(([idStr, el]) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (observed) => {
          observed.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveCategoryId(Number(idStr));
            }
          });
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [activeCategories]);

  const setSectionRef = useCallback(
    (id: number) => (el: HTMLDivElement | null) => {
      sectionRefs.current[id] = el;
    },
    []
  );

  const isSidebar = categoryNav.style === 'sidebar';

  return (
    <div className={`min-h-screen ${page.bgStyle} ${page.fontFamily}`}>
      {/* Header */}
      <MenuHeader menu={menu} template={template} />

      {/* Body: sidebar layout uses flex row */}
      {isSidebar ? (
        <div className="flex">
          <div className="w-28 shrink-0 border-r border-black/5">
            <CategoryNav
              categories={activeCategories}
              activeCategoryId={activeCategoryId}
              onSelect={handleCategorySelect}
              template={template}
            />
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            {activeCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                template={template}
                currency={menu.currency}
                cart={cart}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                sectionRef={setSectionRef(cat.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Horizontal category nav */}
          <CategoryNav
            categories={activeCategories}
            activeCategoryId={activeCategoryId}
            onSelect={handleCategorySelect}
            template={template}
          />

          {/* Category sections */}
          <div className="py-4">
            {activeCategories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                template={template}
                currency={menu.currency}
                cart={cart}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                sectionRef={setSectionRef(cat.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Cart floating button */}
      <AnimatePresence mode="wait">
        <CartFloatingButton
          template={template}
          cartCount={cartCount}
          cartTotal={cartTotal}
          currency={menu.currency}
          onOpenCart={onOpenCart}
          bounceKey={bounceKey}
        />
      </AnimatePresence>
    </div>
  );
}
