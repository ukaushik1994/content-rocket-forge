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
  Tag,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { keywordLibraryService, UnifiedKeyword, KeywordFilters } from '@/services/keywordLibraryService';
import { SimplifiedKeywordFilters } from '@/components/keyword-library/SimplifiedKeywordFilters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnhancedEmbeddedKeywordLibraryProps {
  onKeywordSelect?: (keyword: UnifiedKeyword) => void;
  refreshTrigger?: number;
  className?: string;
}

export const EnhancedEmbeddedKeywordLibrary: React.FC<EnhancedEmbeddedKeywordLibraryProps> = ({
  onKeywordSelect,
  refreshTrigger,
  className
}) => {
  const [keywords, setKeywords] = useState<UnifiedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<KeywordFilters>({
    search: '',
    has_usage: undefined
  });

  const loadKeywords = async () => {
    setLoading(true);
    try {
      const currentFilters = { ...filters, search: searchTerm };
      const result = await keywordLibraryService.getContentKeywords(currentFilters, 1, 20);
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
  }, [searchTerm, refreshTrigger, filters]);

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




  const toggleRowExpansion = (keywordId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) {
        newSet.delete(keywordId);
      } else {
        newSet.add(keywordId);
      }
      return newSet;
    });
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
            <h3 className="text-lg font-semibold mb-2">No keywords in your content yet</h3>
            <p className="text-muted-foreground mb-4">Start creating content and adding keywords to build your keyword repository</p>
            <Button onClick={() => window.location.href = '/content-builder'}>
              Create Content →
            </Button>
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
          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Keywords</DialogTitle>
              </DialogHeader>
              <SimplifiedKeywordFilters
                filters={filters}
                onFiltersChange={setFilters}
                onApply={() => setShowFilters(false)}
              />
            </DialogContent>
          </Dialog>
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
                className="border-b border-white/5"
              >
                <div 
                  className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer"
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
                  
                  <div className="flex items-center gap-2">
                    {(keyword as any).content_pieces?.length > 1 && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        Used in {(keyword as any).content_pieces.length} pieces
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{keyword.keyword}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        📄 {(keyword as any).content_pieces?.length || 0} pieces
                      </span>
                      {(keyword as any).content_pieces?.filter((p: any) => p.status === 'published').length > 0 && (
                        <span className="flex items-center gap-1 text-green-400">
                          ✅ {(keyword as any).content_pieces.filter((p: any) => p.status === 'published').length} published
                        </span>
                      )}
                      {(keyword as any).content_pieces?.filter((p: any) => p.status === 'draft').length > 0 && (
                        <span className="flex items-center gap-1 text-blue-400">
                          📝 {(keyword as any).content_pieces.filter((p: any) => p.status === 'draft').length} draft
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpansion(keyword.id);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {expandedRows.has(keyword.id) ? 
                        <ChevronUp className="h-3 w-3" /> : 
                        <ChevronDown className="h-3 w-3" />
                      }
                    </Button>
                    
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
                  </div>
                </div>

                {/* Expanded Details - Content Pieces */}
                <AnimatePresence>
                  {expandedRows.has(keyword.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-3 pb-3 border-t border-white/5 bg-white/2"
                    >
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Used in:</p>
                        {(keyword as any).content_pieces?.map((piece: any) => (
                          <div key={piece.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={
                                piece.status === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                piece.status === 'draft' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                'bg-gray-500/20 text-gray-300 border-gray-500/30'
                              }>
                                {piece.status}
                              </Badge>
                              <span className="truncate max-w-[300px]">{piece.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/repository?id=${piece.id}`}
                              className="h-6 text-xs"
                            >
                              View →
                            </Button>
                          </div>
                        ))}
                        
                        {/* Cannibalization warning */}
                        {(keyword as any).content_pieces?.filter((p: any) => p.status === 'published').length > 1 && (
                          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                            <span className="text-yellow-400 font-medium">⚠️ Keyword Cannibalization Warning:</span>
                            <p className="text-muted-foreground mt-1">
                              This keyword is used in {(keyword as any).content_pieces.filter((p: any) => p.status === 'published').length} published pieces. 
                              Consider consolidating or differentiating the content.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
    </Card>
  );
};