import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`relative flex items-center ${compact ? 'w-12 h-6' : 'w-14 h-7'} rounded-full transition-colors duration-300 ${
        isDark ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} rounded-full bg-white shadow-md flex items-center justify-center ${
          isDark ? (compact ? 'ml-[26px]' : 'ml-[30px]') : 'ml-[2px]'
        }`}
      >
        <span className={compact ? 'text-[10px]' : 'text-xs'}>{isDark ? '🌙' : '☀️'}</span>
      </motion.div>
    </button>
  );
}
