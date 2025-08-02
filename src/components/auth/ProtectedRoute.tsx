
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // For now, just render children - auth logic can be added later
  return <>{children}</>;
};

export default ProtectedRoute;
