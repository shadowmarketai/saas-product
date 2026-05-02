import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    if (user.role === 'super_admin') return <Navigate to="/super-admin" />;
    if (user.role === 'franchise_owner') return <Navigate to="/franchise" />;
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
