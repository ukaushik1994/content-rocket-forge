
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ 
  children, 
  redirectPath = '/dashboard' 
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

export default GuestRoute;
