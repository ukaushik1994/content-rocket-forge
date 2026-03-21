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
  onQuickFilter: (filter: string) => void;
  activeFilter: string;
  isAnalyzing?: boolean;
}

export const ContentApprovalHero: React.FC<ContentApprovalHeroProps> = ({
  contentStats,
  onAnalyzeAll,
  onQuickFilter,
  activeFilter,
  isAnalyzing = false
}) => {
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const handleAnalyzeAll = () => {
    setHasAnalyzed(true);
    onAnalyzeAll();
  };

  const workflowSteps = [
  { label: 'Create', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  { label: 'Submit for Review', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  { label: 'Review Here', color: 'bg-primary/15 text-primary border-primary/20' },
  { label: 'Publish', color: 'bg-green-500/15 text-green-400 border-green-500/20' }];


  const quickFilters = [
  { key: 'all', label: 'All', count: contentStats.all, icon: FileText, color: 'bg-blue-500/20 text-blue-400' },
  { key: 'draft', label: 'Draft', count: contentStats.draft, icon: FileText, color: 'bg-slate-500/20 text-slate-400' },
  { key: 'pending_review', label: 'Pending', count: contentStats.pending_review, icon: Clock, color: 'bg-yellow-500/20 text-yellow-400' },
  { key: 'needs_changes', label: 'Changes', count: contentStats.needs_changes, icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400' },
  { key: 'approved', label: 'Approved', count: contentStats.approved, icon: CheckCircle2, color: 'bg-green-500/20 text-green-400' },
  { key: 'rejected', label: 'Rejected', count: contentStats.rejected, icon: XCircle, color: 'bg-red-500/20 text-red-400' }];


  return (
    <div className="text-center relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }} />
      

      <div className="relative">
        {/* Workflow Steps */}
        















        

        {/* Badge */}
        









        

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
          { icon: Zap, label: 'Published', value: contentStats.published, color: 'text-green-400' }].
          map((stat) =>
          <div key={stat.label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          )}
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}>
          
          <div className="flex gap-3 p-2 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50">
            {quickFilters.map((filter) =>
            <motion.button
              key={filter.key}
              onClick={() => onQuickFilter(filter.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeFilter === filter.key ?
              'bg-primary text-primary-foreground shadow-lg' :
              'hover:bg-background/80'}`
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              
                <filter.icon className="h-4 w-4" />
                <span className="font-medium">{filter.label}</span>
                <Badge
                variant={activeFilter === filter.key ? 'secondary' : 'outline'}
                className={activeFilter === filter.key ? 'bg-primary-foreground/20' : filter.color}>
                
                  {filter.count}
                </Badge>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

};