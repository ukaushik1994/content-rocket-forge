
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { ViewToggle } from './ViewToggle';
import { ContentGrid } from './ContentGrid';

interface ContentDisplayProps {
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

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
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
  const [view, setView] = React.useState('grid');

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <ViewToggle view={view} setView={setView} />
        
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
        </div>
      </div>
      
      <div className="w-full">
        <ContentGrid 
          loading={loading}
          filteredItems={filteredItems}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          selectedContentId={selectedContentId}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onSelect={onSelect}
          onEdit={onEdit}
          onPreview={onPreview}
          onAnalyze={onAnalyze}
          onPublish={onPublish}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      </div>
    </>
  );
};
