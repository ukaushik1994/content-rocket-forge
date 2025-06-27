
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
  
  // Google-specific metadata
  const volumeMetadata = serpData.volumeMetadata || {};
  const competitionMetadata = serpData.competitionMetadata || {};
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

  const volumeIndicator = getDataQualityIndicator(dataQuality, volumeMetadata.source || '');
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Google Search Volume */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-400/30 transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <VolumeIcon className={`h-4 w-4 ${volumeIndicator.color} cursor-help`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Google Search Volume</p>
                    <p className="text-xs opacity-75">Source: {volumeIndicator.label}</p>
                    <p className="text-xs opacity-75">
                      {volumeMetadata.location || 'United States'} • {volumeMetadata.language || 'English'}
                    </p>
                    {volumeMetadata.lastUpdated && (
                      <p className="text-xs opacity-75">
                        Updated: {new Date(volumeMetadata.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs">
              Google Volume
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
                {searchVolume >= 1000000 ? 'High Google search volume' : 
                 searchVolume >= 100000 ? 'Medium Google search volume' : 
                 searchVolume >= 10000 ? 'Good Google search volume' : 'Google long-tail keyword'}
              </p>
            </div>
          </div>
        </div>

        {/* Google Ads Competition */}
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
                    <p className="font-medium">Google Ads Competition</p>
                    <p className="text-xs opacity-75">
                      {competitionMetadata.source === 'google_ads_competition' 
                        ? 'Google Ads Keyword Planner' 
                        : 'Estimated based on Google results'}
                    </p>
                    {competitionMetadata.adsCompetition && (
                      <p className="text-xs opacity-75">
                        Google Ads Level: {competitionMetadata.adsCompetition}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30 text-xs">
              Google Ads
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl font-bold text-orange-400">
              {(competition * 100).toFixed(0)}%
            </div>
            <div className="space-y-2">
              <Progress value={competition * 100} className="h-2 bg-orange-500/10" />
              <p className="text-xs text-orange-300/70">
                {competition > 0.7 ? 'High Google Ads competition' : 
                 competition > 0.4 ? 'Medium Google Ads competition' : 'Low Google Ads competition'}
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
                    <p className="font-medium">Google SEO Difficulty</p>
                    <p className="text-xs opacity-75">Ranking difficulty on Google SERP</p>
                    <p className="text-xs opacity-75">Based on Google organic competition</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30 text-xs">
              Google SEO
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl font-bold text-red-400">
              {difficulty}<span className="text-2xl text-red-400/60">/100</span>
            </div>
            <div className="space-y-2">
              <Progress value={difficulty} className="h-2 bg-red-500/10" />
              <p className="text-xs text-red-300/70">
                {difficulty > 70 ? 'Very difficult on Google' : 
                 difficulty > 40 ? 'Moderate Google difficulty' : 'Easy Google ranking'}
              </p>
            </div>
          </div>
        </div>

        {/* Google Opportunity Score */}
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
                    <p className="font-medium">Google Opportunity Score</p>
                    <p className="text-xs opacity-75">Combined Google metrics analysis</p>
                    <p className="text-xs opacity-75">Volume + Competition + Difficulty</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
              Google Score
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className={`text-4xl font-bold ${getScoreColor(opportunityScore)}`}>
              {opportunityScore.toFixed(0)}<span className="text-2xl opacity-60">/100</span>
            </div>
            <div className="space-y-2">
              <Progress value={opportunityScore} className="h-2 bg-purple-500/10" />
              <p className="text-xs text-purple-300/70">
                {opportunityScore > 70 ? 'Excellent Google opportunity' : 
                 opportunityScore > 40 ? 'Good Google opportunity' : 'Consider other keywords'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Strategic Insights */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
        <h5 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Google Strategic Insights
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <span className="font-medium text-white">Google Volume Analysis:</span>
            <p className="text-white/70 leading-relaxed">
              {volumeMetadata.source === 'google_keyword_planner' ? 
                'Verified Google Keyword Planner data shows accurate monthly search volume for strategic planning.' :
                volumeMetadata.source === 'google_search_results_estimate' ?
                'Estimated from Google search results - consider upgrading to Google Ads account for precise data.' :
                'Volume estimated from Google search patterns - verify with Google Keyword Planner for accuracy.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Google Competition Strategy:</span>
            <p className="text-white/70 leading-relaxed">
              {competitionMetadata.source === 'google_ads_competition' ?
                'Google Ads competition data indicates advertiser interest - factor into content and PPC strategy.' :
                'Competition estimated from Google organic results - monitor Google Ads activity for complete picture.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Google Ranking Feasibility:</span>
            <p className="text-white/70 leading-relaxed">
              {difficulty > 70 ? 'High Google ranking difficulty requires authoritative content and strong domain signals.' : 
                difficulty > 40 ? 'Moderate Google ranking difficulty - achievable with optimized, comprehensive content.' : 
                'Low Google ranking difficulty presents excellent opportunity for quick SERP visibility.'}
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-medium text-white">Google Action Plan:</span>
            <p className="text-white/70 leading-relaxed">
              {opportunityScore > 70 ? '🎯 Priority Google target - high volume with manageable competition for optimal ROI.' : 
                opportunityScore > 40 ? '✅ Solid Google opportunity - include in content strategy with focused optimization.' : 
                '⚠️ Limited Google potential - consider long-tail variations or alternative high-volume keywords.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
