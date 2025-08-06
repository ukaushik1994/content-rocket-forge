import React, { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './MarkdownRenderer';

interface EnhancedContentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  isLoading?: boolean;
  serpSelections?: SerpSelection[];
}

interface HighlightMatch {
  text: string;
  type: string;
  start: number;
  end: number;
  serpItem: SerpSelection;
}

// Enhanced search term extraction
const extractSearchTerms = (item: SerpSelection): string[] => {
  const terms: string[] = [];
  const content = item.content.toLowerCase();
  
  // Extract key phrases (2-4 words)
  const phrases = content.match(/\b\w+(?:\s+\w+){1,3}\b/g) || [];
  terms.push(...phrases.slice(0, 5)); // Take first 5 phrases
  
  // Extract important keywords (3+ characters, avoid common words)
  const words = content.match(/\b\w{3,}\b/g) || [];
  const filteredWords = words.filter(word => 
    !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'use', 'man', 'new', 'now', 'way', 'may', 'say'].includes(word)
  );
  terms.push(...filteredWords.slice(0, 8)); // Take first 8 meaningful words
  
  return [...new Set(terms)]; // Remove duplicates
};

export const EnhancedContentEditor: React.FC<EnhancedContentEditorProps> = ({
  content,
  onContentChange,
  isLoading = false,
  serpSelections = []
}) => {
  const [highlightMode, setHighlightMode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  // Find SERP item matches in content
  const highlightMatches = useMemo(() => {
    if (!content || !serpSelections.length) return [];
    
    const matches: HighlightMatch[] = [];
    const selectedItems = serpSelections.filter(item => item.selected);
    
    selectedItems.forEach(item => {
      // Find keywords and phrases from SERP items in content
      const searchTerms = extractSearchTerms(item);
      
      searchTerms.forEach(term => {
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          matches.push({
            text: match[0],
            type: item.type,
            start: match.index,
            end: match.index + match[0].length,
            serpItem: item
          });
        }
      });
    });
    
    return matches.sort((a, b) => a.start - b.start);
  }, [content, serpSelections]);

  // Get color for SERP item type - enhanced visibility
  const getHighlightColor = (type: string) => {
    const colors = {
      'people_also_ask': 'bg-blue-500/20 text-blue-900 dark:text-blue-100 border border-blue-400/40',
      'related_searches': 'bg-green-500/20 text-green-900 dark:text-green-100 border border-green-400/40',
      'headings': 'bg-purple-500/20 text-purple-900 dark:text-purple-100 border border-purple-400/40',
      'entities': 'bg-orange-500/20 text-orange-900 dark:text-orange-100 border border-orange-400/40',
      'content_gaps': 'bg-red-500/20 text-red-900 dark:text-red-100 border border-red-400/40',
      'top_results': 'bg-cyan-500/20 text-cyan-900 dark:text-cyan-100 border border-cyan-400/40'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-900 dark:text-gray-100 border border-gray-400/40';
  };

  // Get unique SERP types for filter buttons
  const serpTypes = useMemo(() => {
    const types = new Set(serpSelections.filter(item => item.selected).map(item => item.type));
    return Array.from(types);
  }, [serpSelections]);

  return (
    <Card className="border border-muted h-full flex-1 flex flex-col">
      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {/* SERP Highlight Controls */}
          {serpTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Highlight:</span>
              <button
                onClick={() => setHighlightMode(null)}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                  !highlightMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                }`}
              >
                All
              </button>
              {serpTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setHighlightMode(highlightMode === type ? null : type)}
                  className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                    highlightMode === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                  }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <TabsContent value="write" className="flex-1 m-0 data-[state=active]:flex flex-col relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading content...</span>
              </div>
            </div>
          )}
          
          <div className="flex-1">
            <Textarea 
              value={content} 
              onChange={handleChange} 
              placeholder="Write your content here..." 
              className="h-full border-0 focus-visible:ring-0 resize-none p-4" 
              disabled={isLoading}
            />
          </div>
          
          {/* SERP Integration Info */}
          {highlightMatches.length > 0 && (
            <div className="px-3 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>
                  {highlightMatches.length} SERP integrations found • Switch to Preview to see highlights
                </span>
                <div className="flex gap-1 ml-auto">
                  {serpTypes.map(type => {
                    const count = highlightMatches.filter(m => m.type === type).length;
                    return (
                      <Badge key={type} variant="secondary" className="text-[10px] px-1 py-0">
                        {type.replace(/_/g, ' ')}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 m-0 data-[state=active]:flex flex-col relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading preview...</span>
              </div>
            </div>
          )}
          <CardContent className="p-4 flex-1">
            <ScrollArea className="h-full">
              <MarkdownRenderer 
                content={content}
                matches={highlightMatches}
                highlightMode={highlightMode}
              />
            </ScrollArea>
          </CardContent>
          
          {/* Enhanced SERP Integration Info for Preview */}
          {highlightMatches.length > 0 && (
            <div className="px-3 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>
                  {highlightMatches.length} SERP integrations highlighted above
                </span>
                <div className="flex gap-1 ml-auto">
                  {serpTypes.map(type => {
                    const count = highlightMatches.filter(m => m.type === type).length;
                    return (
                      <Badge key={type} variant="secondary" className={`text-[10px] px-1 py-0 ${getHighlightColor(type)}`}>
                        {type.replace(/_/g, ' ')}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
