import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { MetricsTab } from './tabs/MetricsTab';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface InlineSerpAnalysisProps {
  serpData: SerpAnalysisResult;
  keyword: string;
}

export function InlineSerpAnalysis({
  serpData,
  keyword
}: InlineSerpAnalysisProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              SERP Analysis
            </div>
            <div className="text-sm text-muted-foreground font-mono">{keyword}</div>
          </div>
        </div>
      </motion.div>
      
      {/* Metrics Section */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MetricsTab serpData={serpData} />
      </motion.div>
    </motion.div>
  );
}