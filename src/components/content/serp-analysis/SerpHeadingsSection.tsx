
import React from 'react';
import { motion } from 'framer-motion';
import { Heading, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpHeadingsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpHeadingsSection({ serpData, expanded, onAddToContent = () => {} }: SerpHeadingsSectionProps) {
  if (!expanded || !serpData?.headings?.length) return null;
  
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
      className="space-y-2 py-4"
    >
      {serpData.headings.map((heading, index) => (
        <motion.div key={`heading-${index}`} variants={item}>
          <div className="bg-teal-900/10 border border-teal-500/20 hover:border-teal-500/40 rounded-md p-3 flex justify-between group">
            <div className="flex items-start gap-2">
              <div className="bg-teal-500/20 px-2 rounded mt-0.5 text-xs font-mono">
                {heading.level}
              </div>
              <div>
                <p className="font-medium text-sm">{heading.text}</p>
                {heading.subtext && (
                  <p className="text-xs text-muted-foreground mt-1">{heading.subtext}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-teal-400 hover:text-teal-300 hover:bg-teal-900/20"
              onClick={() => onAddToContent(heading.text, 'heading')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
