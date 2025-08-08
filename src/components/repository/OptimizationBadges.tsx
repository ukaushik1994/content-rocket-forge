import React from 'react';
import { CustomBadge } from '@/components/ui/custom-badge';
import { 
  Search, 
  Brain, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

interface OptimizationBadgesProps {
  metadata?: any;
}

export const OptimizationBadges: React.FC<OptimizationBadgesProps> = ({ metadata }) => {
  if (!metadata) return null;

  const optimizationData = metadata.optimizationMetadata;
  const seoScore = metadata.seoScore || 0;
  const serpData = metadata.selectionStats;

  const badges = [];

  // SEO Score Badge
  if (seoScore > 0) {
    const getSeoColor = (score: number) => {
      if (score >= 80) return 'bg-green-500/20 text-green-700 border-green-500/30';
      if (score >= 60) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      return 'bg-red-500/20 text-red-700 border-red-500/30';
    };

    badges.push(
      <CustomBadge key="seo" className={`text-xs flex items-center gap-1 ${getSeoColor(seoScore)}`}>
        <Search className="h-3 w-3" />
        SEO {seoScore}
      </CustomBadge>
    );
  }

  // AI Content Detection
  if (optimizationData?.aiDetection?.isAIContent) {
    badges.push(
      <CustomBadge key="ai" className="text-xs bg-orange-500/20 text-orange-700 border-orange-500/30 flex items-center gap-1">
        <Brain className="h-3 w-3" />
        {optimizationData.aiDetection.humanizationRequired ? 'AI Detected' : 'AI Optimized'}
      </CustomBadge>
    );
  }

  // SERP Integration
  if (serpData?.totalSelected > 0) {
    badges.push(
      <CustomBadge key="serp" className="text-xs bg-blue-500/20 text-blue-700 border-blue-500/30 flex items-center gap-1">
        <Database className="h-3 w-3" />
        {serpData.totalSelected} SERP items
      </CustomBadge>
    );
  }

  // Content Quality Completion
  if (optimizationData?.qualityMetrics?.completionPercentage > 0) {
    const completionPercentage = optimizationData.qualityMetrics.completionPercentage;
    const getQualityColor = (percentage: number) => {
      if (percentage >= 90) return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      if (percentage >= 70) return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    };

    badges.push(
      <CustomBadge key="quality" className={`text-xs flex items-center gap-1 ${getQualityColor(completionPercentage)}`}>
        {completionPercentage >= 90 ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <Target className="h-3 w-3" />
        )}
        {completionPercentage}% complete
      </CustomBadge>
    );
  }

  // Optimization Suggestions Count
  const totalSuggestions = 
    (optimizationData?.contentAnalysis?.suggestions?.length || 0) +
    (optimizationData?.solutionAnalysis?.suggestions?.length || 0) +
    (optimizationData?.aiDetection?.suggestions?.length || 0) +
    (optimizationData?.serpIntegration?.suggestions?.length || 0);

  if (totalSuggestions > 0) {
    badges.push(
      <CustomBadge key="suggestions" className="text-xs bg-amber-500/20 text-amber-700 border-amber-500/30 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {totalSuggestions} suggestions
      </CustomBadge>
    );
  }

  // Keywords Count
  if (metadata.secondaryKeywords?.length > 0) {
    badges.push(
      <CustomBadge key="keywords" className="text-xs bg-purple-500/20 text-purple-700 border-purple-500/30 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {metadata.secondaryKeywords.length + 1} keywords
      </CustomBadge>
    );
  }

  // Enhanced Features (if any premium optimizations were applied)
  if (optimizationData?.solutionAnalysis?.integrationScore > 80 || 
      seoScore > 80 || 
      optimizationData?.qualityMetrics?.completionPercentage > 90) {
    badges.push(
      <CustomBadge key="optimized" className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 border-purple-500/30 flex items-center gap-1">
        <Zap className="h-3 w-3" />
        Optimized
      </CustomBadge>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.slice(0, 4)} {/* Limit to 4 badges to prevent overflow */}
      {badges.length > 4 && (
        <CustomBadge className="text-xs bg-muted/50 text-muted-foreground">
          +{badges.length - 4}
        </CustomBadge>
      )}
    </div>
  );
};