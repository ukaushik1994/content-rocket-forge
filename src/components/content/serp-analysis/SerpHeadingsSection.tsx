
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult, Heading } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpHeadingsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpHeadingsSection: React.FC<SerpHeadingsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.headings?.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-3">
        {serpData.headings.map((heading, index) => (
          <div 
            key={index} 
            className={`p-3 bg-teal-900/20 border border-teal-500/20 rounded-lg flex items-start justify-between gap-2`}
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="px-1.5 py-0.5 rounded bg-teal-900/50 text-[10px] uppercase font-bold tracking-wider text-teal-300">
                  {heading.level}
                </div>
                <h4 className={`text-sm font-medium text-teal-300`}>
                  {heading.text}
                </h4>
              </div>
              {heading.subtext && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {heading.subtext}
                </p>
              )}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-auto p-1 text-teal-400 hover:text-teal-300 hover:bg-teal-950/50"
              onClick={() => onAddToContent(heading.text, 'heading')}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
