
import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Plus, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpContentGapsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpContentGapsSection({ serpData, expanded, onAddToContent = () => {} }: SerpContentGapsSectionProps) {
  if (!expanded || !serpData?.contentGaps?.length) return null;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      {serpData.contentGaps.map((gap, index) => (
        <motion.div key={`gap-${index}`} variants={item}>
          <div className="bg-rose-900/10 border border-rose-500/20 hover:border-rose-500/40 rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-rose-400" />
                <h4 className="font-medium">{gap.topic}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                onClick={() => onAddToContent(gap.topic, 'contentGap')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {gap.description && (
              <p className="text-sm text-muted-foreground">{gap.description}</p>
            )}
            
            {gap.recommendation && (
              <div className="bg-rose-900/20 border border-rose-500/10 rounded p-2 mt-2">
                <p className="text-xs text-rose-200">Recommendation: {gap.recommendation}</p>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
