
import React from 'react';
import { CheckCircle } from 'lucide-react';

export const SaveStepOptimizationsAlert: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
      <CheckCircle className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Content has been optimized</p>
        <p className="text-sm">SEO improvements from the optimization step have been applied.</p>
      </div>
    </div>
  );
};
