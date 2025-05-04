
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Loader2 } from 'lucide-react';
import { EnhancedContentCard, ContentCardSkeleton } from './EnhancedContentCard';
import { ContentPagination } from './Pagination';

// Types
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

// Loading state component
const ContentGridLoading = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <ContentCardSkeleton key={i} />
    ))}
  </div>
);

// Empty state component
interface ContentGridEmptyProps {
  searchQuery: string;
  filterStatus: string;
}

const ContentGridEmpty: React.FC<ContentGridEmptyProps> = ({ searchQuery, filterStatus }) => (
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

// Content items grid component
interface ContentItemsGridProps {
  items: ContentItemType[];
  selectedContentId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onAnalyze: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const ContentItemsGrid: React.FC<ContentItemsGridProps> = ({
  items,
  selectedContentId,
  onSelect,
  onEdit,
  onPreview,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {items.map(item => (
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
);

// Main ContentGrid component using the above components
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
  
  // Conditional rendering based on state
  if (loading) {
    return (
      <div className="space-y-4">
        <ContentGridLoading />
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <ContentGridEmpty 
        searchQuery={searchQuery} 
        filterStatus={filterStatus} 
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <ContentItemsGrid
        items={paginatedItems}
        selectedContentId={selectedContentId}
        onSelect={onSelect}
        onEdit={onEdit}
        onPreview={onPreview}
        onAnalyze={onAnalyze}
        onPublish={onPublish}
        onArchive={onArchive}
        onDelete={onDelete}
      />
      
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
