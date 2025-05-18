
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ContentSelectionHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalItems: number;
}

const ContentSelectionHeader: React.FC<ContentSelectionHeaderProps> = ({ 
  searchQuery, 
  setSearchQuery,
  totalItems
}) => {
  return (
    <div className="space-y-4">
      <div>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
          Available Content
        </CardTitle>
        <CardDescription>Select content to transform into different formats</CardDescription>
      </div>
      
      <div className="flex items-center justify-between">
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
    </div>
  );
};

export default ContentSelectionHeader;
