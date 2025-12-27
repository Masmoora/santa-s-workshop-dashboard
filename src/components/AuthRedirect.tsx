import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (user && profile) {
    if (profile.role === 'child') {
      return <Navigate to="/child/dashboard" replace />;
    } else if (profile.role === 'elf') {
      return <Navigate to="/elf/dashboard" replace />;
    } else if (profile.role === 'sanda') {
      return <Navigate to="/sanda/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthRedirect;
