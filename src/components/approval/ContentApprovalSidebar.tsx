
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalType } from '@/contexts/content/types';
import { useApproval } from './context/ApprovalContext';
import { ApprovalMetadata } from './ApprovalMetadata';
import { ApprovalTimeline } from './ApprovalTimeline';

import { AIReviewAssistant } from './ai/AIReviewAssistant';
import { SmartApprovalActions } from './ai/SmartApprovalActions';

interface ContentApprovalSidebarProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
  statusFilter: string;
}

export const ContentApprovalSidebar: React.FC<ContentApprovalSidebarProps> = ({
  contentItems,
  selectedContent,
  onSelectContent,
  statusFilter
}) => {
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const { fetchSerpData } = useApproval();

  useEffect(() => {
    // Fetch SERP data when the component mounts
    if (selectedContent?.metadata?.mainKeyword) {
      fetchSerpData(selectedContent.metadata.mainKeyword);
    }
  }, [selectedContent?.id, selectedContent?.metadata?.mainKeyword, fetchSerpData]);

  const handleApprove = () => {
    console.log('Approve content:', selectedContent?.id);
  };

  const handleReject = () => {
    console.log('Reject content:', selectedContent?.id);
  };

  const handleRequestChanges = () => {
    console.log('Request changes:', selectedContent?.id);
  };

  if (!selectedContent) {
    return (
      <div className="w-80 border-l bg-background p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Content Items</h3>
          <div className="space-y-2">
            {contentItems.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onSelectContent(item)}
              >
                <h4 className="font-medium truncate">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.approval_status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Back to list button */}
        <button
          onClick={() => onSelectContent(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to content list
        </button>

        {/* AI Review Assistant */}
        <AIReviewAssistant 
          content={selectedContent}
          onRecommendationGenerated={setAiRecommendation}
        />

        {/* Smart Approval Actions */}
        <SmartApprovalActions
          recommendation={aiRecommendation}
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
          onReject={handleReject}
          disabled={false}
        />

        {/* Content Metadata */}
        <ApprovalMetadata 
          content={selectedContent}
        />

        {/* Approval Timeline */}
        <ApprovalTimeline 
          contentId={selectedContent.id}
        />
      </div>
    </div>
  );
};
