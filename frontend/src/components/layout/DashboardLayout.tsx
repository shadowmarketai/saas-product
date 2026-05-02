import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardBackground } from '@/components/three/DashboardBackground';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export function DashboardLayout() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('verify_banner_dismissed') === '1'
  );

  const dismissBanner = () => {
    sessionStorage.setItem('verify_banner_dismissed', '1');
    setDismissed(true);
  };

  const resendVerification = async () => {
    try {
      await api.post('/auth/resend-verification');
    } catch {
      // ignore errors
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Three.js animated background - z-0 */}
      <DashboardBackground />

      {/* Sidebar - z-40 */}
      <Sidebar />

      {/* Main content - z-10, above the Three.js canvas */}
      <main className="ml-[260px] p-8 relative z-10">
        {user && !user.is_verified && !dismissed && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Your email is not verified. Check your email or{' '}
                <button onClick={resendVerification} className="underline font-semibold hover:text-amber-900">
                  resend verification
                </button>.
              </p>
            </div>
            <button onClick={dismissBanner} className="text-amber-400 hover:text-amber-600 text-lg">✕</button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
