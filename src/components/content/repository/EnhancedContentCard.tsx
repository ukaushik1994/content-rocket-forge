
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
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 group ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
      } animate-fade-in`}
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
