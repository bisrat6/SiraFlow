import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employer' | 'employee' | 'super_admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole) {
    const user = getCurrentUser();
    if (user?.role !== requiredRole) {
      // Redirect to the user's appropriate dashboard instead of "/"
      const correctRoute = user?.role === 'super_admin' ? '/super-admin' :
                          user?.role === 'employer' ? '/employer' : '/employee';
      return <Navigate to={correctRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
