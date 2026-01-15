import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Grid3x3,
  List,
  TrendingUp,
  Type,
  Target,
  Eye,
  MousePointerClick,
  Share2,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContentPreview } from './ContentPreview';
import { MediaThumbnail } from '@/components/content/MediaThumbnail';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  approval_status: string;
  seo_score?: number;
  keywords?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  performance_metrics?: {
    views: number;
    engagement: number;
    clicks: number;
    shares: number;
    conversions: number;
    last_updated: string | null;
  };
  generated_images?: Array<{ id: string; url: string; alt?: string }>;
  metadata?: {
    generated_images?: Array<{ id: string; url: string; alt?: string }>;
  };
}

interface ContentLibraryProps {
  campaignId: string;
}

export const ContentLibrary = ({ campaignId }: ContentLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const { data: contentItems = [], isLoading } = useQuery({
    queryKey: ['campaign-content', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredContent = useMemo(() => {
    return contentItems.filter(item => {
      const keywords = Array.isArray(item.keywords) ? item.keywords : [];
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        keywords.some(kw => String(kw).toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFormat = filterFormat === 'all' || item.content_type === filterFormat;
      const matchesStatus = filterStatus === 'all' || item.approval_status === filterStatus;

      return matchesSearch && matchesFormat && matchesStatus;
    });
  }, [contentItems, searchQuery, filterFormat, filterStatus]);

  const stats = useMemo(() => {
    const getWordCount = (content: string): number => {
      return content.split(/\s+/).filter(w => w.length > 0).length;
    };

    return {
      total: contentItems.length,
      ready: contentItems.filter(i => i.approval_status === 'published' || i.approval_status === 'approved').length,
      generating: contentItems.filter(i => i.approval_status === 'draft').length,
      error: contentItems.filter(i => i.approval_status === 'rejected').length,
      totalWords: contentItems.reduce((sum, i) => sum + getWordCount(i.content), 0),
      avgSeoScore: contentItems.length > 0 
        ? Math.round(contentItems.reduce((sum, i) => sum + (i.seo_score || 0), 0) / contentItems.length)
        : 0
    };
  }, [contentItems]);

  const formats = useMemo(() => {
    const formatSet = new Set(contentItems.map(i => i.content_type));
    return Array.from(formatSet);
  }, [contentItems]);

  const formatNames: Record<string, string> = {
    'blog': 'Blog Post',
    'email': 'Email',
    'social-twitter': 'Twitter',
    'social-linkedin': 'LinkedIn',
    'social-facebook': 'Facebook',
    'social-instagram': 'Instagram',
    'script': 'Video Script',
    'landing-page': 'Landing Page',
    'carousel': 'Carousel',
    'meme': 'Meme',
    'google-ads': 'Google Ads',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.ready}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Generating</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">{stats.generating}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Errors</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.error}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Type className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Words</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg SEO</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgSeoScore}</p>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterFormat === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterFormat('all')}
            >
              All Formats
            </Button>
            {formats.map(format => (
              <Button
                key={format}
                variant={filterFormat === format ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterFormat(format)}
              >
                {formatNames[format] || format}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All Status
            </Button>
            <Button
              variant={filterStatus === 'ready' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('ready')}
            >
              Ready
            </Button>
            <Button
              variant={filterStatus === 'error' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('error')}
            >
              Errors
            </Button>
          </div>

          <div className="flex gap-1 border border-border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-2"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Grid/List */}
        <ScrollArea className="h-[600px]">
          {filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>No content found</p>
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            )}>
              {filteredContent.map(item => (
                <Card
                  key={item.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedContent({
                    ...item,
                    keywords: Array.isArray(item.keywords) ? item.keywords.map(k => String(k)) : [],
                    performance_metrics: item.performance_metrics as any,
                    generated_images: undefined,
                    metadata: undefined
                  } as ContentItem)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {/* Image thumbnail if available */}
                      {(() => {
                        const images = (item as any).generated_images || (item as any).metadata?.generated_images || [];
                        const firstImage = Array.isArray(images) && images.length > 0 ? images[0] : null;
                        return firstImage ? (
                          <MediaThumbnail
                            src={firstImage.url}
                            alt="Content image"
                            size="xs"
                            showTypeIcon={false}
                            showHoverPreview={true}
                          />
                        ) : null;
                      })()}
                      <Badge variant="outline" className="text-xs">
                        {formatNames[item.content_type] || item.content_type}
                      </Badge>
                      {(() => {
                        const images = (item as any).generated_images || (item as any).metadata?.generated_images || [];
                        const imageCount = Array.isArray(images) ? images.length : 0;
                        return imageCount > 0 ? (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {imageCount}
                          </Badge>
                        ) : null;
                      })()}
                    </div>
                    <Badge 
                      variant={
                        item.approval_status === 'published' || item.approval_status === 'approved' ? 'default' :
                        item.approval_status === 'draft' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {(item.approval_status === 'published' || item.approval_status === 'approved') && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {item.approval_status === 'draft' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {item.approval_status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {item.approval_status}
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  
                  {Array.isArray(item.keywords) && item.keywords.length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-3">
                      {item.keywords.slice(0, 3).map((kw, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {String(kw)}
                        </Badge>
                      ))}
                      {item.keywords.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                    <span>{item.content.split(/\s+/).length} words</span>
                    {item.seo_score && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        SEO: {item.seo_score}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {selectedContent && (
        <ContentPreview
          content={selectedContent}
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          onUpdate={(updatedContent) => {
            setSelectedContent(null);
            // Refetch to get updated data
          }}
        />
      )}
    </>
  );
};
