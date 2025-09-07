import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  Calendar,
  FileText,
  Book,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';
import { useNavigate } from 'react-router-dom';
import { opportunityHunterService } from '@/services/opportunityHunterService';
import { aiStrategyService } from '@/services/aiStrategyService';
import { ContentOpportunitiesIndicator } from './ContentOpportunitiesIndicator';
import { NextBestMoveIndicator } from './NextBestMoveIndicator';
import { EnhancedOpportunitiesDisplay } from './EnhancedOpportunitiesDisplay';

interface DashboardSummaryData {
  content_created: {
    glossary: number;
    blog: number;
    article: number;
    strategy: number;
  };
  top_performer?: {
    title: string;
    views: number;
    type: string;
    url: string;
    growth: number;
  };
  progress: {
    goal: {
      blog: number;
      glossary: number;
      article: number;
      strategy: number;
    };
    achieved: {
      blog: number;
      glossary: number;
      article: number;
      strategy: number;
    };
    percentage: number;
  };
  next_moves: Array<{
    cluster: string;
    type: string;
    volume: number;
    priority: string;
    cta: string;
  }>;
  encouragement: string;
  alerts: Array<{
    id: string;
    message: string;
    category: 'info' | 'warning' | 'success' | 'error';
    action_url?: string;
    action_label?: string;
  }>;
  month: string;
}

export const DashboardSummary = () => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [aiStrategies, setAiStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const context = useContentStrategyOptional();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      // Fetch dashboard summary, opportunities, and AI strategies in parallel
      const [dashboardResponse, opportunitiesData, aiStrategiesData] = await Promise.all([
        supabase.functions.invoke('dashboard-summary'),
        opportunityHunterService.getOpportunities().catch(() => []),
        aiStrategyService.getStrategies().catch(() => [])
      ]);
      
      if (dashboardResponse.error) throw dashboardResponse.error;
      
      setData(dashboardResponse.data);
      setOpportunities(opportunitiesData || []);
      setAiStrategies(aiStrategiesData || []);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'glossary': return <Book className="w-4 h-4" />;
      case 'strategy': return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getOpportunityTypeIcon = (type: 'opportunity' | 'ai-strategy' | 'dashboard') => {
    switch (type) {
      case 'opportunity': return <Target className="w-3 h-3" />;
      case 'ai-strategy': return <Zap className="w-3 h-3" />;
      case 'dashboard': return <Lightbulb className="w-3 h-3" />;
      default: return <Lightbulb className="w-3 h-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-white/60';
    }
  };

  const handleOpportunityClick = (item: any, type: 'opportunity' | 'ai-strategy' | 'dashboard') => {
    switch (type) {
      case 'opportunity':
        navigate('/research/opportunity-hunter');
        break;
      case 'ai-strategy':
        navigate('/research/content-strategy#strategies');
        break;
      case 'dashboard':
        // Handle existing dashboard moves
        break;
    }
  };

  // Combine all opportunities for the carousel
  const combinedOpportunities = React.useMemo(() => {
    const combined = [];

    // Add opportunities from Opportunity Hunter
    opportunities.forEach(opp => {
      combined.push({
        ...opp,
        type: 'opportunity' as const,
        title: opp.keyword || opp.title,
        description: opp.description || `Content opportunity for "${opp.keyword}"`,
        keywords: opp.related_keywords ? [opp.keyword, ...opp.related_keywords.slice(0, 4)] : [opp.keyword],
        volume: opp.search_volume,
        difficulty: opp.keyword_difficulty,
        priority: opp.priority,
        content_format: opp.content_format,
        cta: 'Explore Opportunity',
        createdAt: opp.created_at
      });
    });

    // Add AI strategy proposals
    aiStrategies.forEach(strategy => {
      strategy.proposals?.forEach((proposal: any) => {
        // Ensure keywords are always strings, not objects
        const normalizedKeywords = proposal.keywords ? 
          proposal.keywords.map((k: any) => typeof k === 'string' ? k : k.keyword || String(k)) : 
          [];
        
        combined.push({
          ...proposal,
          type: 'ai-strategy' as const,
          title: proposal.title,
          description: proposal.description,
          keywords: normalizedKeywords,
          volume: proposal.search_volume || proposal.estimatedImpressions,
          priority: proposal.priority,
          cta: 'Use Strategy',
          createdAt: strategy.created_at
        });
      });
    });

    // Add dashboard next moves
    data?.next_moves?.forEach(move => {
      combined.push({
        ...move,
        type: 'dashboard' as const,
        title: move.cluster,
        keywords: [move.cluster],
        volume: move.volume,
        priority: move.priority,
        content_format: move.type,
        cta: move.cta,
        createdAt: data.month
      });
    });

    return combined;
  }, [opportunities, aiStrategies, data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-neon-purple/20 via-neon-blue/15 to-transparent blur-[100px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-gradient-to-l from-neon-pink/15 via-neon-purple/10 to-transparent blur-[80px]"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {data.alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Alert 
                variant={alert.category === 'error' ? 'destructive' : 'default'}
                className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-neon-blue">
                  {getAlertIcon(alert.category)}
                </div>
                <AlertDescription className="flex justify-between items-center text-white/90">
                  <span>{alert.message}</span>
                  {alert.action_url && alert.action_label && (
                    <Button variant="outline" size="sm" asChild className="border-white/20 bg-white/10 hover:bg-white/20 text-white">
                      <a href={alert.action_url}>
                        {alert.action_label}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { 
            type: 'blog', 
            label: 'Blog Posts', 
            current: data.content_created.blog, 
            goal: data.progress.goal.blog,
            icon: FileText,
            gradient: 'from-neon-blue/20 to-cyan-400/20',
            iconColor: 'text-neon-blue'
          },
          { 
            type: 'article', 
            label: 'Articles', 
            current: data.content_created.article, 
            goal: data.progress.goal.article,
            icon: FileText,
            gradient: 'from-neon-purple/20 to-purple-400/20',
            iconColor: 'text-neon-purple'
          },
          { 
            type: 'glossary', 
            label: 'Glossary Terms', 
            current: data.content_created.glossary, 
            goal: data.progress.goal.glossary,
            icon: Book,
            gradient: 'from-neon-pink/20 to-pink-400/20',
            iconColor: 'text-neon-pink'
          },
          { 
            type: 'overall', 
            label: 'Overall Progress', 
            current: data.progress.percentage, 
            goal: 100,
            icon: Target,
            gradient: 'from-emerald-400/20 to-green-400/20',
            iconColor: 'text-emerald-400',
            isPercentage: true
          }
        ].map((item, index) => (
          <motion.div
            key={item.type}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-1">{item.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {item.isPercentage ? `${item.current}%` : `${item.current}/${item.goal}`}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 ${item.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={item.isPercentage ? item.current : (item.current / Math.max(item.goal, 1)) * 100}
                    className="h-2 bg-white/20"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>{item.isPercentage ? 'Complete' : 'Progress'}</span>
                    <span>{item.isPercentage ? item.current : Math.round((item.current / Math.max(item.goal, 1)) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Opportunities Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Content Opportunities Indicator */}
        <ContentOpportunitiesIndicator />
        
        {/* Next Best Move Indicator */}
        <NextBestMoveIndicator />
      </motion.div>

      {/* Top Performer */}
      {data.top_performer && (
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
                  <TrendingUp className="w-5 h-5 text-neon-blue" />
                </div>
                <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                  Top Performing Content
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="font-semibold text-white/90 truncate mb-2">{data.top_performer.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                    {getContentTypeIcon(data.top_performer.type)}
                    <span className="capitalize">{data.top_performer.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-cyan-400 bg-clip-text text-transparent">
                        {data.top_performer.views}
                      </p>
                      <p className="text-xs text-white/50">views last 7 days</p>
                    </div>
                    {data.top_performer.growth > 0 && (
                      <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30">
                        +{data.top_performer.growth}%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white hover-scale"
                  >
                    <a href={data.top_performer.url}>
                      View Content
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-neon-purple/30 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple hover-scale"
                  >
                    Repurpose
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Next Best Moves - Enhanced Opportunities Display */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full"
      >
        <EnhancedOpportunitiesDisplay
          opportunities={combinedOpportunities}
          totalCount={combinedOpportunities.length}
          loading={loading}
          onRefresh={fetchDashboardSummary}
        />
      </motion.div>

      {/* Encouragement Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl text-center overflow-hidden relative">
          {/* Subtle animated background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: [-200, 200],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardContent className="p-8 relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/20 to-green-400/20 border border-emerald-400/30 mb-4"
            >
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {data.encouragement}
            </h3>
            <p className="text-white/60 mb-6">
              You're making great progress on your content goals for {new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 hover:from-neon-blue/30 hover:to-neon-purple/30 text-white border border-white/20 hover-scale"
                onClick={() => navigate('/content-builder')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create New Content
              </Button>
              <Button 
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white hover-scale"
                onClick={() => navigate('/research/content-strategy')}
              >
                <Zap className="w-4 h-4 mr-2" />
                View Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};