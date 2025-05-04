
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { ContentCard } from './ContentCard';
import { Loader2, Calendar } from 'lucide-react';

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
  onArchive
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium">No Content Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          {searchQuery || filterStatus !== 'all'
            ? "No content matches your current filters. Try adjusting your search criteria."
            : "You haven't created any content yet. Start by creating your first piece of content."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredItems.map((item) => (
        <ContentCard 
          key={item.id}
          item={item}
          isSelected={item.id === selectedContentId}
          onClick={() => onSelect(item.id)}
          onEdit={() => onEdit(item.id)}
          onAnalyze={() => onAnalyze(item.id)}
          onPublish={() => onPublish(item.id)}
          onArchive={() => onArchive(item.id)}
        />
      ))}
    </div>
  );
};
