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
    return <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/20 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/10 rounded"></div>)}
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
      
    </motion.div>;
};