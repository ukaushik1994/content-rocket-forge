
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpContentGapsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpContentGapsSection: React.FC<SerpContentGapsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.contentGaps?.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4">
        {serpData.contentGaps.map((gap, index) => (
          <div key={index} className="p-4 bg-rose-900/20 border border-rose-500/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-rose-300">{gap.topic}</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-auto p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                onClick={() => onAddToContent(gap.topic, 'contentGap')}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="mt-2 text-xs text-muted-foreground">
              {gap.description}
            </p>
            
            {gap.recommendation && (
              <div className="mt-2 text-xs bg-white/5 p-2 rounded">
                <span className="text-rose-300 font-medium">Recommendation:</span> {gap.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
