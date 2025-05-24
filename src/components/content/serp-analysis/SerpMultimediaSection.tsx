
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image, Video, Play, Camera, Plus } from 'lucide-react';

interface SerpMultimediaSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpMultimediaSection({ serpData, expanded, onAddToContent }: SerpMultimediaSectionProps) {
  if (!expanded) return null;

  const multimediaData = serpData.multimediaOpportunities || [];
  const imageOpportunities = multimediaData.find(m => m.type === 'images');
  const videoOpportunities = multimediaData.find(m => m.type === 'videos');

  if (multimediaData.length === 0) {
    return (
      <div className="p-4 text-center text-white/50">
        <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No multimedia opportunities detected</p>
        <p className="text-xs mt-1">Consider adding relevant images or videos</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Multimedia Opportunities</span>
        </div>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
          {multimediaData.length} types found
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Opportunities */}
        {imageOpportunities && (
          <div className="bg-white/5 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Image className="h-4 w-4 text-purple-400" />
              <span className="font-medium text-white">Image Pack</span>
              <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {imageOpportunities.count} images
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {imageOpportunities.suggestions.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <span className="text-sm text-white/80 truncate">{suggestion.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToContent(suggestion.title, 'image_idea')}
                    className="text-purple-400 hover:text-purple-300 h-6 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-white/60">
              <p className="font-medium text-purple-300 mb-1">📸 Image Strategy:</p>
              <ul className="space-y-1">
                <li>• Create original screenshots/diagrams</li>
                <li>• Include before/after comparisons</li>
                <li>• Add infographics for complex data</li>
              </ul>
            </div>
          </div>
        )}

        {/* Video Opportunities */}
        {videoOpportunities && (
          <div className="bg-white/5 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-4 w-4 text-red-400" />
              <span className="font-medium text-white">Video Carousel</span>
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                {videoOpportunities.count} videos
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {videoOpportunities.suggestions.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Play className="h-3 w-3 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-white/80 truncate">{suggestion.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToContent(suggestion.title, 'video_idea')}
                    className="text-red-400 hover:text-red-300 h-6 px-2"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="text-xs text-white/60">
              <p className="font-medium text-red-300 mb-1">🎥 Video Strategy:</p>
              <ul className="space-y-1">
                <li>• Create tutorial walkthroughs</li>
                <li>• Record product demos</li>
                <li>• Embed relevant YouTube videos</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Overall Multimedia Strategy */}
      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-purple-300 mb-3">🎨 Multimedia SEO Strategy</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/70">
          <div>
            <span className="font-medium text-white">Image SEO:</span>
            <p>Use descriptive alt text, optimize file sizes, include in image sitemaps</p>
          </div>
          <div>
            <span className="font-medium text-white">Video SEO:</span>
            <p>Add video schema markup, optimize thumbnails, include transcripts</p>
          </div>
          <div>
            <span className="font-medium text-white">User Experience:</span>
            <p>Multimedia content increases engagement and reduces bounce rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
