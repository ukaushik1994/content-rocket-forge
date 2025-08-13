import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Trash2, 
  BookOpen, 
  Target, 
  FileText,
  Volume2,
  Users,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { keywordLibraryService, UnifiedKeyword, KeywordFilters } from '@/services/keywordLibraryService';
import { KeywordUsageDetail } from '@/components/keyword-library/KeywordUsageDetail';
import { DuplicateManager } from '@/components/keyword-library/DuplicateManager';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface EmbeddedKeywordLibraryProps {
  onKeywordSelect?: (keyword: UnifiedKeyword) => void;
  refreshTrigger?: number;
  className?: string;
}

export const EmbeddedKeywordLibrary: React.FC<EmbeddedKeywordLibraryProps> = ({
  onKeywordSelect,
  refreshTrigger,
  className
}) => {
  const [keywords, setKeywords] = useState<UnifiedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const [filters] = useState<KeywordFilters>({
    search: '',
    has_usage: undefined
  });

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, search: searchTerm };
      const result = await keywordLibraryService.getKeywords(currentFilters, 1, 10);
      setKeywords(result.keywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeywords();
  }, [searchTerm, refreshTrigger]);

  const handleDeleteKeywords = async (keywordIds: string[]) => {
    try {
      await keywordLibraryService.deleteKeywords(keywordIds);
      await loadKeywords();
      setSelectedKeywords([]);
      toast.success('Keywords deleted successfully');
    } catch (error) {
      toast.error('Failed to delete keywords');
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'manual': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'research': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'serp': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'glossary': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (keywords.length === 0 && !loading) {
    return (
      <Card className={cn("glass-panel border-white/10", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            Keyword Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No keywords saved yet</h3>
            <p className="text-muted-foreground mb-4">Start researching keywords to build your library</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass-panel border-white/10", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5 text-primary" />
            Keyword Library ({keywords.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDuplicateManager(true)}
              className="text-xs"
            >
              Find Duplicates
            </Button>
            {selectedKeywords.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteKeywords(selectedKeywords)}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete ({selectedKeywords.length})
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-0">
          <AnimatePresence>
            {keywords.map((keyword) => (
              <motion.div
                key={keyword.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onKeywordSelect?.(keyword)}
              >
                <input
                  type="checkbox"
                  checked={selectedKeywords.includes(keyword.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedKeywords([...selectedKeywords, keyword.id]);
                    } else {
                      setSelectedKeywords(selectedKeywords.filter(id => id !== keyword.id));
                    }
                  }}
                  className="rounded border-white/20"
                />
                
                <Badge className={getSourceBadgeColor('research')}>
                  research
                </Badge>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{keyword.keyword}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {keyword.search_volume && (
                      <span className="flex items-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        {keyword.search_volume.toLocaleString()}
                      </span>
                    )}
                    {keyword.difficulty && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        KD {keyword.difficulty}
                      </span>
                    )}
                    {keyword.usage_count > 0 && (
                      <KeywordUsageDetail 
                        keywordId={keyword.id} 
                        usageCount={keyword.usage_count}
                      />
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Recent
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(keyword.keyword);
                      toast.success('Keyword copied to clipboard');
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKeywords([keyword.id]);
                      }}
                      className="text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </CardContent>
      
      <DuplicateManager 
        open={showDuplicateManager}
        onClose={() => setShowDuplicateManager(false)}
        onSuccess={loadKeywords}
      />
    </Card>
  );
};