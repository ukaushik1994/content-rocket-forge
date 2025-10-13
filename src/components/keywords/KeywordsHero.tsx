import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, TrendingUp, BarChart3, Zap, FileText, AlertTriangle, Target, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface KeywordStats {
  total: number;
  inPublished: number;
  inDraft: number;
  cannibalization: number;
}
interface KeywordsHeroProps {
  keywordStats: KeywordStats;
  onQuickFilter: (filter: string) => void;
  activeFilter: string;
}
export const KeywordsHero: React.FC<KeywordsHeroProps> = ({
  keywordStats,
  onQuickFilter,
  activeFilter
}) => {
  const navigate = useNavigate();
  const quickFilters = [{
    key: 'all',
    label: 'All Keywords',
    count: keywordStats.total,
    icon: Database,
    color: 'bg-blue-500/20 text-blue-400'
  }, {
    key: 'published',
    label: 'Published',
    count: keywordStats.inPublished,
    icon: FileText,
    color: 'bg-green-500/20 text-green-400'
  }, {
    key: 'draft',
    label: 'Draft',
    count: keywordStats.inDraft,
    icon: BarChart3,
    color: 'bg-yellow-500/20 text-yellow-400'
  }, {
    key: 'cannibalization',
    label: 'Warnings',
    count: keywordStats.cannibalization,
    icon: AlertTriangle,
    color: 'bg-orange-500/20 text-orange-400'
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
              <Database className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Keyword Repository</span>
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
              Keyword Management
              <br />
              <span className="text-primary">Dashboard</span>
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
              Track keyword usage across your content, identify cannibalization issues, 
              and optimize your content strategy
            </motion.p>

            {/* Action Buttons */}
            <motion.div className="flex gap-4 justify-center mb-12" initial={{
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
              <Button onClick={() => navigate('/content-builder')} size="lg" className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white px-8 py-4 text-lg font-semibold shadow-2xl">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" animate={{
                x: [-100, 100]
              }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }} />
                <div className="relative flex items-center gap-3">
                  <PlusCircle className="h-5 w-5" />
                  Create Content
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
              label: "Total Keywords",
              value: keywordStats.total
            }, {
              icon: BarChart3,
              label: "In Published",
              value: keywordStats.inPublished
            }, {
              icon: Zap,
              label: "Warnings",
              value: keywordStats.cannibalization
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