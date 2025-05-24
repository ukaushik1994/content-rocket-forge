
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Lightbulb, Plus } from 'lucide-react';

interface SerpContentGapsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpContentGapsSection({ serpData, expanded, onAddToContent }: SerpContentGapsSectionProps) {
  if (!expanded) return null;

  const contentGaps = serpData.contentGaps || [
    {
      topic: "Mobile app comparison",
      description: "None of the top 10 results compare mobile apps in detail",
      recommendation: "Create a comprehensive mobile app feature comparison",
      opportunity: "High - mobile usage is growing",
      source: "Top 10 analysis"
    },
    {
      topic: "Pricing breakdown by team size",
      description: "Most articles mention pricing but don't break down costs by team size",
      recommendation: "Add detailed pricing calculator or breakdown section",
      opportunity: "Medium - helps with purchase decisions",
      source: "Competitor analysis"
    },
    {
      topic: "Integration tutorials",
      description: "Limited step-by-step integration guides in top results",
      recommendation: "Include detailed integration walkthroughs",
      opportunity: "High - technical users seek practical guides",
      source: "SERP analysis"
    }
  ];

  const getOpportunityColor = (opportunity: string) => {
    if (opportunity.toLowerCase().includes('high')) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (opportunity.toLowerCase().includes('medium')) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-pink-400" />
          <span className="text-sm font-medium text-white">Content Gap Analysis</span>
        </div>
        <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
          {contentGaps.length} gaps found
        </Badge>
      </div>

      <div className="space-y-4">
        {contentGaps.map((gap, idx) => (
          <div key={idx} className="bg-white/5 border border-pink-500/20 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white">{gap.topic}</h4>
                  <Badge variant="outline" className={getOpportunityColor(gap.opportunity || 'Medium')}>
                    {gap.opportunity || 'Medium opportunity'}
                  </Badge>
                </div>
                <p className="text-sm text-white/70 mb-2">{gap.description}</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Target className="h-3 w-3" />
                  <span>{gap.source}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToContent(gap.topic, 'contentGap')}
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-3 p-3 bg-pink-500/10 border border-pink-500/20 rounded-md">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-pink-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-pink-300">Recommendation:</span>
                  <p className="text-sm text-white/70 mt-1">{gap.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-pink-300 mb-3">🎯 Gap Analysis Strategy</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
          <div>
            <span className="font-medium text-white">High Opportunity:</span>
            <p>Focus on these gaps first - they offer the best chance to outrank competitors</p>
          </div>
          <div>
            <span className="font-medium text-white">Content Differentiation:</span>
            <p>Use these gaps to create unique value propositions in your content</p>
          </div>
          <div>
            <span className="font-medium text-white">User Intent:</span>
            <p>These gaps represent unmet user needs in the current search results</p>
          </div>
          <div>
            <span className="font-medium text-white">Competitive Advantage:</span>
            <p>Filling these gaps positions your content as more comprehensive</p>
          </div>
        </div>
      </div>
    </div>
  );
}
