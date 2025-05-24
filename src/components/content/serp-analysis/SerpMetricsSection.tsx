
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';

interface SerpMetricsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpMetricsSection({ serpData, expanded, onAddToContent }: SerpMetricsSectionProps) {
  if (!expanded) return null;

  const searchVolume = serpData.searchVolume || 0;
  const competition = serpData.competitionScore || 0;
  const difficulty = serpData.keywordDifficulty || 0;
  
  // Calculate opportunity score
  const opportunityScore = Math.max(0, Math.min(100, 
    (searchVolume / 1000) * 0.4 + 
    (100 - competition * 100) * 0.3 + 
    (100 - difficulty) * 0.3
  ));

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Volume */}
        <div className="bg-white/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Search Volume</span>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              {searchVolume.toLocaleString()}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={Math.min(100, searchVolume / 100)} className="h-2" />
            <p className="text-xs text-white/60">Monthly estimated searches</p>
          </div>
        </div>

        {/* Competition Score */}
        <div className="bg-white/5 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Competition</span>
            </div>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
              {(competition * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={competition * 100} className="h-2" />
            <p className="text-xs text-white/60">Advertiser competition level</p>
          </div>
        </div>

        {/* Keyword Difficulty */}
        <div className="bg-white/5 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-white">SEO Difficulty</span>
            </div>
            <Badge variant="secondary" className="bg-red-500/20 text-red-300">
              {difficulty}/100
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={difficulty} className="h-2" />
            <p className="text-xs text-white/60">Ranking difficulty estimate</p>
          </div>
        </div>

        {/* Opportunity Score */}
        <div className="bg-white/5 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Opportunity</span>
            </div>
            <Badge variant="secondary" className={`${getScoreColor(opportunityScore)} bg-purple-500/20`}>
              {opportunityScore.toFixed(0)}/100
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={opportunityScore} className="h-2" />
            <p className="text-xs text-white/60">Overall content opportunity</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <h5 className="text-sm font-medium text-purple-300 mb-3">📊 Strategic Insights</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
          <div>
            <span className="font-medium text-white">Volume Assessment:</span>
            <p>{searchVolume > 5000 ? 'High-volume keyword - significant traffic potential' : 
                searchVolume > 1000 ? 'Medium-volume keyword - good traffic opportunity' : 
                'Long-tail keyword - easier to rank, niche traffic'}</p>
          </div>
          <div>
            <span className="font-medium text-white">Competition Level:</span>
            <p>{competition > 0.7 ? 'High competition - invest in comprehensive content' : 
                competition > 0.4 ? 'Medium competition - focus on unique angles' : 
                'Low competition - great opportunity for quick wins'}</p>
          </div>
          <div>
            <span className="font-medium text-white">Difficulty Analysis:</span>
            <p>{difficulty > 70 ? 'High difficulty - requires strong domain authority' : 
                difficulty > 40 ? 'Medium difficulty - achievable with quality content' : 
                'Low difficulty - good target for new content'}</p>
          </div>
          <div>
            <span className="font-medium text-white">Recommendation:</span>
            <p>{opportunityScore > 70 ? 'Excellent target - prioritize this keyword' : 
                opportunityScore > 40 ? 'Good target - include in content plan' : 
                'Consider alternatives - low opportunity score'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
