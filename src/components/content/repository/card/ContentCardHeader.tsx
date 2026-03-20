import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { ScoreBadge } from '../ScoreBadge';
import { ContentCardActions } from './ContentCardActions';
import { OptimizationBadge } from './OptimizationBadge';
import { ValueScoreBadge } from './ValueScoreBadge';
import { FunnelStageBadge } from './FunnelStageBadge';

interface ContentCardHeaderProps {
  status: string;
  seoScore: number;
  contentId?: string;
  pendingOptimizationsCount?: number;
  contentValueScore?: number;
  funnelStage?: string | null;
  onEdit: () => void;
  onPreview: () => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const ContentCardHeader: React.FC<ContentCardHeaderProps> = ({
  status,
  seoScore,
  contentId,
  pendingOptimizationsCount = 0,
  contentValueScore = 0,
  funnelStage,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  return (
    <div className="flex justify-between items-start mb-2">
      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge status={status} />
        <ScoreBadge score={seoScore} />
        {pendingOptimizationsCount > 0 && (
          <OptimizationBadge count={pendingOptimizationsCount} />
        )}
        <ValueScoreBadge score={contentValueScore} />
        <FunnelStageBadge stage={funnelStage} />
      </div>
      <ContentCardActions
        status={status}
        onEdit={onEdit}
        onPreview={onPreview}
        onAnalyze={onAnalyze}
        onPublish={onPublish}
        onArchive={onArchive}
        onDelete={onDelete}
      />
    </div>
  );
};