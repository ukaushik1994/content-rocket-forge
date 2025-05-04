
import React from 'react';
import { ContentReviewCard } from '../ContentReviewCard';
import { FinalChecklistCard } from '../FinalChecklistCard';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

interface ContentTabContentProps {
  content: string;
  checklistItems: {
    title: string;
    passed: boolean;
  }[];
  onRunAllChecks: () => void;
}

export const ContentTabContent = ({
  content,
  checklistItems,
  onRunAllChecks
}: ContentTabContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content area */}
      <div className="lg:col-span-2">
        <ContentReviewCard content={content} />
      </div>
      
      {/* Side panel */}
      <div className="space-y-6">
        <FinalChecklistCard checks={checklistItems} />
        <Button 
          onClick={onRunAllChecks} 
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Run All Checks
        </Button>
      </div>
    </div>
  );
};
