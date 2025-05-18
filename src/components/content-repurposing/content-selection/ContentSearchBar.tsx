
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface ContentSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
}

const ContentSearchBar: React.FC<ContentSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery,
  totalItems
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{totalItems} items available</p>
      <div className="flex gap-2">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search content..." 
            className="pl-9 bg-black/30 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="border-white/10">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContentSearchBar;
