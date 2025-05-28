
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Copy, 
  Download, 
  Eye, 
  BarChart3, 
  Clock, 
  Hash,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedContentPreviewSectionProps {
  content: string;
  title: string;
  keywords: string[];
  onCopy: () => void;
  onExport: () => void;
  isLoading: boolean;
  contentAnalytics?: any;
  keywordUsage?: any[];
  metaTitle?: string;
  metaDescription?: string;
}

export const EnhancedContentPreviewSection: React.FC<EnhancedContentPreviewSectionProps> = ({
  content,
  title,
  keywords,
  onCopy,
  onExport,
  isLoading,
  contentAnalytics,
  keywordUsage = [],
  metaTitle,
  metaDescription
}) => {
  const [previewMode, setPreviewMode] = useState<'content' | 'analytics'>('content');

  const formatReadingTime = (minutes: number) => {
    if (minutes < 1) return '< 1 min read';
    return `${minutes} min read`;
  };

  const getKeywordDensityColor = (density: string) => {
    const num = parseFloat(density.replace('%', ''));
    if (num >= 1 && num <= 3) return 'text-green-500';
    if (num < 1) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={previewMode === 'content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('content')}
            >
              <Eye className="h-4 w-4 mr-1" />
              Content
            </Button>
            <Button
              variant={previewMode === 'analytics' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {contentAnalytics && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="p-2 bg-background/50 rounded-lg text-center border border-white/10">
              <div className="text-sm font-bold text-blue-500">{contentAnalytics.wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center border border-white/10">
              <div className="text-sm font-bold text-blue-500">{formatReadingTime(contentAnalytics.readingTime)}</div>
              <div className="text-xs text-muted-foreground">Reading</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center border border-white/10">
              <div className="text-sm font-bold text-blue-500">{contentAnalytics.seoScore}%</div>
              <div className="text-xs text-muted-foreground">SEO Score</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg text-center border border-white/10">
              <div className="text-sm font-bold text-blue-500">{keywords.length}</div>
              <div className="text-xs text-muted-foreground">Keywords</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-6">
          {previewMode === 'content' ? (
            <div className="space-y-6">
              {/* Title Section */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground border-b pb-2">
                  {title}
                </h1>
                
                {/* Meta Information */}
                {(metaTitle || metaDescription) && (
                  <div className="bg-background/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Meta Information
                    </h3>
                    {metaTitle && (
                      <div className="mb-2">
                        <div className="text-xs text-muted-foreground">Meta Title</div>
                        <div className="text-sm font-medium">{metaTitle}</div>
                      </div>
                    )}
                    {metaDescription && (
                      <div>
                        <div className="text-xs text-muted-foreground">Meta Description</div>
                        <div className="text-sm">{metaDescription}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords */}
                {keywords && keywords.length > 0 && (
                  <div className="bg-background/30 rounded-lg p-4 border border-white/10">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Target Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant={index === 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {keyword}
                          {index === 0 && <span className="ml-1 text-xs">(Primary)</span>}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {content}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No content available</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Content Analytics */}
              {contentAnalytics && (
                <div className="bg-background/30 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Content Analytics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Word Count</span>
                        <span className="font-medium">{contentAnalytics.wordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reading Time</span>
                        <span className="font-medium">{formatReadingTime(contentAnalytics.readingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">SEO Score</span>
                        <span className="font-medium">{contentAnalytics.seoScore}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Meta Title</span>
                        {contentAnalytics.hasMetaTitle ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Meta Description</span>
                        {contentAnalytics.hasMetaDescription ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Keyword Usage Analytics */}
              {keywordUsage && keywordUsage.length > 0 && (
                <div className="bg-background/30 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Keyword Usage Analysis
                  </h3>
                  <div className="space-y-3">
                    {keywordUsage.map((usage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-background/50 rounded border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{usage.keyword}</div>
                          <div className="text-xs text-muted-foreground">
                            Used {usage.count} times
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium text-sm ${getKeywordDensityColor(usage.density)}`}>
                            {usage.density}
                          </div>
                          <div className="text-xs text-muted-foreground">density</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Indicators */}
              <div className="bg-background/30 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Performance Indicators
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Length</span>
                    <Badge variant={contentAnalytics?.wordCount >= 300 ? "default" : "secondary"}>
                      {contentAnalytics?.wordCount >= 300 ? "Good" : "Short"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Keyword Coverage</span>
                    <Badge variant={keywordUsage.length > 0 ? "default" : "secondary"}>
                      {keywordUsage.length > 0 ? "Active" : "None"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SEO Optimization</span>
                    <Badge variant={contentAnalytics?.seoScore >= 70 ? "default" : "secondary"}>
                      {contentAnalytics?.seoScore >= 70 ? "Optimized" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Action Buttons */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy Content
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
};
