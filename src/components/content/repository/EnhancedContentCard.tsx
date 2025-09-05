
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
    // Don't select the card if clicking on a button or dropdown
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
      className={`p-6 cursor-pointer transition-all duration-500 group premium-card ${
        isSelected ? 'border-primary/50 bg-primary/10 shadow-premium-glow' : 'hover:border-primary/30'
      } animate-fade-in hover:scale-[1.02] hover:-translate-y-1`}
      onClick={handleCardClick}
    >
      <ContentCardHeader
        status={item.status}
        seoScore={item.seo_score || 0}
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

// Export the skeleton component for use elsewhere
export { ContentCardSkeleton };
