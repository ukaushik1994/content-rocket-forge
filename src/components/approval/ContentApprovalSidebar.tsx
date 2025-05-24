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
  const [metadata, setMetadata] = useState<any>(null);
  const [timeline, setTimeline] = useState<ApprovalType[]>([]);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    // Fetch SERP data when the component mounts
    if (content.metadata?.mainKeyword) {
      fetchSerpData(content.metadata.mainKeyword);
    }
  }, [content.id, content.metadata?.mainKeyword, fetchSerpData]);

  useEffect(() => {
    // Simulate loading metadata
    setMetadataLoading(true);
    setTimeout(() => {
      setMetadata({
        author: content.metadata?.author || 'Not specified',
        category: content.metadata?.category || 'General',
        tags: content.metadata?.tags || [],
        wordCount: content.metadata?.wordCount || 0,
        readingTime: content.metadata?.readingTime || 0,
      });
      setMetadataLoading(false);
    }, 500);

    // Simulate loading approval timeline
    setTimelineLoading(true);
    setTimeout(() => {
      setTimeline([
        {
          id: '1',
          content_id: content.id,
          reviewer_id: 'user123',
          status: 'pending_review',
          comments: 'Initial submission',
          reviewed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      setTimelineLoading(false);
    }, 750);
  }, [content.id, content.metadata]);

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
          metadata={metadata}
          isLoading={metadataLoading}
        />

        {/* Approval Timeline */}
        <ApprovalTimeline 
          timeline={timeline}
          isLoading={timelineLoading}
        />
      </div>
    </div>
  );
};
