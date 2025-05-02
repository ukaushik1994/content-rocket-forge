
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Tag, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for keyword list
const mockKeywords = [
  { id: '1', keyword: 'content marketing tools', volume: 5400, difficulty: 42, isUsed: true, contentCount: 2 },
  { id: '2', keyword: 'SEO software', volume: 8200, difficulty: 67, isUsed: true, contentCount: 1 },
  { id: '3', keyword: 'digital marketing strategy', volume: 9100, difficulty: 55, isUsed: false, contentCount: 0 },
  { id: '4', keyword: 'blog writing tips', volume: 3200, difficulty: 28, isUsed: true, contentCount: 3 },
  { id: '5', keyword: 'keyword research tool', volume: 6500, difficulty: 72, isUsed: false, contentCount: 0 },
  { id: '6', keyword: 'content optimization', volume: 4800, difficulty: 39, isUsed: true, contentCount: 1 },
  { id: '7', keyword: 'email marketing platform', volume: 7200, difficulty: 62, isUsed: false, contentCount: 0 },
  { id: '8', keyword: 'social media marketing', volume: 12500, difficulty: 85, isUsed: true, contentCount: 2 }
];

export function KeywordsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('all');
  const [sortBy, setSortBy] = useState('keyword');

  // Filter and sort keywords
  const filteredKeywords = mockKeywords.filter(keyword => {
    if (searchQuery) {
      if (!keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    if (keywordFilter === 'used') {
      return keyword.isUsed;
    } else if (keywordFilter === 'unused') {
      return !keyword.isUsed;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'keyword') {
      return a.keyword.localeCompare(b.keyword);
    } else if (sortBy === 'volume') {
      return b.volume - a.volume;
    } else if (sortBy === 'difficulty') {
      return a.difficulty - b.difficulty;
    } else if (sortBy === 'usage') {
      return b.contentCount - a.contentCount;
    }
    return 0;
  });

  const handleUseKeyword = (keyword: string) => {
    toast.success(`Keyword "${keyword}" added to your content`, {
      description: "You can now use this keyword in your content editor."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              className="pl-9 bg-glass border-white/10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={keywordFilter} onValueChange={setKeywordFilter}>
            <SelectTrigger className="bg-glass border-white/10 w-[140px]">
              <SelectValue placeholder="All Keywords" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keywords</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="unused">Unused</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword">Sort by Keyword</SelectItem>
              <SelectItem value="volume">Sort by Volume</SelectItem>
              <SelectItem value="difficulty">Sort by Difficulty</SelectItem>
              <SelectItem value="usage">Sort by Usage</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            onClick={() => toast.info("Add keyword feature coming soon")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto rounded-md border border-white/10">
        <table className="w-full">
          <thead className="bg-secondary/30">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium">Keyword</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Volume</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Difficulty</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium">Content</th>
              <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredKeywords.map((item) => (
              <tr key={item.id} className="border-t border-white/10 hover:bg-secondary/10 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-medium">{item.keyword}</span>
                </td>
                <td className="py-3 px-4">{item.volume.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <DifficultyBadge difficulty={item.difficulty} />
                </td>
                <td className="py-3 px-4">
                  {item.isUsed ? (
                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Used</Badge>
                  ) : (
                    <Badge variant="outline">Unused</Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{item.contentCount}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUseKeyword(item.keyword)}
                    >
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      Use
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Search className="h-3.5 w-3.5 mr-1" />
                      Research
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper component for rendering difficulty badges
function DifficultyBadge({ difficulty }: { difficulty: number }) {
  if (difficulty < 30) {
    return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Easy ({difficulty})</Badge>;
  } else if (difficulty < 60) {
    return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Medium ({difficulty})</Badge>;
  } else {
    return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Hard ({difficulty})</Badge>;
  }
}
