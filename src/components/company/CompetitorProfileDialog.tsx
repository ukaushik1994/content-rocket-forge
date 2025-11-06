import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { Progress } from '@/components/ui/progress';
import { CompanyCompetitor } from '@/contexts/content-builder/types/company-types';
import { Building2, Link as LinkIcon, TrendingUp, TrendingDown, Package, Edit2, Target, Globe, ExternalLink, Download, Lightbulb, Brain, CheckCircle2, Star, AlertTriangle, Calendar, RefreshCw, Share2, FileText, Briefcase, Megaphone, BarChart3, TrendingUp as TrendingUpIcon, Shield, Zap, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshButton } from '@/components/ui/refresh-button';
import { CompetitorSolutionsTab } from './CompetitorSolutionsTab';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { 
  QualityMetricsBadge, 
  CompanyIntelligenceCard, 
  PricingIntelligenceCard, 
  ProductIntelligenceCard, 
  TargetMarketCard, 
  SocialProofCard, 
  CompetitiveDifferentiationCard,
  MarketInsightsCard 
} from './intelligence';
import React from 'react';
import { generateCompetitorSWOT } from '@/services/competitorSwotService';
import { generateCompetitorOverview } from '@/services/competitorOverviewService';
import { getCompetitorSolutions } from '@/services/competitorSolutionsService';
import { supabase } from '@/integrations/supabase/client';

interface CompetitorProfileDialogProps {
  competitor: CompanyCompetitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (competitor: CompanyCompetitor) => void;
  onRefreshIntelligence?: (competitorId: string, website: string) => Promise<void>;
}

export function CompetitorProfileDialog({
  competitor,
  open,
  onOpenChange,
  onEdit,
  onRefreshIntelligence
}: CompetitorProfileDialogProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [solutions, setSolutions] = React.useState<any[]>([]);
  const [localCompetitor, setLocalCompetitor] = React.useState(competitor);

  React.useEffect(() => {
    setLocalCompetitor(competitor);
  }, [competitor]);

  React.useEffect(() => {
    if (open && competitor.id) {
      loadSolutions();
    }
  }, [open, competitor.id]);

  const loadSolutions = async () => {
    try {
      const sols = await getCompetitorSolutions(competitor.id);
      setSolutions(sols);
    } catch (error) {
      console.error('Failed to load solutions:', error);
    }
  };

  const handleRefresh = async () => {
    if (!competitor.website || !onRefreshIntelligence) return;
    
    setIsRefreshing(true);
    try {
      await onRefreshIntelligence(competitor.id, competitor.website);
      toast.success('Intelligence data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh intelligence:', error);
      toast.error('Failed to refresh intelligence data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateSWOT = async () => {
    setIsAnalyzing(true);
    try {
      // Get user context
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [companyInfoResponse, userSolutionsResponse] = await Promise.all([
        supabase
          .from('company_info')
          .select('name, industry, mission, description')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('solutions')
          .select('name, category, features, pain_points, target_audience')
          .eq('user_id', user.id)
      ]);

      const swot = await generateCompetitorSWOT(
        localCompetitor.id,
        localCompetitor.name,
        {
          description: localCompetitor.description || undefined,
          intelligenceData: localCompetitor.intelligenceData,
          strengths: localCompetitor.strengths,
          weaknesses: localCompetitor.weaknesses,
          solutions
        },
        user.id,
        companyInfoResponse.data,
        userSolutionsResponse.data || []
      );

      if (swot) {
        setLocalCompetitor(prev => ({ ...prev, swotAnalysis: swot }));
        toast.success('SWOT analysis generated successfully');
      } else {
        toast.error('Failed to generate SWOT analysis');
      }
    } catch (error: any) {
      console.error('SWOT generation error:', error);
      toast.error(error.message || 'Failed to generate SWOT analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateOverview = async () => {
    setIsAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: companyInfo } = await supabase
        .from('company_info')
        .select('name, industry')
        .eq('user_id', user.id)
        .maybeSingle();

      const overview = await generateCompetitorOverview(
        localCompetitor.id,
        localCompetitor.name,
        {
          description: localCompetitor.description || undefined,
          website: localCompetitor.website || undefined,
          intelligenceData: localCompetitor.intelligenceData,
          strengths: localCompetitor.strengths,
          weaknesses: localCompetitor.weaknesses,
          solutions,
          swotAnalysis: localCompetitor.swotAnalysis
        },
        user.id,
        companyInfo
      );

      if (overview) {
        setLocalCompetitor(prev => ({ ...prev, overview }));
        toast.success('Overview generated successfully');
      } else {
        toast.error('Failed to generate overview');
      }
    } catch (error: any) {
      console.error('Overview generation error:', error);
      toast.error(error.message || 'Failed to generate overview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper: Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'website':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'social_media':
        return <Share2 className="w-4 h-4 text-purple-500" />;
      case 'documentation':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'case_studies':
        return <Briefcase className="w-4 h-4 text-orange-500" />;
      case 'marketing':
        return <Megaphone className="w-4 h-4 text-pink-500" />;
      default:
        return <LinkIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper: Group resources by category
  const resourcesByCategory = localCompetitor.resources.reduce((acc, resource) => {
    const category = resource.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, typeof localCompetitor.resources>);

  // Handler: Export profile
  const handleExportProfile = () => {
    const exportData = {
      name: localCompetitor.name,
      website: localCompetitor.website,
      marketPosition: localCompetitor.marketPosition,
      description: localCompetitor.description,
      strengths: localCompetitor.strengths,
      weaknesses: localCompetitor.weaknesses,
      resources: localCompetitor.resources,
      notes: localCompetitor.notes,
      overview: localCompetitor.overview,
      swotAnalysis: localCompetitor.swotAnalysis,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${localCompetitor.name.replace(/[^a-z0-9]/gi, '_')}_profile_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile exported successfully');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'strength': return 'default';
      case 'weakness': return 'destructive';
      case 'opportunity': return 'secondary';
      case 'threat': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-w-7xl max-h-[90vh] overflow-hidden flex flex-col shadow-neon rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl">
        <DialogHeader className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 pb-4">
          <div className="flex items-start gap-4">
            {localCompetitor.logoUrl ? (
              <img src={localCompetitor.logoUrl} alt={localCompetitor.name} className="w-16 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{localCompetitor.name}</DialogTitle>
                  {localCompetitor.marketPosition && (
                    <p className="text-sm text-muted-foreground mt-1">{localCompetitor.marketPosition}</p>
                  )}
                  {localCompetitor.website && (
                    <a
                      href={localCompetitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {localCompetitor.website}
                    </a>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    {localCompetitor.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Added {formatDistanceToNow(new Date(localCompetitor.createdAt), { addSuffix: true })}
                      </div>
                    )}
                    {localCompetitor.updatedAt && (
                      <div className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Updated {formatDistanceToNow(new Date(localCompetitor.updatedAt), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {localCompetitor.qualityMetrics && (
                    <QualityMetricsBadge metrics={localCompetitor.qualityMetrics} />
                  )}
                  {localCompetitor.website && onRefreshIntelligence && (
                    <RefreshButton
                      isRefreshing={isRefreshing}
                      onClick={handleRefresh}
                      size="sm"
                      variant="outline"
                    >
                      Refresh
                    </RefreshButton>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(localCompetitor);
                      onOpenChange(false);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* OVERVIEW TAB - AI-POWERED */}
            <TabsContent value="overview" className="space-y-6 m-0 p-6">
              {localCompetitor.overview ? (
                <>
                  {/* Executive Summary */}
                  <GlassCard className="shadow-xl border-primary/30">
                    <div className="p-6">
                      <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Brain className="h-5 w-5 text-primary" />
                        Executive Summary
                      </h3>
                      <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                        {localCompetitor.overview.executiveSummary.split('\n\n').map((para, i) => (
                          <p key={i} className="mb-3">{para}</p>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-4 gap-4">
                    <GlassCard className="p-4 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">Market Position</span>
                      </div>
                      <div className="text-3xl font-bold">{localCompetitor.overview.keyMetrics.marketPositionScore}</div>
                      <Progress value={localCompetitor.overview.keyMetrics.marketPositionScore} className="h-2 mt-2" />
                    </GlassCard>

                    <GlassCard className="p-4 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium">Innovation</span>
                      </div>
                      <div className="text-3xl font-bold">{localCompetitor.overview.keyMetrics.innovationScore}</div>
                      <Progress value={localCompetitor.overview.keyMetrics.innovationScore} className="h-2 mt-2 [&>div]:bg-purple-500" />
                    </GlassCard>

                    <GlassCard className="p-4 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium">Threat Level</span>
                      </div>
                      <div className="text-3xl font-bold">{localCompetitor.overview.keyMetrics.threatLevel}</div>
                      <Progress value={localCompetitor.overview.keyMetrics.threatLevel} className="h-2 mt-2 [&>div]:bg-red-500" />
                    </GlassCard>

                    <GlassCard className="p-4 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium">Pricing Edge</span>
                      </div>
                      <div className="text-3xl font-bold">{localCompetitor.overview.keyMetrics.pricingCompetitiveness}</div>
                      <Progress value={localCompetitor.overview.keyMetrics.pricingCompetitiveness} className="h-2 mt-2 [&>div]:bg-green-500" />
                    </GlassCard>
                  </div>

                  {/* Competitive Positioning */}
                  <GlassCard className="shadow-xl">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <Target className="h-5 w-5" />
                        Competitive Positioning
                      </h3>
                      <p className="text-muted-foreground">{localCompetitor.overview.competitivePositioning}</p>
                    </div>
                  </GlassCard>

                  {/* Top Insights */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Top Strategic Insights
                    </h3>
                    <div className="grid gap-3">
                      {localCompetitor.overview.topInsights.map((insight, idx) => (
                        <GlassCard key={idx} className={`p-4 ${
                          insight.category === 'strength' ? 'border-green-500/30 bg-gradient-to-r from-green-500/10 to-transparent' :
                          insight.category === 'weakness' ? 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent' :
                          insight.category === 'opportunity' ? 'border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent' :
                          insight.category === 'threat' ? 'border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-transparent' :
                          'border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-transparent'
                        }`}>
                          <div className="flex items-start gap-3">
                            <Badge variant={getCategoryBadgeVariant(insight.category)} className="capitalize mt-0.5">
                              {insight.category}
                            </Badge>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1 flex items-center gap-2">
                                {insight.title}
                                <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                                  {insight.priority}
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <GlassCard className="shadow-xl border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Recommended Actions
                      </h3>
                      <ul className="space-y-3">
                        {localCompetitor.overview.recommendedActions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                            <span className="text-green-500 font-bold">{idx + 1}.</span>
                            <span className="text-sm flex-1">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>

                  {/* Market Context */}
                  {localCompetitor.overview.marketContext && (
                    <GlassCard className="shadow-lg">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-3">Market Context</h3>
                        <p className="text-sm text-muted-foreground">{localCompetitor.overview.marketContext}</p>
                      </div>
                    </GlassCard>
                  )}
                </>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AI Overview Not Generated</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate a comprehensive AI-powered overview with executive summary, key metrics, and strategic insights.
                  </p>
                  <Button onClick={handleGenerateOverview} disabled={isAnalyzing} size="lg">
                    {isAnalyzing ? 'Generating...' : 'Generate AI Overview'}
                  </Button>
                </GlassCard>
              )}
            </TabsContent>

            {/* INTELLIGENCE TAB */}
            <TabsContent value="intelligence" className="m-0 p-6">
              {localCompetitor.intelligenceData ? (
                <div className="grid gap-6">
                  <CompanyIntelligenceCard data={localCompetitor.intelligenceData} />
                  <PricingIntelligenceCard data={localCompetitor.intelligenceData} />
                  <ProductIntelligenceCard data={localCompetitor.intelligenceData} />
                  <TargetMarketCard data={localCompetitor.intelligenceData} />
                  <SocialProofCard data={localCompetitor.intelligenceData} />
                  <CompetitiveDifferentiationCard data={localCompetitor.intelligenceData} />
                  <MarketInsightsCard data={localCompetitor.intelligenceData} />
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Intelligence Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Enhanced intelligence data is not available for this competitor yet.
                  </p>
                  <Button variant="outline" onClick={() => onEdit(localCompetitor)}>
                    Run Auto-Fill Analysis
                  </Button>
                </GlassCard>
              )}
            </TabsContent>

            {/* SOLUTIONS TAB */}
            <TabsContent value="solutions" className="m-0 p-6">
              <CompetitorSolutionsTab competitor={localCompetitor} />
            </TabsContent>

            {/* ANALYSIS TAB - COMPLETE SWOT */}
            <TabsContent value="analysis" className="m-0 p-6">
              {localCompetitor.swotAnalysis ? (
                <div className="space-y-6">
                  {/* Competitive Score & Positioning */}
                  <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="p-6 shadow-xl border-primary/30">
                      <h4 className="text-sm font-medium mb-2">Competitive Strength Score</h4>
                      <div className="text-4xl font-bold mb-3">{localCompetitor.swotAnalysis.competitiveScore}/100</div>
                      <Progress value={localCompetitor.swotAnalysis.competitiveScore} className="h-3 mb-3" />
                      <Badge variant="outline" className="text-xs">{localCompetitor.swotAnalysis.positioning}</Badge>
                    </GlassCard>

                    <GlassCard className="p-6 shadow-xl">
                      <h4 className="text-sm font-medium mb-3">Positioning Analysis</h4>
                      <p className="text-sm text-muted-foreground">{localCompetitor.swotAnalysis.positioningRationale}</p>
                    </GlassCard>
                  </div>

                  {/* SWOT Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Strengths */}
                    <GlassCard className="p-5 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent shadow-xl">
                      <h4 className="font-semibold text-green-500 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Strengths ({localCompetitor.swotAnalysis.strengths.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {localCompetitor.swotAnalysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 p-2 rounded bg-background/30">
                            <span className="text-green-500 font-bold">+</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Weaknesses */}
                    <GlassCard className="p-5 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent shadow-xl">
                      <h4 className="font-semibold text-red-500 mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        Weaknesses ({localCompetitor.swotAnalysis.weaknesses.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {localCompetitor.swotAnalysis.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 p-2 rounded bg-background/30">
                            <span className="text-red-500 font-bold">−</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Opportunities */}
                    <GlassCard className="p-5 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-transparent shadow-xl">
                      <h4 className="font-semibold text-blue-500 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Opportunities ({localCompetitor.swotAnalysis.opportunities.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {localCompetitor.swotAnalysis.opportunities.map((o, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 p-2 rounded bg-background/30">
                            <span className="text-blue-500 font-bold">◆</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>

                    {/* Threats */}
                    <GlassCard className="p-5 border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-transparent shadow-xl">
                      <h4 className="font-semibold text-orange-500 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Threats ({localCompetitor.swotAnalysis.threats.length})
                      </h4>
                      <ul className="space-y-2.5">
                        {localCompetitor.swotAnalysis.threats.map((t, i) => (
                          <li key={i} className="text-sm flex items-start gap-2 p-2 rounded bg-background/30">
                            <span className="text-orange-500 font-bold">⚠</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  </div>

                  {/* Strategic Recommendations */}
                  <GlassCard className="shadow-xl border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-purple-500" />
                        Strategic Recommendations
                      </h3>
                      <ul className="space-y-3">
                        {localCompetitor.swotAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                            <CheckCircle2 className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>

                  {/* Market Context */}
                  {localCompetitor.swotAnalysis.marketContext && (
                    <GlassCard className="shadow-lg">
                      <div className="p-6">
                        <h3 className="text-lg font-semibold mb-3">Market Context</h3>
                        <p className="text-sm text-muted-foreground">{localCompetitor.swotAnalysis.marketContext}</p>
                      </div>
                    </GlassCard>
                  )}
                </div>
              ) : (
                <GlassCard className="p-12 text-center">
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Complete SWOT Analysis Not Generated</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Generate a comprehensive SWOT analysis with Opportunities and Threats, competitive scoring, positioning analysis, and strategic recommendations.
                  </p>
                  <Button onClick={handleGenerateSWOT} disabled={isAnalyzing} size="lg">
                    {isAnalyzing ? 'Analyzing...' : 'Generate SWOT Analysis'}
                  </Button>
                </GlassCard>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
