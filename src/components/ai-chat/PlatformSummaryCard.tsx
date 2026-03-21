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
      className="flex justify-center gap-4 sm:gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {metrics.map((metric, index) => (
        <motion.button
          key={metric.label}
          className="glass-card glass-card-hover flex flex-col items-center gap-2.5 px-5 py-4 cursor-pointer border border-white/[0.08] backdrop-blur-md"
          onClick={() => navigate(metric.route)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 + index * 0.08, duration: 0.35, ease: 'easeOut' }}
          whileHover={{ y: -3, scale: 1.02 }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: metric.bg }}
          >
            <metric.icon className={`h-5 w-5 ${metric.color}`} />
          </div>
          <div className="text-xl font-semibold font-mono text-foreground tabular-nums">{metric.value}</div>
          <div className="text-[11px] text-muted-foreground/70 uppercase tracking-wider">{metric.label}</div>
        </motion.button>
      ))}
    </motion.div>
  );
};
