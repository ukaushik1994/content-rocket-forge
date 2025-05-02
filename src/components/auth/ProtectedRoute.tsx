
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Simply render children without any authentication check
  return <>{children}</>;
};

export default ProtectedRoute;
