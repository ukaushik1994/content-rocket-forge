
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalType } from '@/contexts/content/types';
import { useApproval } from './context/ApprovalContext';
import { ApprovalMetadata } from './ApprovalMetadata';
import { ApprovalTimeline } from './ApprovalTimeline';

import { AIReviewAssistant } from './ai/AIReviewAssistant';
import { SmartApprovalActions } from './ai/SmartApprovalActions';

interface ContentApprovalSidebarProps {
  content: ContentItemType;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  isLoading: boolean;
}

export const ContentApprovalSidebar: React.FC<ContentApprovalSidebarProps> = ({
  content,
  onApprove,
  onReject,
  onRequestChanges,
  isLoading
}) => {
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const { fetchSerpData } = useApproval();

  useEffect(() => {
    // Fetch SERP data when the component mounts
    if (content.metadata?.mainKeyword) {
      fetchSerpData(content.metadata.mainKeyword);
    }
  }, [content.id, content.metadata?.mainKeyword, fetchSerpData]);

  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* AI Review Assistant */}
        <AIReviewAssistant 
          content={content}
          onRecommendationGenerated={setAiRecommendation}
        />

        {/* Smart Approval Actions */}
        <SmartApprovalActions
          recommendation={aiRecommendation}
          onApprove={onApprove}
          onRequestChanges={onRequestChanges}
          onReject={onReject}
          disabled={isLoading}
        />

        {/* Content Metadata */}
        <ApprovalMetadata 
          content={content}
        />

        {/* Approval Timeline */}
        <ApprovalTimeline 
          contentId={content.id}
        />
      </div>
    </div>
  );
};
