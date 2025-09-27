import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, FileText, CheckCircle, Clock, Target, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
interface PlatformSummaryCardProps {
  onAction: (action: string, data?: any) => void;
}
export const PlatformSummaryCard: React.FC<PlatformSummaryCardProps> = ({
  onAction
}) => {
  const [summary, setSummary] = useState({
    totalContent: 0,
    published: 0,
    inReview: 0,
    avgSeoScore: 0,
    solutions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);
  const fetchSummaryData = async () => {
    if (!user) return;
    try {
      // Fetch content items
      const {
        data: contentItems
      } = await supabase.from('content_items').select('id, status, seo_score').eq('user_id', user.id);

      // Fetch solutions
      const {
        data: solutions
      } = await supabase.from('solutions').select('id').eq('user_id', user.id);
      const totalContent = contentItems?.length || 0;
      const published = contentItems?.filter(item => item.status === 'published').length || 0;
      const inReview = contentItems?.filter(item => item.status === 'review').length || 0;
      const avgSeoScore = totalContent > 0 ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / totalContent) : 0;
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
  const metrics = [{
    label: 'Content Pieces',
    value: summary.totalContent,
    icon: FileText,
    color: 'text-info',
    bgColor: 'bg-info/20'
  }, {
    label: 'Published',
    value: summary.published,
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/20'
  }, {
    label: 'In Review',
    value: summary.inReview,
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/20'
  }, {
    label: 'Avg SEO Score',
    value: `${summary.avgSeoScore}%`,
    icon: TrendingUp,
    color: 'text-primary',
    bgColor: 'bg-primary/20'
  }];
  if (isLoading) {
    return <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-border/50 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-[1px]">
              {[...Array(4)].map((_, i) => <div key={i} className="h-5 bg-background/60 rounded"></div>)}
            </div>
          </div>
        </CardContent>
      </Card>;
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.6,
    delay: 0.1
  }}>
      <Card className="bg-background/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
                Platform Overview
              </h3>
            </div>
            
            <div className="grid grid-cols-4 gap-[1px]">
              {metrics.map((metric, index) => (
                <motion.div 
                  key={metric.label}
                  className={`p-0.5 rounded-md bg-gradient-to-br ${metric.bgColor} border border-border/50`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center gap-0.5 mb-0.5">
                    <metric.icon className={`h-1.5 w-1.5 ${metric.color}`} />
                  </div>
                  <div className="text-xs font-bold text-foreground">{metric.value}</div>
                  <div className="text-[6px] text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ready to optimize?</span>
              </div>
              <Button
                size="sm"
                onClick={() => onAction('workflow:get-started')}
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Get Started
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>;
};