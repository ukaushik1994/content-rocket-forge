
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Card } from '@/components/ui/card';
import {
  ContentCardHeader,
  ContentCardPreview,
  ContentCardKeywords,
  ContentCardStats,
  ContentCardFooter,
  ContentCardSkeleton
} from './card';

interface EnhancedContentCardProps {
  item: ContentItemType;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const EnhancedContentCard: React.FC<EnhancedContentCardProps> = ({
  item,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof Element && 
      (e.target.closest('button') || e.target.closest('[role="menu"]'))
    ) {
      return;
    }
    onSelect();
  };
  
  return (
    <Card
      className={`p-4 cursor-pointer glass-card glass-card-hover transition-all duration-200 group ${
        isSelected ? 'border-primary bg-primary/5' : ''
      } animate-fade-in`}
      onClick={handleCardClick}
    >
      <ContentCardHeader
        status={item.status}
        seoScore={item.seo_score || 0}
        contentValueScore={(item as any).content_value_score || 0}
        funnelStage={(item as any).funnel_stage}
        onEdit={onEdit}
        onPreview={onPreview}
        onAnalyze={onAnalyze}
        onPublish={onPublish}
        onArchive={onArchive}
        onDelete={onDelete}
      />
      
      <ContentCardPreview 
        title={item.title}
        content={item.content}
      />
      
      <ContentCardKeywords keywords={item.keywords} />
      
      <ContentCardStats content={item.content} />
      
      <ContentCardFooter
        updatedAt={item.updated_at}
        onEdit={onEdit}
        onAnalyze={onAnalyze}
      />
    </Card>
  );
};

export { ContentCardSkeleton };
