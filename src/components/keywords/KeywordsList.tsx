
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Tag, FileText, Filter, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Table,
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { getKeywords, addKeyword, updateKeywordUsage, deleteKeyword, Keyword } from '@/services/keywordService';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function KeywordsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordFilter, setKeywordFilter] = useState('all');
  const [sortBy, setSortBy] = useState('keyword');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newVolume, setNewVolume] = useState<number | undefined>(undefined);
  const [newDifficulty, setNewDifficulty] = useState<number | undefined>(undefined);
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [activeView, setActiveView] = useState('list');
  
  const { user } = useAuth();
  
  useEffect(() => {
    fetchKeywords();
  }, []);
  
  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const data = await getKeywords();
      setKeywords(data);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      toast.error("Failed to load keywords");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort keywords
  const filteredKeywords = keywords.filter(keyword => {
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
      return (b.search_volume || 0) - (a.search_volume || 0);
    } else if (sortBy === 'difficulty') {
      return (a.difficulty || 0) - (b.difficulty || 0);
    } else if (sortBy === 'usage') {
      return (b.contentCount || 0) - (a.contentCount || 0);
    }
    return 0;
  });
  
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }
    
    setAddingKeyword(true);
    try {
      const keyword = await addKeyword(newKeyword, newVolume, newDifficulty);
      if (keyword) {
        setKeywords([keyword, ...keywords]);
        setOpenAddDialog(false);
        setNewKeyword('');
        setNewVolume(undefined);
        setNewDifficulty(undefined);
        toast.success(`Keyword "${newKeyword}" added successfully`);
      }
    } catch (error) {
      console.error("Error adding keyword:", error);
    } finally {
      setAddingKeyword(false);
    }
  };
  
  const handleDeleteKeyword = async (keywordId: string, keywordName: string) => {
    if (confirm(`Are you sure you want to delete "${keywordName}"?`)) {
      try {
        const success = await deleteKeyword(keywordId);
        if (success) {
          setKeywords(keywords.filter(k => k.id !== keywordId));
          toast.success(`Keyword "${keywordName}" deleted`);
        }
      } catch (error) {
        console.error("Error deleting keyword:", error);
        toast.error("Failed to delete keyword");
      }
    }
  };

  const handleUseKeyword = (keywordId: string, keywordName: string) => {
    // In a real implementation, we would use the current content ID
    // For now, we'll just show a toast message
    toast.success(`Keyword "${keywordName}" added to your content`, {
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
            onClick={() => setOpenAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeView} onValueChange={setActiveView}>
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading keywords...</span>
        </div>
      ) : filteredKeywords.length === 0 ? (
        <div className="text-center p-8 border border-white/10 rounded-md bg-secondary/10">
          <Tag className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-3 text-lg font-medium">No keywords found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `No keywords matching "${searchQuery}"` : 'Add your first keyword to get started'}
          </p>
          <Button 
            className="mt-4 bg-gradient-to-r from-neon-purple to-neon-blue"
            onClick={() => setOpenAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-white/10">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((item) => (
                <TableRow key={item.id} className="border-t border-white/10 hover:bg-secondary/10">
                  <TableCell className="font-medium">{item.keyword}</TableCell>
                  <TableCell>{item.search_volume ? item.search_volume.toLocaleString() : 'N/A'}</TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={item.difficulty} />
                  </TableCell>
                  <TableCell>
                    {item.isUsed ? (
                      <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Used</Badge>
                    ) : (
                      <Badge variant="outline">Unused</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{item.contentCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUseKeyword(item.id, item.keyword)}
                      >
                        <Tag className="h-3.5 w-3.5 mr-1" />
                        Use
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        <Search className="h-3.5 w-3.5 mr-1" />
                        Research
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteKeyword(item.id, item.keyword)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[425px] bg-glass border-white/10">
          <DialogHeader>
            <DialogTitle>Add New Keyword</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword</label>
              <Input 
                value={newKeyword} 
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter keyword"
                className="bg-glass border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Volume (optional)</label>
              <Input 
                type="number"
                value={newVolume === undefined ? '' : newVolume}
                onChange={(e) => setNewVolume(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter search volume"
                className="bg-glass border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty (0-100, optional)</label>
              <Input 
                type="number"
                min="0"
                max="100"
                value={newDifficulty === undefined ? '' : newDifficulty}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  if (value === undefined || (value >= 0 && value <= 100)) {
                    setNewDifficulty(value);
                  }
                }}
                placeholder="Enter difficulty score"
                className="bg-glass border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-neon-purple to-neon-blue"
              onClick={handleAddKeyword}
              disabled={addingKeyword || !newKeyword.trim()}
            >
              {addingKeyword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Keyword
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component for rendering difficulty badges
function DifficultyBadge({ difficulty }: { difficulty: number | null }) {
  if (difficulty === null) {
    return <Badge variant="outline">Unknown</Badge>;
  }
  
  if (difficulty < 30) {
    return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Easy ({difficulty})</Badge>;
  } else if (difficulty < 60) {
    return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Medium ({difficulty})</Badge>;
  } else {
    return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">Hard ({difficulty})</Badge>;
  }
}
