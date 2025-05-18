
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ContentSelectionHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
}

const ContentSelectionHeader: React.FC<ContentSelectionHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  totalItems,
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search content..."
          className="pl-9 bg-black/30 border-white/10"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {totalItems} {totalItems === 1 ? 'item' : 'items'} found
      </p>
    </div>
  );
};

export default ContentSelectionHeader;
