import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Clock, TrendingUp, ExternalLink, Plus } from 'lucide-react';

interface SerpTopStoriesSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpTopStoriesSection({ serpData, expanded, onAddToContent }: SerpTopStoriesSectionProps) {
  if (!expanded) return null;

  // Mock data for demonstration - in real implementation this would come from serpData.topStories
  const topStories = [
    {
      title: "Major Project Management Platform Announces AI Integration",
      source: "TechCrunch",
      publishedDate: "2 hours ago",
      thumbnail: "/api/placeholder/60/60",
      url: "https://techcrunch.com/story1"
    },
    {
      title: "Remote Work Tools See 40% Usage Increase in Q4 2024",
      source: "Forbes",
      publishedDate: "5 hours ago", 
      thumbnail: "/api/placeholder/60/60",
      url: "https://forbes.com/story2"
    },
    {
      title: "Best Practices for Team Collaboration in 2024",
      source: "Harvard Business Review",
      publishedDate: "1 day ago",
      thumbnail: "/api/placeholder/60/60", 
      url: "https://hbr.org/story3"
    }
  ];

  if (topStories.length === 0) {
    return (
      <div className="p-4 text-center text-white/50">
        <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent news stories found for this keyword</p>
        <p className="text-xs mt-1">Consider creating timely, newsworthy content</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Top Stories & News</span>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
          {topStories.length} recent stories
        </Badge>
      </div>

      <div className="space-y-3">
        {topStories.map((story, idx) => (
          <div key={idx} className="bg-white/5 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-md flex-shrink-0 flex items-center justify-center">
                <Newspaper className="h-6 w-6 text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white mb-1 line-clamp-2">{story.title}</h4>
                <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                  <span className="font-medium">{story.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{story.publishedDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToContent(story.title, 'news_story')}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-6 px-2"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-blue-300 mb-3">📰 News-Based Content Strategy</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
          <div>
            <span className="font-medium text-white">Trending Topics:</span>
            <p>Reference current events to make your content more timely and relevant</p>
          </div>
          <div>
            <span className="font-medium text-white">Authority Building:</span>
            <p>Cite recent industry news to establish thought leadership</p>
          </div>
          <div>
            <span className="font-medium text-white">Content Freshness:</span>
            <p>Update your content with latest developments to maintain rankings</p>
          </div>
          <div>
            <span className="font-medium text-white">Social Proof:</span>
            <p>Use industry news as supporting evidence for your recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
