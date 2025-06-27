
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Target, Zap, Info, CheckCircle, AlertTriangle } from 'lucide-react';
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
  
  // Google-specific metadata with proper defaults
  const volumeMetadata = serpData.volumeMetadata || {
    source: 'mock_google_estimate' as const,
    confidence: 'low' as const,
    engine: 'google' as const,
    location: 'United States',
    language: 'English',
    lastUpdated: new Date().toISOString()
  };
  
  const competitionMetadata = serpData.competitionMetadata || {
    source: 'mock_google_estimate' as const,
    engine: 'google' as const,
    adsCompetition: 'ESTIMATED' as const
  };
  
  const isGoogleData = serpData.isGoogleData || false;
  const dataQuality = serpData.dataQuality || 'low';
  
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

  const getDataQualityIndicator = (quality: string, source: string) => {
    if (quality === 'high' && source === 'google_keyword_planner') {
      return { icon: CheckCircle, color: 'text-green-500', label: 'Google Keyword Planner' };
    } else if (quality === 'medium' && source.includes('google')) {
      return { icon: AlertTriangle, color: 'text-yellow-500', label: 'Google Search Estimate' };
    } else {
      return { icon: Info, color: 'text-blue-500', label: 'Estimated Data' };
    }
  };

  const volumeIndicator = getDataQualityIndicator(dataQuality, volumeMetadata.source);
  const VolumeIcon = volumeIndicator.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Google Data Quality Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isGoogleData ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <h4 className="text-sm font-medium text-white">
                {isGoogleData ? 'Google Data Verified' : 'Mixed Data Sources'}
              </h4>
              <p className="text-xs text-white/70">
                {isGoogleData 
                  ? 'All metrics sourced from Google services' 
                  : 'Some data may be estimated or from alternative sources'
                }
              </p>
            </div>
          </div>
          <Badge className={`${isGoogleData ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
            {dataQuality.toUpperCase()} QUALITY
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Google Search Volume */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <VolumeIcon className={`h-3 w-3 ${volumeIndicator.color} cursor-help`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Google Search Volume</p>
                    <p className="text-xs opacity-75">Source: {volumeIndicator.label}</p>
                    <p className="text-xs opacity-75">
                      {volumeMetadata.location} • {volumeMetadata.language}
                    </p>
                    <p className="text-xs opacity-75">
                      Updated: {new Date(volumeMetadata.lastUpdated).toLocaleDateString()}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs px-2 py-0.5">
              Volume
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${getSearchVolumeColor(searchVolume)}`}>
              {formatNumber(searchVolume)}
            </div>
            <div className="space-y-1">
              <Progress 
                value={calculateSearchVolumeProgress(searchVolume)} 
                className="h-1.5 bg-blue-500/10" 
              />
              <p className="text-xs text-blue-300/70 leading-tight">
                {searchVolume >= 1000000 ? 'High volume' : 
                 searchVolume >= 100000 ? 'Medium volume' : 
                 searchVolume >= 10000 ? 'Good volume' : 'Long-tail'}
              </p>
            </div>
          </div>
        </div>

        {/* Google Ads Competition */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 hover:border-orange-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/20 rounded-lg">
                <Target className="h-4 w-4 text-orange-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-orange-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Google Ads Competition</p>
                    <p className="text-xs opacity-75">
                      {competitionMetadata.source === 'google_ads_competition' 
                        ? 'Google Ads Keyword Planner' 
                        : 'Estimated based on results'}
                    </p>
                    <p className="text-xs opacity-75">
                      Ads Level: {competitionMetadata.adsCompetition}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30 text-xs px-2 py-0.5">
              Ads
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-orange-400">
              {(competition * 100).toFixed(0)}%
            </div>
            <div className="space-y-1">
              <Progress value={competition * 100} className="h-1.5 bg-orange-500/10" />
              <p className="text-xs text-orange-300/70 leading-tight">
                {competition > 0.7 ? 'High competition' : 
                 competition > 0.4 ? 'Medium competition' : 'Low competition'}
              </p>
            </div>
          </div>
        </div>

        {/* SEO Difficulty */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4 hover:border-red-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-500/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-red-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">SEO Difficulty</p>
                    <p className="text-xs opacity-75">Ranking difficulty score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs px-2 py-0.5">
              SEO
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-red-400">
              {difficulty}<span className="text-lg text-red-400/60">/100</span>
            </div>
            <div className="space-y-1">
              <Progress value={difficulty} className="h-1.5 bg-red-500/10" />
              <p className="text-xs text-red-300/70 leading-tight">
                {difficulty > 70 ? 'Very difficult' : 
                 difficulty > 40 ? 'Moderate' : 'Easy ranking'}
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity Score */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${getScoreBgColor(opportunityScore)} border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/30 transition-all duration-200`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-purple-400/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Opportunity Score</p>
                    <p className="text-xs opacity-75">Combined metrics analysis</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs px-2 py-0.5">
              Score
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${getScoreColor(opportunityScore)}`}>
              {opportunityScore.toFixed(0)}<span className="text-lg opacity-60">/100</span>
            </div>
            <div className="space-y-1">
              <Progress value={opportunityScore} className="h-1.5 bg-purple-500/10" />
              <p className="text-xs text-purple-300/70 leading-tight">
                {opportunityScore > 70 ? 'Excellent' : 
                 opportunityScore > 40 ? 'Good opportunity' : 'Consider alternatives'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
        <h5 className="text-base font-semibold text-purple-300 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Strategic Insights
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="font-medium text-white">Volume Analysis:</span>
            <p className="text-white/70 leading-relaxed text-xs">
              {volumeMetadata.source === 'google_keyword_planner' ? 
                'Verified Google Keyword Planner data for accurate planning.' :
                'Estimated data - consider Google Ads account for precision.'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-white">Competition Strategy:</span>
            <p className="text-white/70 leading-relaxed text-xs">
              {competitionMetadata.source === 'google_ads_competition' ?
                'Google Ads competition indicates advertiser interest.' :
                'Competition estimated - monitor ads activity.'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-white">Ranking Feasibility:</span>
            <p className="text-white/70 leading-relaxed text-xs">
              {difficulty > 70 ? 'High difficulty requires authoritative content.' : 
                difficulty > 40 ? 'Moderate difficulty - achievable with optimization.' : 
                'Low difficulty presents excellent opportunity.'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-medium text-white">Action Plan:</span>
            <p className="text-white/70 leading-relaxed text-xs">
              {opportunityScore > 70 ? '🎯 Priority target - high ROI potential.' : 
                opportunityScore > 40 ? '✅ Solid opportunity for content strategy.' : 
                '⚠️ Consider alternatives or long-tail variations.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
