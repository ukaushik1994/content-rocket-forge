import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, TrendingUp, BarChart3, Zap, PlusCircle } from 'lucide-react';
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
    icon: BarChart3,
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
    icon: Zap,
    color: 'bg-orange-500/20 text-orange-400'
  }];

  return (
    <motion.div className="relative w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <div className="relative z-10 w-full px-6 pt-12 pb-8">
        <div className="text-center space-y-6 max-w-5xl mx-auto relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[400px] bg-indigo-500/[0.06] rounded-full blur-3xl" />
          </div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="flex items-center justify-center relative">
            <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full">
              <Database className="h-5 w-5 text-indigo-400" />
              <span className="text-sm font-medium">Keyword Repository</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }} className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-indigo-400 to-blue-500 bg-clip-text text-transparent relative">
            Keywords
          </motion.h1>

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto relative">
            Track keyword usage, identify cannibalization, and optimize your content strategy
          </motion.p>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, type: "spring", stiffness: 200 }} className="flex gap-4 justify-center relative">
            <Button onClick={() => navigate('/ai-chat')} size="lg" className="bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Content
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex justify-center gap-8 relative">
            {[
              { icon: TrendingUp, label: "Total Keywords", value: keywordStats.total, color: 'text-indigo-400' },
              { icon: BarChart3, label: "In Published", value: keywordStats.inPublished, color: 'text-blue-400' },
              { icon: Zap, label: "Warnings", value: keywordStats.cannibalization, color: 'text-violet-400' }
            ].map((stat) =>
              <motion.div key={stat.label} className="flex flex-col items-center gap-2" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Filters */}
          <motion.div className="flex justify-center relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="flex gap-3 p-2 glass-card rounded-2xl">
              {quickFilters.map(filter => (
                <motion.button
                  key={filter.key}
                  onClick={() => onQuickFilter(filter.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeFilter === filter.key ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-background/80'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <filter.icon className="h-4 w-4" />
                  <span className="font-medium">{filter.label}</span>
                  <Badge variant={activeFilter === filter.key ? "secondary" : "outline"} className={activeFilter === filter.key ? "bg-primary-foreground/20" : filter.color}>
                    {filter.count}
                  </Badge>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
