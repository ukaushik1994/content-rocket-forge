
import React from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
          <Card className="bg-rose-900/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileQuestion className="h-5 w-5 text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{gap.topic}</p>
                  <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
                  
                  {gap.recommendation && (
                    <div className="mt-3 p-2 bg-rose-900/20 rounded border border-rose-500/20">
                      <p className="text-xs text-rose-200 flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {gap.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-900/20"
                  onClick={() => onAddToContent(gap.topic, 'contentGap')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-xs">Add</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-rose-500/30 hover:bg-rose-500/20"
          onClick={() => {
            const allGaps = serpData.contentGaps
              .map(gap => `${gap.topic}: ${gap.description}`)
              .join('\n\n');
            onAddToContent(allGaps, 'allContentGaps');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all content gaps
        </Button>
      </div>
    </motion.div>
  );
}
