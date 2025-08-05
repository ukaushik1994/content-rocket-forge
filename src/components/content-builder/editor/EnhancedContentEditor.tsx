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

  // Get color for SERP item type
  const getHighlightColor = (type: string) => {
    const colors = {
      'people_also_ask': 'bg-blue-500/20 border-blue-500/50',
      'related_searches': 'bg-green-500/20 border-green-500/50',
      'headings': 'bg-purple-500/20 border-purple-500/50',
      'entities': 'bg-orange-500/20 border-orange-500/50',
      'content_gaps': 'bg-red-500/20 border-red-500/50',
      'top_results': 'bg-cyan-500/20 border-cyan-500/50'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 border-gray-500/50';
  };

  // Render content with highlights
  const renderHighlightedContent = (text: string) => {
    if (!highlightMatches.length) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    highlightMatches.forEach((match, index) => {
      // Add text before highlight
      if (match.start > lastIndex) {
        parts.push(text.slice(lastIndex, match.start));
      }

      // Add highlighted text
      const shouldHighlight = !highlightMode || highlightMode === match.type;
      
      if (shouldHighlight) {
        parts.push(
          <TooltipProvider key={`highlight-${index}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`inline-block px-1 rounded border ${getHighlightColor(match.type)} cursor-help transition-all duration-200 hover:scale-105`}
                >
                  {match.text}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-semibold mb-1">SERP Match: {match.type.replace(/_/g, ' ')}</div>
                  <div className="text-muted-foreground text-xs max-w-xs">
                    {match.serpItem.content.slice(0, 100)}...
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } else {
        parts.push(match.text);
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Simple Markdown to HTML converter with highlights
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';
    let html = markdown;

    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Convert bold
    html = html.replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>');

    // Convert italic
    html = html.replace(/\*(.*)\*/gm, '<em>$1</em>');

    // Convert paragraphs
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
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
          
          <div className="flex-1 relative">
            <Textarea 
              value={content} 
              onChange={handleChange} 
              placeholder="Write your content here..." 
              className="min-h-[75vh] h-full border-0 focus-visible:ring-0 resize-none p-4 flex-1 absolute inset-0" 
              disabled={isLoading}
            />
            
            {/* Highlight Overlay */}
            {highlightMatches.length > 0 && (
              <div className="absolute inset-0 p-4 pointer-events-none overflow-hidden">
                <div className="whitespace-pre-wrap text-transparent font-mono text-sm leading-6">
                  {renderHighlightedContent(content)}
                </div>
              </div>
            )}
          </div>
          
          {/* SERP Integration Info */}
          {highlightMatches.length > 0 && (
            <div className="px-3 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>
                  {highlightMatches.length} SERP integrations found
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
            <ScrollArea className="h-[75vh]">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert" 
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(content)
                }} 
              />
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
