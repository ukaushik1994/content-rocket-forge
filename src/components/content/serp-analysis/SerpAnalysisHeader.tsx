
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpSectionHeader, SerpMetricsSection } from './index';

interface SerpAnalysisHeaderProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
}

export function SerpAnalysisHeader({ serpData, mainKeyword }: SerpAnalysisHeaderProps) {
  const [expanded, setExpanded] = React.useState(true);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xl relative overflow-hidden"
    >
      {/* Interactive background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 opacity-10"></div>
        <motion.div
          className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            left: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-purple-500/10 filter blur-xl"
          animate={{
            x: ['-10%', '110%'],
            y: ['30%', '50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-blue-500/10 filter blur-xl"
          animate={{
            x: ['110%', '-10%'],
            y: ['60%', '40%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-primary/20 rounded-full">
          <Search className="text-primary h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-xl">
            Analysis for: <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{mainKeyword}</span>
          </h3>
          <p className="text-sm text-muted-foreground">Interactive insights from top-ranking content</p>
        </div>
      </div>
      
      <SerpSectionHeader 
        title="Search Metrics" 
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        variant="blue"
        description="Keyword metrics to understand search volume and competition"
      />
      
      <SerpMetricsSection 
        serpData={serpData} 
        expanded={expanded} 
        onAddToContent={() => {}}
      />
    </motion.div>
  );
}
