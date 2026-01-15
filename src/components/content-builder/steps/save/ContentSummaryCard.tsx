
import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Twitter, Facebook, Linkedin, Mail, Image as ImageIcon, Film } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { MediaThumbnailGrid } from '@/components/content/MediaThumbnail';
import { VideoPlaceholder } from '@/components/content/VideoPlaceholder';

interface ContentSummaryCardProps {
  handleDownload: (format: 'pdf' | 'docx' | 'html') => void;
  socialShare: boolean;
  generatedImages?: Array<{ id: string; url: string; alt?: string }>;
}

export const ContentSummaryCard: React.FC<ContentSummaryCardProps> = ({ 
  handleDownload, 
  socialShare,
  generatedImages = []
}) => {
  const { state } = useContentBuilder();
  const { 
    mainKeyword,
    contentType,
    seoScore,
    selectedSolution,
    content,
    seoImprovements
  } = state;
  
  // Get solution name safely
  const solutionName = selectedSolution ? selectedSolution.name : 'Not specified';
  
  // Check if optimizations were applied
  const hasAppliedOptimizations = seoImprovements?.some(improvement => improvement.applied) || false;
  
  const imageCount = generatedImages.length;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          Content Summary
          {imageCount > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              <ImageIcon className="h-3 w-3" />
              {imageCount} Images
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generated Images Preview */}
        {imageCount > 0 && (
          <div className="space-y-2 pb-3 border-b border-border">
            <p className="text-xs text-muted-foreground">Generated Images</p>
            <MediaThumbnailGrid 
              images={generatedImages} 
              maxDisplay={4} 
              size="sm"
            />
          </div>
        )}

        {/* Video Placeholder */}
        <VideoPlaceholder variant="inline" compact />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Main Keyword</p>
            <p className="font-medium">{mainKeyword}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Content Type</p>
            <p className="font-medium">{contentType || 'Not specified'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Word Count</p>
            <p className="font-medium">{content ? content.split(/\s+/).filter(Boolean).length : 0}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">SEO Score</p>
            <p className="font-medium">{seoScore}/100</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Solution</p>
            <p className="font-medium">{solutionName}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-medium">Draft</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Optimized</p>
            <p className="font-medium">{hasAppliedOptimizations ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Media</p>
            <p className="font-medium">{imageCount > 0 ? `${imageCount} images` : 'None'}</p>
          </div>
        </div>
        
        <div className="pt-4 space-y-3">
          <h4 className="text-sm font-medium">Export Options</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleDownload('pdf')}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleDownload('docx')}
            >
              <Download className="h-4 w-4" />
              Word
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => handleDownload('html')}
            >
              <Download className="h-4 w-4" />
              HTML
            </Button>
          </div>
        </div>
        
        {socialShare && (
          <div className="pt-4 space-y-3">
            <h4 className="text-sm font-medium">Share On</h4>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
