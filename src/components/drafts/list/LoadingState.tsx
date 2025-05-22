
import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  );
};
