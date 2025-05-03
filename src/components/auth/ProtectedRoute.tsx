
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectPath = '/auth' 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // Show loading spinner or skeleton while checking auth status
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
