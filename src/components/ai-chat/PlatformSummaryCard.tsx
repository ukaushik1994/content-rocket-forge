import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlatformSummaryCardProps {
  onAction: (action: string, data?: any) => void;
}

export const PlatformSummaryCard: React.FC<PlatformSummaryCardProps> = () => {
  const [summary, setSummary] = useState({
    totalContent: 0,
    published: 0,
    inReview: 0,
    avgSeoScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchSummaryData();
  }, [user]);

  const fetchSummaryData = async () => {
    if (!user) return;
    try {
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, status, seo_score')
        .eq('user_id', user.id);

      const totalContent = contentItems?.length || 0;
      const published = contentItems?.filter(item => item.status === 'published').length || 0;
      const inReview = contentItems?.filter(item => item.status === 'review').length || 0;
      const avgSeoScore = totalContent > 0
        ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / totalContent)
        : 0;

      setSummary({ totalContent, published, inReview, avgSeoScore });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || summary.totalContent === 0) return null;

  const metrics = [
    { label: 'Content', value: summary.totalContent, icon: FileText, color: 'text-blue-400' },
    { label: 'Published', value: summary.published, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'In Review', value: summary.inReview, icon: Clock, color: 'text-amber-400' },
    { label: 'SEO Score', value: `${summary.avgSeoScore}%`, icon: BarChart3, color: 'text-purple-400' },
  ];

  return (
    <motion.div
      className="flex justify-center gap-6 sm:gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </div>
          <div className="text-lg font-bold text-foreground">{metric.value}</div>
          <div className="text-xs text-muted-foreground">{metric.label}</div>
        </div>
      ))}
    </motion.div>
  );
};
