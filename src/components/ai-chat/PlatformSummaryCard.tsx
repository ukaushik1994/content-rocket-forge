import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

  const contextualNudge = useMemo(() => {
    if (summary.totalContent === 0) {
      return {
        text: "Ready to get started? I can help you create your first content.",
        action: 'send:Help me create my first piece of content',
        buttonText: 'Get Started'
      };
    }
    if (summary.inReview > 0) {
      return {
        text: `${summary.inReview} item${summary.inReview > 1 ? 's' : ''} in review`,
        action: 'send:Show me my content items in review and help me process them',
        buttonText: 'Review'
      };
    }
    if (summary.avgSeoScore > 0 && summary.avgSeoScore < 50) {
      return {
        text: 'SEO scores could improve',
        action: 'send:Analyze my content SEO scores and suggest improvements',
        buttonText: 'Optimize'
      };
    }
    return {
      text: 'Everything looks good',
      action: 'workflow:get-started',
      buttonText: "Let's Go"
    };
  }, [summary]);

  const metrics = [
    { label: 'Content', value: summary.totalContent, icon: FileText },
    { label: 'Published', value: summary.published, icon: CheckCircle },
    { label: 'In Review', value: summary.inReview, icon: Clock },
    { label: 'SEO', value: `${summary.avgSeoScore}%`, icon: TrendingUp }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 py-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 w-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {summary.totalContent > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground py-2">
          {metrics.map((metric, index) => (
            <React.Fragment key={metric.label}>
              {index > 0 && <span className="text-border">·</span>}
              <span className="flex items-center gap-1.5">
                <metric.icon className="h-3.5 w-3.5 text-primary/70" />
                <span className="font-medium text-foreground">{metric.value}</span>
                <span>{metric.label}</span>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 py-2">
        <Target className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{contextualNudge.text}</span>
        <button
          onClick={() => onAction(contextualNudge.action)}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
        >
          {contextualNudge.buttonText}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
