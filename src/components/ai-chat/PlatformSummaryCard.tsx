
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock,
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformSummaryCardProps {
  onAction: (action: string, data?: any) => void;
}

export const PlatformSummaryCard: React.FC<PlatformSummaryCardProps> = ({ onAction }) => {
  const [summary, setSummary] = useState({
    totalContent: 0,
    published: 0,
    inReview: 0,
    avgSeoScore: 0,
    solutions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);

  const fetchSummaryData = async () => {
    if (!user) return;
    
    try {
      // Fetch content items
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, status, seo_score')
        .eq('user_id', user.id);

      // Fetch solutions
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id')
        .eq('user_id', user.id);

      const totalContent = contentItems?.length || 0;
      const published = contentItems?.filter(item => item.status === 'published').length || 0;
      const inReview = contentItems?.filter(item => item.status === 'review').length || 0;
      const avgSeoScore = totalContent > 0 
        ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / totalContent)
        : 0;

      setSummary({
        totalContent,
        published,
        inReview,
        avgSeoScore,
        solutions: solutions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    {
      label: 'Content Pieces',
      value: summary.totalContent,
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    {
      label: 'Published',
      value: summary.published,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      label: 'In Review',
      value: summary.inReview,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      label: 'Avg SEO Score',
      value: `${summary.avgSeoScore}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-sm overflow-hidden relative">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              Platform Overview
            </span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              {summary.solutions} Solutions Connected
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.4 }}
                className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${metric.bgColor} mb-3`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-xs text-white/60">{metric.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              onClick={() => onAction('send:Show me detailed performance analytics')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              onClick={() => onAction('workflow:keyword-optimization')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Optimize Content
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              Platform health: <span className="text-green-400 font-medium">Excellent</span>
            </span>
            <span className="text-white/50">Last updated: Just now</span>
          </div>
        </CardContent>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
      </Card>
    </motion.div>
  );
};
