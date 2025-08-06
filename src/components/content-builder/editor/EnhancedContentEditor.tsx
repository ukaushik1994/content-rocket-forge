import React, { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { Badge } from '@/components/ui/badge';

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

// Extract search terms from SERP items - moved before usage
const extractSearchTerms = (item: SerpSelection): string[] => {
  const terms: string[] = [];
  const content = item.content.toLowerCase();
  
  // Extract key phrases (3+ words)
  const phrases = content.match(/\b\w+\s+\w+\s+\w+(?:\s+\w+)*\b/g) || [];
  terms.push(...phrases.slice(0, 3)); // Take first 3 phrases
  
  // Extract important keywords (longer than 4 characters)
  const words = content.match(/\b\w{5,}\b/g) || [];
  terms.push(...words.slice(0, 5)); // Take first 5 words
  
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

  // Get color for SERP item type - improved for dark theme
  const getHighlightColor = (type: string) => {
    const colors = {
      'people_also_ask': 'bg-blue-400/30 text-blue-100 border-blue-400/60',
      'related_searches': 'bg-green-400/30 text-green-100 border-green-400/60',
      'headings': 'bg-purple-400/30 text-purple-100 border-purple-400/60',
      'entities': 'bg-orange-400/30 text-orange-100 border-orange-400/60',
      'content_gaps': 'bg-red-400/30 text-red-100 border-red-400/60',
      'top_results': 'bg-cyan-400/30 text-cyan-100 border-cyan-400/60'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-400/30 text-gray-100 border-gray-400/60';
  };

  // Render content with highlights for preview
  const renderHighlightedMarkdown = (text: string) => {
    if (!highlightMatches.length) {
      return text;
    }

    let processedText = text;
    const sortedMatches = [...highlightMatches].sort((a, b) => b.start - a.start); // Process from end to start

    sortedMatches.forEach((match, index) => {
      const shouldHighlight = !highlightMode || highlightMode === match.type;
      
      if (shouldHighlight) {
        const beforeText = processedText.slice(0, match.start);
        const matchText = processedText.slice(match.start, match.end);
        const afterText = processedText.slice(match.end);
        
        const highlightHtml = `<span class="inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-medium transition-all duration-200 hover:scale-105 cursor-help ${getHighlightColor(match.type)}" title="SERP Match: ${match.type.replace(/_/g, ' ')} - ${match.serpItem.content.slice(0, 100)}...">${matchText}</span>`;
        
        processedText = beforeText + highlightHtml + afterText;
      }
    });

    return processedText;
  };

  // Simple Markdown to HTML converter with highlights
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';
    
    // First apply highlights to the raw markdown
    const highlightedMarkdown = renderHighlightedMarkdown(markdown);
    
    let html = highlightedMarkdown;

    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-foreground">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-foreground">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-foreground">$1</h3>');

    // Convert bold
    html = html.replace(/\*\*(.*)\*\*/gm, '<strong class="font-semibold">$1</strong>');

    // Convert italic
    html = html.replace(/\*(.*)\*/gm, '<em class="italic">$1</em>');

    // Convert paragraphs
    html = html.split('\n\n').map(p => `<p class="mb-4 text-foreground leading-relaxed">${p}</p>`).join('');
    return html;
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
              <div 
                className="max-w-none" 
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(content)
                }} 
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
