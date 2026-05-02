import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { cn } from '@/lib/utils';

interface NavItem { label: string; path: string; icon: string }

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', path: '/super-admin', icon: '📊' },
  { label: 'Franchises', path: '/super-admin/franchises', icon: '🏢' },
  { label: 'Customers', path: '/super-admin/customers', icon: '👥' },
  { label: 'Products', path: '/super-admin/products', icon: '📦' },
  { label: 'Templates', path: '/super-admin/templates', icon: '🎨' },
  { label: 'Revenue', path: '/super-admin/revenue', icon: '💰' },
  { label: 'Payouts', path: '/super-admin/payouts', icon: '🏦' },
  { label: 'VCards', path: '/super-admin/vcards', icon: '📇' },
  { label: 'Websites', path: '/super-admin/websites', icon: '🌐' },
  { label: 'QR Menu', path: '/super-admin/qrmenu', icon: '📱' },
  { label: 'Link-in-Bio', path: '/super-admin/linkbio', icon: '🔗' },
  { label: 'Reviews QR', path: '/super-admin/reviews', icon: '⭐' },
  { label: 'Social Poster', path: '/super-admin/posters', icon: '🎨' },
  { label: 'WhatsApp Bot', path: '/super-admin/chatbot', icon: '💬' },
  { label: 'Settings', path: '/super-admin/settings', icon: '⚙️' },
];

const franchiseNav: NavItem[] = [
  { label: 'Dashboard', path: '/franchise', icon: '📊' },
  { label: 'Product Showcase', path: '/franchise/showcase', icon: '🚀' },
  { label: 'My Customers', path: '/franchise/customers', icon: '👥' },
  { label: 'Create Product', path: '/franchise/create', icon: '➕' },
  { label: 'Earnings', path: '/franchise/earnings', icon: '💰' },
  { label: 'Referrals', path: '/franchise/referrals', icon: '🔗' },
  { label: 'Marketing', path: '/franchise/marketing', icon: '📣' },
  { label: 'VCards', path: '/franchise/vcards', icon: '📇' },
  { label: 'Websites', path: '/franchise/websites', icon: '🌐' },
  { label: 'QR Menu', path: '/franchise/qrmenu', icon: '📱' },
  { label: 'Link-in-Bio', path: '/franchise/linkbio', icon: '🔗' },
  { label: 'Reviews QR', path: '/franchise/reviews', icon: '⭐' },
  { label: 'Social Poster', path: '/franchise/posters', icon: '🎨' },
  { label: 'Support', path: '/franchise/support', icon: '🎧' },
];

const customerNav: NavItem[] = [
  { label: 'My Products', path: '/dashboard', icon: '📦' },
  { label: 'Analytics', path: '/dashboard/analytics', icon: '📈' },
  { label: 'QR Codes', path: '/dashboard/qr-codes', icon: '📱' },
  { label: 'Billing', path: '/dashboard/billing', icon: '💳' },
  { label: 'VCards', path: '/dashboard/vcards', icon: '📇' },
  { label: 'Websites', path: '/dashboard/websites', icon: '🌐' },
  { label: 'QR Menu', path: '/dashboard/qrmenu', icon: '📱' },
  { label: 'Link-in-Bio', path: '/dashboard/linkbio', icon: '🔗' },
  { label: 'Reviews QR', path: '/dashboard/reviews', icon: '⭐' },
  { label: 'Social Poster', path: '/dashboard/posters', icon: '🎨' },
  { label: 'Support', path: '/dashboard/support', icon: '🎧' },
];

export function Sidebar() {
  const { user, isSuperAdmin, isFranchiseOwner, logout } = useAuth();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = isSuperAdmin ? superAdminNav : isFranchiseOwner ? franchiseNav : customerNav;
  const w = collapsed ? 72 : 260;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0, width: w }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col z-40 border-r transition-colors duration-300',
        isDark ? 'bg-gray-900/95 border-gray-800 backdrop-blur-xl' : 'bg-white/95 border-gray-200/80 backdrop-blur-xl'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center justify-between p-4 border-b', isDark ? 'border-gray-800' : 'border-gray-100')}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/25">N</div>
              <h1 className="text-base font-bold font-heading bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">NexaStack</h1>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold mx-auto">N</div>}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-xs', isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400')}>◀</button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className={cn('absolute -right-3 top-5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] shadow-sm', isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500')}>▶</button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/super-admin' || item.path === '/franchise' || item.path === '/dashboard'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              collapsed && 'justify-center px-0',
              isActive
                ? isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-700'
                : isDark ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span className={cn('text-lg', collapsed && 'mx-auto')}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn('p-3 border-t space-y-3', isDark ? 'border-gray-800' : 'border-gray-100')}>
        <NotificationBell collapsed={collapsed} />
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-2')}>
          {!collapsed && <span className="text-xs font-medium text-muted">{isDark ? 'Dark' : 'Light'}</span>}
          <ThemeToggle compact={collapsed} />
        </div>
        <div className={cn('flex items-center gap-2.5', collapsed ? 'justify-center' : 'px-2')}>
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0', isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700')}>
            {user?.full_name?.[0] || user?.email[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-heading truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-muted truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <button data-testid="logout-btn" onClick={logout} className={cn('w-full py-2 text-xs font-medium rounded-xl transition-colors', collapsed ? 'text-center' : 'text-left px-3', isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50')}>
          {collapsed ? '🚪' : 'Sign Out'}
        </button>
      </div>
    </motion.aside>
  );
}
