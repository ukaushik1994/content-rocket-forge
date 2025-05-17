
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ContentItemType } from '@/contexts/content/types';
import { ActionButtons } from './ActionButtons';

interface ContentHeaderProps {
  content: ContentItemType;
  editedContent: string;
  editedTitle: string;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContentHeader: React.FC<ContentHeaderProps> = ({
  content,
  editedContent,
  editedTitle,
  isSubmitting,
  setIsSubmitting
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div>
        <h2 className="text-xl font-semibold text-white/90">{editedTitle}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge 
            variant="outline" 
            className="border-white/20 bg-white/5 text-white/70"
          >
            {content.status}
          </Badge>
          {content.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.keywords.map((keyword, i) => (
                <Badge key={i} variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ActionButtons 
        content={content}
        editedContent={editedContent}
        editedTitle={editedTitle}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </div>
  );
};
