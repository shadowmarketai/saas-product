import { motion } from 'framer-motion';
import type { VCardPublicData } from '@/types/vcard';

interface Props {
  card: VCardPublicData;
  onAction?: (action: string) => void;
  variant?: 'light' | 'dark' | 'glass';
}

const baseBtn = 'flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95';

export function VCardActions({ card, onAction, variant = 'light' }: Props) {
  const styles = {
    light: {
      call: 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/25',
      email: 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25',
      whatsapp: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25',
      save: 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25',
    },
    dark: {
      call: 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30',
      email: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30',
      whatsapp: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30',
      save: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30',
    },
    glass: {
      call: 'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20',
      email: 'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20',
      whatsapp: 'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20',
      save: 'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20',
    },
  };

  const s = styles[variant];

  return (
    <div className="grid grid-cols-2 gap-3">
      {card.phone && (
        <motion.a
          href={`tel:${card.phone}`}
          whileTap={{ scale: 0.95 }}
          className={`${baseBtn} ${s.call}`}
          onClick={() => onAction?.('call')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call
        </motion.a>
      )}
      {card.email && (
        <motion.a
          href={`mailto:${card.email}`}
          whileTap={{ scale: 0.95 }}
          className={`${baseBtn} ${s.email}`}
          onClick={() => onAction?.('email')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </motion.a>
      )}
      {card.whatsapp && (
        <motion.a
          href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener"
          whileTap={{ scale: 0.95 }}
          className={`${baseBtn} ${s.whatsapp}`}
          onClick={() => onAction?.('whatsapp')}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.553 4.115 1.519 5.847L.053 23.52l5.832-1.529A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 01-5.01-1.374l-.36-.213-3.726.977.994-3.63-.234-.372A9.82 9.82 0 012.18 12 9.82 9.82 0 0112 2.18 9.82 9.82 0 0121.82 12 9.82 9.82 0 0112 21.82z" />
          </svg>
          WhatsApp
        </motion.a>
      )}
      <motion.a
        href={`/api/v1/vcards/public/${card.slug}/vcf`}
        download
        whileTap={{ scale: 0.95 }}
        className={`${baseBtn} ${s.save}`}
        onClick={() => onAction?.('save_contact')}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Save
      </motion.a>
    </div>
  );
}

export function SocialIcons({ card, onAction, variant = 'light' }: Props) {
  const links = [
    { key: 'website', url: card.website, icon: '🌐' },
    { key: 'linkedin', url: card.linkedin, icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    ) },
    { key: 'instagram', url: card.instagram, icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
    ) },
    { key: 'github', url: card.github, icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
    ) },
    { key: 'twitter', url: card.twitter, icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    ) },
    { key: 'youtube', url: card.youtube, icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ) },
  ];

  const filtered = links.filter((l) => l.url);
  if (filtered.length === 0) return null;

  const colorClass = variant === 'dark'
    ? 'text-gray-400 hover:text-white'
    : variant === 'glass'
    ? 'text-white/60 hover:text-white'
    : 'text-gray-500 hover:text-gray-900';

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {filtered.map((link) => (
        <motion.a
          key={link.key}
          href={link.url!}
          target="_blank"
          rel="noopener"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={`transition-colors ${colorClass}`}
          onClick={() => onAction?.(link.key)}
        >
          {typeof link.icon === 'string' ? <span className="text-xl">{link.icon}</span> : link.icon}
        </motion.a>
      ))}
    </div>
  );
}
