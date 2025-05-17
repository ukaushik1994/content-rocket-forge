
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpQuestionsSection: React.FC<SerpQuestionsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.peopleAlsoAsk?.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4">
        {serpData.peopleAlsoAsk.map((item, index) => (
          <div key={index} className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-medium text-amber-300">{item.question}</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-auto p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
                onClick={() => onAddToContent(item.question, 'question')}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            {item.answer && (
              <div className="mt-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                {item.answer}
              </div>
            )}
            
            {item.source && (
              <div className="mt-2 text-xs text-muted-foreground">
                Source: {item.source}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
