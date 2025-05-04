
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Loader2 } from 'lucide-react';
import { EnhancedContentCard, ContentCardSkeleton } from './EnhancedContentCard';
import { ContentPagination } from './Pagination';

interface ContentGridProps {
  loading: boolean;
  filteredItems: ContentItemType[];
  searchQuery: string;
  filterStatus: string;
  selectedContentId: string | null;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
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
  currentPage,
  itemsPerPage,
  onPageChange,
  onSelect,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-lg border border-dashed border-muted">
        <div className="bg-muted/20 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {paginatedItems.map(item => (
          <EnhancedContentCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedContentId}
            onSelect={() => onSelect(item.id)}
            onEdit={() => onEdit(item.id)}
            onPreview={() => onPreview(item.id)}
            onAnalyze={() => onAnalyze(item.id)}
            onPublish={() => onPublish(item.id)}
            onArchive={() => onArchive(item.id)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <ContentPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
