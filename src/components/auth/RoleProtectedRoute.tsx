
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'employee')[];
  redirectPath?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectPath = '/auth' 
}) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    return <Navigate to={redirectPath} replace />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    // Redirect based on user role
    if (userProfile.role === 'employee') {
      return <Navigate to="/advocacy" replace />;
    } else if (userProfile.role === 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

export default RoleProtectedRoute;
