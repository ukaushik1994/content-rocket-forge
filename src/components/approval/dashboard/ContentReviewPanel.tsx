
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalEditor } from '../ContentApprovalEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

interface ContentReviewPanelProps {
  content: ContentItemType | null;
}

export const ContentReviewPanel: React.FC<ContentReviewPanelProps> = ({ content }) => {
  if (!content) {
    return (
      <Card className="h-full border border-white/10 bg-gray-800/20 backdrop-blur-sm shadow-xl">
        <CardContent className="h-full flex flex-col items-center justify-center text-white/50">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-white/30" />
          </div>
          <h3 className="text-xl font-medium mb-2">Select content to review</h3>
          <p>Choose an item from the sidebar to begin the approval process</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <ContentApprovalEditor content={content} />
    </div>
  );
};
