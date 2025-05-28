import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Copy, Download, BookOpen, Clock, Eye, Hash, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentPreviewSectionProps {
  content: string;
  title: string;
  keywords: string[];
  onCopy: () => void;
  onExport: () => void;
}

export const ContentPreviewSection: React.FC<ContentPreviewSectionProps> = ({
  content,
  title,
  keywords,
  onCopy,
  onExport
}) => {
  const [selectedHeading, setSelectedHeading] = useState<string | null>(null);

  // Extract content statistics
  const contentStats = useMemo(() => {
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = content.length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
    
    // Extract headings for table of contents
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;
    const headings: { level: number; text: string; id: string }[] = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ level, text, id });
    }
    
    return {
      wordCount,
      charCount,
      readingTime,
      headings
    };
  }, [content]);

  const scrollToHeading = (headingId: string) => {
    setSelectedHeading(headingId);
    // In a real implementation, you'd scroll to the heading in the content
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Table of Contents & Stats */}
      <div className="lg:col-span-1 space-y-4">
        {/* Content Statistics */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Content Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.div 
                className="text-center p-3 rounded-lg bg-background/50 border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xl font-bold text-primary">{contentStats.wordCount}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </motion.div>
              <motion.div 
                className="text-center p-3 rounded-lg bg-background/50 border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-xl font-bold text-primary">{contentStats.readingTime}</div>
                <div className="text-xs text-muted-foreground">Min Read</div>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Characters:</span>
              <span className="font-medium">{contentStats.charCount.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Headings:</span>
              <span className="font-medium">{contentStats.headings.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        {keywords.length > 0 && (
          <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge 
                    key={index}
                    variant={index === 0 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table of Contents */}
        {contentStats.headings.length > 0 && (
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Table of Contents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {contentStats.headings.map((heading, index) => (
                    <motion.button
                      key={index}
                      onClick={() => scrollToHeading(heading.id)}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors hover:bg-accent/20 ${
                        selectedHeading === heading.id ? 'bg-accent/30 text-accent-foreground' : 'text-muted-foreground'
                      }`}
                      style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {heading.text}
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={onCopy}
            className="w-full justify-start"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Content
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            className="w-full justify-start"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Content
          </Button>
        </div>
      </div>

      {/* Content Display */}
      <div className="lg:col-span-3">
        <Card className="h-full bg-gradient-to-br from-background via-background/95 to-background/90 border border-white/10">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {contentStats.readingTime} min read
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <ScrollArea className="h-[calc(100%-4rem)] p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content ? (
                  <motion.div 
                    className="whitespace-pre-wrap leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.7',
                      fontSize: '15px'
                    }}
                  >
                    {content.split('\n').map((paragraph, index) => {
                      // Handle headings
                      if (paragraph.match(/^#{1,6}\s+/)) {
                        const level = paragraph.match(/^(#{1,6})/)?.[1].length || 1;
                        const text = paragraph.replace(/^#{1,6}\s+/, '');
                        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                        
                        return (
                          <HeadingTag
                            key={index}
                            className={`font-bold mt-8 mb-4 text-foreground ${
                              level === 1 ? 'text-2xl' : 
                              level === 2 ? 'text-xl' : 
                              level === 3 ? 'text-lg' : 'text-base'
                            }`}
                          >
                            {text}
                          </HeadingTag>
                        );
                      }
                      
                      // Handle regular paragraphs
                      if (paragraph.trim()) {
                        return (
                          <p key={index} className="mb-4 text-foreground/90">
                            {paragraph}
                          </p>
                        );
                      }
                      
                      return <br key={index} />;
                    })}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No content available</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
