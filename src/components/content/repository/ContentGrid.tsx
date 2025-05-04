
import React from 'react';
import { ContentCard } from './ContentCard';
import { ContentItemType } from '@/contexts/content';
import { Loader2 } from 'lucide-react';

interface ContentGridProps {
  loading: boolean;
  filteredItems: ContentItemType[];
  searchQuery: string;
  filterStatus: string;
  selectedContentId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAnalyze: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ContentGrid: React.FC<ContentGridProps> = ({
  loading,
  filteredItems,
  searchQuery,
  filterStatus,
  selectedContentId,
  onSelect,
  onEdit,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        <p className="mt-2 text-muted-foreground">Loading content...</p>
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No content items found</p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground/70">
            Try adjusting your search terms
          </p>
        )}
        {filterStatus !== 'all' && (
          <p className="text-sm text-muted-foreground/70">
            Try changing the status filter
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
      {filteredItems.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedContentId}
          onSelect={() => onSelect(item.id)}
          onEdit={() => onEdit(item.id)}
          onAnalyze={() => onAnalyze(item.id)}
          onPublish={() => onPublish(item.id)}
          onArchive={() => onArchive(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
};
