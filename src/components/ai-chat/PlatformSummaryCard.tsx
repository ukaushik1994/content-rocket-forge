import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    { label: 'Content', value: summary.totalContent },
    { label: 'Published', value: summary.published },
    { label: 'In Review', value: summary.inReview },
    { label: 'SEO Score', value: `${summary.avgSeoScore}%` },
  ];

  return (
    <motion.div
      className="border-t border-border/30 pt-6 flex justify-center gap-8 sm:gap-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {metrics.map((metric, index) => (
        <div key={metric.label} className="text-center">
          <div className="text-lg font-semibold text-foreground">{metric.value}</div>
          <div className="text-xs text-muted-foreground">{metric.label}</div>
        </div>
      ))}
    </motion.div>
  );
};
