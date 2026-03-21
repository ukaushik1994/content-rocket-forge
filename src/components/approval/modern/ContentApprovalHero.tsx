import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, BarChart3, Zap, Target } from 'lucide-react';

interface ContentStats {
  all: number;
  draft: number;
  pending_review: number;
  approved: number;
  published: number;
  needs_changes: number;
  rejected: number;
}

interface ContentApprovalHeroProps {
  contentStats: ContentStats;
  onAnalyzeAll: () => void;
  isAnalyzing?: boolean;
}

export const ContentApprovalHero: React.FC<ContentApprovalHeroProps> = ({
  contentStats,
  onAnalyzeAll,
  isAnalyzing = false
}) => {
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const handleAnalyzeAll = () => {
    setHasAnalyzed(true);
    onAnalyzeAll();
  };

  return (
    <div className="text-center relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }} />

      <div className="relative">
        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}>
          Content Approval
          <br />
          <span className="text-primary">Workspace</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}>
          Advanced AI analysis for content quality, SEO optimization,
          and automated approval workflows to streamline your content process
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}>
          <Button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing || contentStats.all === 0}
            className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="relative flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              {isAnalyzing ? 'Analyzing Content...' : 'Analyze All Content'}
              <Target className="h-5 w-5" />
            </div>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex justify-center gap-8 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}>
          {[
            { icon: TrendingUp, label: 'Content Items', value: contentStats.all, color: 'text-blue-400' },
            { icon: BarChart3, label: 'Pending Review', value: contentStats.pending_review, color: 'text-amber-400' },
            { icon: Zap, label: 'Published', value: contentStats.published, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
