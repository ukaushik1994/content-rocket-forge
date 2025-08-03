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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('dashboard-summary');
      
      if (error) throw error;
      
      setData(response);
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

      {/* Top Performer & Next Moves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performer */}
        {data.top_performer && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
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

        {/* Next Best Moves */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.01 }}
        >
          <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative h-full">
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
              <CardDescription className="text-white/60">
                AI-identified opportunities based on your content gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {data.next_moves.length > 0 ? (
                  data.next_moves.map((move, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group/item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1) }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-white/90 truncate group-hover/item:text-white transition-colors">
                          {move.cluster}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                          <div className="text-neon-blue">
                            {getContentTypeIcon(move.type)}
                          </div>
                          <span className="capitalize">{move.type}</span>
                          <span>•</span>
                          <span className="text-neon-purple">{move.volume.toLocaleString()} volume</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border-neon-purple/30 text-white hover:from-neon-purple/30 hover:to-neon-blue/30 hover-scale"
                      >
                        {move.cta}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm text-white/70">
                      No new opportunities available. Great job staying on top of your content strategy!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Encouragement Message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        whileHover={{ scale: 1.01 }}
      >
        <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group overflow-hidden relative">
          {/* Flowing gradient background */}
          <motion.div 
            className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-500"
            style={{
              background: "linear-gradient(45deg, rgba(255,20,147,0.1), transparent, rgba(30,144,255,0.1), transparent, rgba(138,43,226,0.1))",
              backgroundSize: "400% 400%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-neon-blue" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white/90 text-lg mb-1">{data.encouragement}</p>
                <p className="text-sm text-white/60">
                  Based on your <span className="text-neon-purple font-medium">
                    {new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span> progress
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{data.progress.percentage}%</div>
                <div className="text-xs text-white/60">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};