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

      {/* Progress Overview - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {[
          { 
            type: 'blog', 
            label: 'Blog Posts', 
            current: data.content_created.blog, 
            goal: data.progress.goal.blog,
            icon: FileText,
            gradient: 'from-neon-blue/20 to-cyan-400/20',
            iconColor: 'text-neon-blue',
            glowColor: 'from-neon-blue/30 to-cyan-400/30'
          },
          { 
            type: 'article', 
            label: 'Articles', 
            current: data.content_created.article, 
            goal: data.progress.goal.article,
            icon: FileText,
            gradient: 'from-neon-purple/20 to-purple-400/20',
            iconColor: 'text-neon-purple',
            glowColor: 'from-neon-purple/30 to-purple-400/30'
          },
          { 
            type: 'glossary', 
            label: 'Glossary Terms', 
            current: data.content_created.glossary, 
            goal: data.progress.goal.glossary,
            icon: Book,
            gradient: 'from-neon-pink/20 to-pink-400/20',
            iconColor: 'text-neon-pink',
            glowColor: 'from-neon-pink/30 to-pink-400/30'
          },
          { 
            type: 'overall', 
            label: 'Overall Progress', 
            current: data.progress.percentage, 
            goal: 100,
            icon: Target,
            gradient: 'from-emerald-400/20 to-green-400/20',
            iconColor: 'text-emerald-400',
            glowColor: 'from-emerald-400/30 to-green-400/30',
            isPercentage: true
          }
        ].map((item, index) => (
          <motion.div
            key={item.type}
            whileHover={{ scale: 1.025, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="glass-panel border-white/10 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.08] transition-all duration-500 group overflow-hidden relative shadow-glass hover:shadow-glass-lg">
              {/* Enhanced gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className={`absolute inset-0 bg-gradient-to-r ${item.glowColor} opacity-10 blur-xl`} />
                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent" />
              </div>
              
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm font-medium text-white/70 mb-2 tracking-wide uppercase">{item.label}</p>
                    <p className="text-3xl font-display font-bold text-white tracking-tight">
                      {item.isPercentage ? `${item.current}%` : `${item.current}/${item.goal}`}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-white/[0.08] flex items-center justify-center border border-white/20 ${item.iconColor} group-hover:scale-110 group-hover:border-white/40 transition-all duration-500 shadow-premium`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Progress 
                    value={item.isPercentage ? item.current : (item.current / Math.max(item.goal, 1)) * 100}
                    className="h-2 bg-white/10 rounded-full overflow-hidden"
                  />
                  <div className="flex justify-between text-xs text-white/60 font-medium">
                    <span>{item.isPercentage ? 'Complete' : 'Progress'}</span>
                    <span className="text-white/80">{item.isPercentage ? item.current : Math.round((item.current / Math.max(item.goal, 1)) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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

      {/* Next Best Moves - Full Width Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full"
      >
        <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
          {/* Animated background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(255,20,147,0.1), rgba(138,43,226,0.1), rgba(30,144,255,0.1))",
                "linear-gradient(135deg, rgba(30,144,255,0.1), rgba(255,20,147,0.1), rgba(138,43,226,0.1))",
                "linear-gradient(135deg, rgba(138,43,226,0.1), rgba(30,144,255,0.1), rgba(255,20,147,0.1))",
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Lightbulb className="w-5 h-5 text-neon-pink" />
              </div>
              <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                Next Best Moves
              </span>
            </CardTitle>
            <CardDescription className="text-white/60 ml-13">
              {combinedOpportunities.length > 0 
                ? `${combinedOpportunities.length} content opportunities available` 
                : "No opportunities available"}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 p-0">
            {combinedOpportunities.length > 0 ? (
              <div className="relative overflow-hidden">
                {/* Carousel Container */}
                <motion.div
                  className="flex gap-6 px-6 pb-6"
                  animate={{
                    x: [0, -50, 0],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    width: `${Math.max(combinedOpportunities.length * 320, typeof window !== 'undefined' ? window.innerWidth : 1200)}px`
                  }}
                >
                  {combinedOpportunities.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${index}`}
                      className="flex-shrink-0 w-80 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group/tile"
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => handleOpportunityClick(item, item.type)}
                    >
                      {/* Opportunity Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            item.type === 'opportunity' ? 'bg-neon-blue/20 text-neon-blue' :
                            item.type === 'ai-strategy' ? 'bg-neon-purple/20 text-neon-purple' :
                            'bg-neon-pink/20 text-neon-pink'
                          }`}>
                            {getOpportunityTypeIcon(item.type)}
                          </div>
                          <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                            {item.type === 'opportunity' ? 'Opportunity' : 
                             item.type === 'ai-strategy' ? 'AI Strategy' : 'Dashboard'}
                          </Badge>
                        </div>
                        {item.priority && (
                          <Badge className={`text-xs ${getPriorityColor(item.priority)} bg-white/10 border-white/20`}>
                            {item.priority}
                          </Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-white/90 mb-2 line-clamp-2 leading-tight">
                        {item.title || item.cluster}
                      </h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-white/60 mb-3 line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Keywords */}
                      {item.keywords?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs border-white/10 text-white/50 bg-white/5">
                                {keyword}
                              </Badge>
                            ))}
                            {item.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs border-white/10 text-white/40 bg-white/5">
                                +{item.keywords.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metrics Row */}
                      <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                        <div className="flex items-center gap-3">
                          {item.volume && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {item.volume > 1000 ? `${(item.volume / 1000).toFixed(1)}k` : item.volume}
                            </span>
                          )}
                          {item.difficulty !== undefined && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {item.difficulty}/100
                            </span>
                          )}
                          {item.content_format && (
                            <span className="capitalize">{item.content_format}</span>
                          )}
                        </div>
                        <span className="text-white/40">
                          {item.createdAt ? new Intl.DateTimeFormat('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          }).format(new Date(item.createdAt)) : 'Recent'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        size="sm" 
                        className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 group-hover/tile:bg-neon-blue/20 group-hover/tile:border-neon-blue/30 transition-all duration-300"
                      >
                        <span className="flex items-center gap-2">
                          {item.cta || 'View Details'}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Enhanced fade edges for full-width carousel */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background/90 via-background/60 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background/90 via-background/60 to-transparent pointer-events-none z-10" />
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Lightbulb className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-white/60 mb-2">No content opportunities found</p>
                <p className="text-sm text-white/40">Check back later for new opportunities</p>
              </div>
            )}
          </CardContent>
        </Card>
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