import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    { label: 'Content', value: summary.totalContent, icon: FileText, bg: 'rgba(139,92,246,0.15)', color: 'text-purple-400', route: '/repository' },
    { label: 'Published', value: summary.published, icon: CheckCircle, bg: 'rgba(34,197,94,0.15)', color: 'text-emerald-400', route: '/repository' },
    { label: 'In Review', value: summary.inReview, icon: Clock, bg: 'rgba(234,179,8,0.15)', color: 'text-amber-400', route: '/content-approval' },
    { label: 'SEO Score', value: `${summary.avgSeoScore}%`, icon: TrendingUp, bg: 'rgba(59,130,246,0.15)', color: 'text-blue-400', route: '/analytics' },
  ];

  return (
    <motion.div
      className="flex justify-center gap-10 sm:gap-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {metrics.map((metric) => (
        <motion.button
          key={metric.label}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => navigate(metric.route)}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ background: metric.bg }}
          >
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">{metric.value}</div>
          <div className="text-xs text-muted-foreground">{metric.label}</div>
        </motion.button>
      ))}
    </motion.div>
  );
};
