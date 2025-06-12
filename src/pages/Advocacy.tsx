
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Advocacy = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
      </div>
    );
  }

  // Redirect based on user role
  if (userProfile?.role === 'employee') {
    return <Navigate to="/employee-advocacy" replace />;
  } else if (userProfile?.role === 'admin') {
    // Admin users should see the AdminAdvocacy component, not redirect
    return <Navigate to="/admin-advocacy" replace />;
  }

  // If no role is determined, redirect to auth
  return <Navigate to="/auth" replace />;
};

export default Advocacy;
