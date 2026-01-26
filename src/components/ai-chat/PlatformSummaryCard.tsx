import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, FileText, CheckCircle, Clock, Target, ArrowRight } from 'lucide-react';
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);

  const fetchSummaryData = async () => {
    if (!user) return;
    try {
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, status, seo_score')
        .eq('user_id', user.id);

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
      label: 'Content',
      value: summary.totalContent,
      icon: FileText,
    },
    {
      label: 'Published',
      value: summary.published,
      icon: CheckCircle,
    },
    {
      label: 'In Review',
      value: summary.inReview,
      icon: Clock,
    },
    {
      label: 'SEO Score',
      value: `${summary.avgSeoScore}%`,
      icon: TrendingUp,
    }
  ];

  if (isLoading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                Platform Overview
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map((metric, index) => (
                <motion.div 
                  key={metric.label}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <metric.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Ready to optimize?</span>
              </div>
              <Button
                size="sm"
                onClick={() => onAction('workflow:get-started')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                Get Started
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
