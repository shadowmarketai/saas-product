import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read?: boolean;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface NotificationBellProps {
  collapsed?: boolean;
}

export function NotificationBell({ collapsed = false }: NotificationBellProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ notifications: Notification[]; unread_count: number } | Notification[]>('/notifications/');
      // Backend returns { notifications: [], unread_count: 0 } or plain []
      const data = Array.isArray(res.data) ? res.data : (res.data as { notifications: Notification[] }).notifications ?? [];
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Endpoint may not exist — silently ignore
    }
  };

  if (collapsed) {
    return (
      <div ref={containerRef} className="relative flex justify-center">
        <button
          data-testid="notification-bell"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          )}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>
        <DropdownPanel
          open={open}
          isDark={isDark}
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onMarkAllRead={handleMarkAllRead}
          className="left-8 bottom-0"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative px-2">
      <button
        data-testid="notification-bell"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between px-2 py-2 rounded-xl text-sm font-medium transition-colors',
          isDark ? 'hover:bg-gray-800/60 text-gray-400' : 'hover:bg-gray-50 text-gray-500'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span className="text-xs">Notifications</span>
        </div>
        {unreadCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <DropdownPanel
        open={open}
        isDark={isDark}
        notifications={notifications}
        loading={loading}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        className="left-0 right-0 bottom-full mb-1"
      />
    </div>
  );
}

interface DropdownPanelProps {
  open: boolean;
  isDark: boolean;
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  onMarkAllRead: () => void;
  className?: string;
}

function DropdownPanel({ open, isDark, notifications, loading, unreadCount, onMarkAllRead, className }: DropdownPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute z-50 w-72 rounded-xl shadow-xl border overflow-hidden',
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
            className
          )}
        >
          {/* Header */}
          <div className={cn('flex items-center justify-between px-4 py-3 border-b', isDark ? 'border-gray-800' : 'border-gray-100')}>
            <span className="text-xs font-semibold text-heading">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <p className="text-xs text-muted text-center py-8">No notifications</p>
            )}
            {!loading && notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'px-4 py-3 border-b last:border-b-0 transition-colors',
                  isDark ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50',
                  !n.read && (isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/50')
                )}
              >
                {n.title && (
                  <p className="text-xs font-semibold text-heading mb-0.5">{n.title}</p>
                )}
                <p className="text-xs text-muted leading-snug line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted mt-1 opacity-60">{timeAgo(n.created_at)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
