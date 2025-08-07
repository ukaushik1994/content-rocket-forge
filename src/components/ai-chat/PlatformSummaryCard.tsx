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
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  }, {
    label: 'Published',
    value: summary.published,
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  }, {
    label: 'In Review',
    value: summary.inReview,
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  }, {
    label: 'Avg SEO Score',
    value: `${summary.avgSeoScore}%`,
    icon: TrendingUp,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  }];
  if (isLoading) {
    return <Card className="bg-card/60 border-border backdrop-blur">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded"></div>)}
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
    <Card className="bg-card/70 border-border backdrop-blur-xl shadow-neon">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Platform Overview
          </CardTitle>
          <Badge variant="outline" className="bg-accent/20 border-border text-xs">
            Live snapshot
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <div className="group rounded-xl border border-border bg-background/40 p-4 hover:bg-background/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                    <m.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{m.label}</div>
                    <div className="text-lg font-semibold text-foreground">{m.value}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Target className="h-4 w-4" />
              High-impact next step
            </div>
            <p className="text-sm text-muted-foreground">Improve SEO score of content in review to raise your average.</p>
            <Button size="sm" className="mt-3" onClick={() => onAction('workflow:seo-optimization')}>
              Improve SEO
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Zap className="h-4 w-4" />
              Create new content
            </div>
            <p className="text-sm text-muted-foreground">Start a fresh piece leveraging your best-performing solutions.</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={() => onAction('workflow:content-creation')}>
              New Content
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              Review performance
            </div>
            <p className="text-sm text-muted-foreground">Check analytics for published items and find quick wins.</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => onAction('workflow:performance-analysis')}>
              View Analytics
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>;
};