
import React from 'react';
import { FileText } from 'lucide-react';

export const EmptyContent: React.FC = () => (
  <div className="border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-white/50 bg-gray-800/20 backdrop-blur-sm shadow-xl">
    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
      <FileText className="h-8 w-8 text-white/30" />
    </div>
    <h3 className="text-xl font-medium mb-2">Select content to review</h3>
    <p>Choose an item from the sidebar to begin the approval process</p>
  </div>
);
