
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
  
  console.log('RoleProtectedRoute check:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!userProfile, 
    userRole: userProfile?.role,
    allowedRoles 
  });
  
  if (loading) {
    console.log('Still loading auth state...');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !userProfile) {
    console.log('No user or profile, redirecting to auth...');
    return <Navigate to={redirectPath} replace />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    console.log('User role not allowed, redirecting based on role...');
    // Redirect based on user role to appropriate page
    if (userProfile.role === 'employee') {
      return <Navigate to="/employee-advocacy" replace />;
    } else if (userProfile.role === 'admin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/auth" replace />;
  }
  
  console.log('Access granted, rendering children...');
  return <>{children}</>;
};

export default RoleProtectedRoute;
