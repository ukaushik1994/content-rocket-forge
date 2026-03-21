import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, BarChart3, Zap } from 'lucide-react';

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
  isAnalyzing = false,
}) => {
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const handleAnalyzeAll = () => {
    setHasAnalyzed(true);
    onAnalyzeAll();
  };

  return (
    <div className="text-center relative pt-12 pb-8">
      {/* Ambient Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-orange-500/[0.06] rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-foreground/80">AI Review Engine</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-orange-400 to-red-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}>
          Approvals
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}>
          AI-powered content analysis and automated approval workflows
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}>
          <Button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing || contentStats.all === 0}
            className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-semibold px-8 py-6 rounded-2xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <Sparkles className="mr-2 h-5 w-5" />
            {isAnalyzing ? 'Analyzing Content...' : 'Analyze All Content'}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex justify-center gap-8 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}>
          {[
            { icon: TrendingUp, label: 'Content Items', value: contentStats.all, color: 'text-orange-400' },
            { icon: BarChart3, label: 'Pending Review', value: contentStats.pending_review, color: 'text-amber-400' },
            { icon: Zap, label: 'Published', value: contentStats.published, color: 'text-red-400' },
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
