import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, BarChart3, Zap, Search, Filter, CheckCircle2, Clock, AlertCircle, FileText, Brain, Target, XCircle } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
interface ContentStats {
  all: number;
  draft: number;
  pending_review: number;
  approved: number;
  published: number;
  needs_changes: number;
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
  const quickFilters = [{
    key: 'all',
    label: 'All',
    count: contentStats.all,
    icon: FileText,
    color: 'bg-blue-500/20 text-blue-400'
  }, {
    key: 'draft',
    label: 'Draft',
    count: contentStats.draft,
    icon: FileText,
    color: 'bg-slate-500/20 text-slate-400'
  }, {
    key: 'pending_review',
    label: 'Pending',
    count: contentStats.pending_review,
    icon: Clock,
    color: 'bg-yellow-500/20 text-yellow-400'
  }, {
    key: 'needs_changes',
    label: 'Changes',
    count: contentStats.needs_changes,
    icon: AlertCircle,
    color: 'bg-orange-500/20 text-orange-400'
  }, {
    key: 'approved',
    label: 'Approved',
    count: contentStats.approved,
    icon: CheckCircle2,
    color: 'bg-green-500/20 text-green-400'
  }, {
    key: 'rejected',
    label: 'Rejected',
    count: contentStats.rejected,
    icon: XCircle,
    color: 'bg-red-500/20 text-red-400'
  }];
  return <motion.div className="min-h-[60vh] w-full relative" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.8
  }}>

      {/* Progress Indicator */}
      

      <div className="relative z-10 w-full px-6 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div className="text-center mb-16 relative" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" animate={{
          opacity: [0.5, 0.8, 0.5]
        }} transition={{
          duration: 4,
          repeat: Infinity
        }} />
          
          <div className="relative">
            <motion.div className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8" whileHover={{
            scale: 1.05
          }} transition={{
            type: "spring",
            stiffness: 300
          }}>
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Content Review</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }}>
              Content Approval
              <br />
              <span className="text-primary">Workspace</span>
            </motion.h1>
            
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
              Advanced AI analysis for content quality, SEO optimization, 
              and automated approval workflows to streamline your content process
            </motion.p>

            {/* AI Analysis Button */}
            <motion.div className="mb-12" initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 200
          }}>
              <Button onClick={handleAnalyzeAll} disabled={isAnalyzing || contentStats.all === 0} size="lg" className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white px-8 py-4 text-lg font-semibold shadow-2xl">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" animate={{
                x: [-100, 100]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }} />
                <div className="relative flex items-center gap-3">
                  <Sparkles className="h-5 w-5" />
                  {isAnalyzing ? 'Analyzing Content...' : 'Analyze All Content'}
                  <Target className="h-5 w-5" />
                </div>
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div className="flex justify-center gap-8 mb-8" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.8
          }}>
              {[{
              icon: TrendingUp,
              label: "Content Items",
              value: contentStats.all
            }, {
              icon: BarChart3,
              label: "Pending Review",
              value: contentStats.pending_review
            }, {
              icon: Zap,
              label: "Published",
              value: contentStats.published
            }].map((stat, index) => <motion.div key={stat.label} className="text-center" whileHover={{
              scale: 1.05
            }} transition={{
              type: "spring",
              stiffness: 300
            }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>)}
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div className="flex justify-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 1.0
      }}>
          <div className="flex gap-3 p-2 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50">
            {quickFilters.map(filter => <motion.button key={filter.key} onClick={() => onQuickFilter(filter.key)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeFilter === filter.key ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-background/80'}`} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
                <filter.icon className="h-4 w-4" />
                <span className="font-medium">{filter.label}</span>
                <Badge variant={activeFilter === filter.key ? "secondary" : "outline"} className={activeFilter === filter.key ? "bg-primary-foreground/20" : filter.color}>
                  {filter.count}
                </Badge>
              </motion.button>)}
          </div>
        </motion.div>
      </div>
    </motion.div>;
};