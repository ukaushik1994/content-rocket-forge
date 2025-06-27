
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Zap, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, calculateSearchVolumeProgress, getSearchVolumeColor } from '@/utils/numberFormatting';

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
    (searchVolume / 1000000) * 0.4 + 
    (100 - competition * 100) * 0.3 + 
    (100 - difficulty) * 0.3
  ));

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'from-green-500/20 to-green-600/10';
    if (score >= 40) return 'from-yellow-500/20 to-yellow-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Search Volume */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Monthly estimated searches</p>
                    <p className="text-xs opacity-75">Source: {serpData.isMockData ? 'Mock Data' : 'Live SERP API'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
              Volume
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className={`text-4xl font-bold ${getSearchVolumeColor(searchVolume)}`}>
              {formatNumber(searchVolume)}
            </div>
            <div className="space-y-2">
              <Progress 
                value={calculateSearchVolumeProgress(searchVolume)} 
                className="h-2 bg-blue-500/10" 
              />
              <p className="text-xs text-blue-300/70">
                {searchVolume >= 1000000 ? 'High volume keyword' : 
                 searchVolume >= 100000 ? 'Medium volume keyword' : 
                 searchVolume >= 10000 ? 'Good volume keyword' : 'Long-tail keyword'}
              </p>
            </div>
          </div>
        </div>

        {/* Competition Score */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 hover:border-orange-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="h-5 w-5 text-orange-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-orange-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Advertiser competition level</p>
                    <p className="text-xs opacity-75">Higher = more competitive</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30 text-xs">
              Competition
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl font-bold text-orange-400">
              {(competition * 100).toFixed(0)}%
            </div>
            <div className="space-y-2">
              <Progress value={competition * 100} className="h-2 bg-orange-500/10" />
              <p className="text-xs text-orange-300/70">
                {competition > 0.7 ? 'High competition' : 
                 competition > 0.4 ? 'Medium competition' : 'Low competition'}
              </p>
            </div>
          </div>
        </div>

        {/* SEO Difficulty */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6 hover:border-red-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-red-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>SEO ranking difficulty estimate</p>
                    <p className="text-xs opacity-75">0-100 scale</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs">
              Difficulty
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl font-bold text-red-400">
              {difficulty}<span className="text-2xl text-red-400/60">/100</span>
            </div>
            <div className="space-y-2">
              <Progress value={difficulty} className="h-2 bg-red-500/10" />
              <p className="text-xs text-red-300/70">
                {difficulty > 70 ? 'Very difficult' : 
                 difficulty > 40 ? 'Moderate difficulty' : 'Easy to rank'}
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity Score */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${getScoreBgColor(opportunityScore)} border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/30 transition-all duration-200`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-purple-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall content opportunity score</p>
                    <p className="text-xs opacity-75">Based on volume, competition & difficulty</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
              Opportunity
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className={`text-4xl font-bold ${getScoreColor(opportunityScore)}`}>
              {opportunityScore.toFixed(0)}<span className="text-2xl opacity-60">/100</span>
            </div>
            <div className="space-y-2">
              <Progress value={opportunityScore} className="h-2 bg-purple-500/10" />
              <p className="text-xs text-purple-300/70">
                {opportunityScore > 70 ? 'Excellent opportunity' : 
                 opportunityScore > 40 ? 'Good opportunity' : 'Consider alternatives'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
        <h5 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Strategic Insights
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <span className="font-medium text-white">Volume Assessment:</span>
            <p className="text-white/70 leading-relaxed">
              {searchVolume > 1000000 ? 'High-volume keyword with significant traffic potential - worth the investment in comprehensive content.' : 
                searchVolume > 100000 ? 'Medium-volume keyword offering good traffic opportunity with manageable competition.' : 
                searchVolume > 10000 ? 'Solid volume keyword - good balance of traffic potential and ranking feasibility.' :
                'Long-tail keyword - easier to rank with targeted, niche traffic potential.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Competition Strategy:</span>
            <p className="text-white/70 leading-relaxed">
              {competition > 0.7 ? 'High competition requires comprehensive content strategy and strong domain authority.' : 
                competition > 0.4 ? 'Medium competition - focus on unique angles and quality content differentiation.' : 
                'Low competition presents excellent opportunity for quick ranking wins.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Ranking Feasibility:</span>
            <p className="text-white/70 leading-relaxed">
              {difficulty > 70 ? 'High difficulty - requires strong domain authority and exceptional content quality.' : 
                difficulty > 40 ? 'Medium difficulty - achievable with well-optimized, comprehensive content.' : 
                'Low difficulty - excellent target for new content with high success probability.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Action Recommendation:</span>
            <p className="text-white/70 leading-relaxed">
              {opportunityScore > 70 ? '🎯 Excellent target - prioritize this keyword in your content strategy.' : 
                opportunityScore > 40 ? '✅ Good target - include in your content plan with focused optimization.' : 
                '⚠️ Consider alternatives - low opportunity score suggests better keywords may exist.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
