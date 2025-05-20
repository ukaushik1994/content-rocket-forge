
import React from 'react';
import { motion } from 'framer-motion';
import { Heading, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      className="space-y-3 py-4"
    >
      {serpData.headings.map((heading, index) => (
        <motion.div key={`heading-${index}`} variants={item}>
          <Card className="bg-teal-900/10 border-teal-500/20 hover:border-teal-500/40 transition-all">
            <CardContent className="p-4 flex justify-between items-start">
              <div className="flex items-start gap-3">
                <Heading className={`h-5 w-5 text-teal-400 mt-0.5 ${
                  heading.level === 'h1' ? 'text-lg' : 
                  heading.level === 'h2' ? 'text-md' : 
                  'text-sm'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{heading.text}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      heading.level === 'h1' ? 'bg-teal-500/30 text-teal-200' :
                      heading.level === 'h2' ? 'bg-teal-600/30 text-teal-300' :
                      'bg-teal-700/30 text-teal-400'
                    }`}>
                      {heading.level.toUpperCase()}
                    </span>
                  </div>
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
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-teal-500/30 hover:bg-teal-500/20"
          onClick={() => {
            const allHeadings = serpData.headings
              .map(h => `${h.level.toUpperCase()}: ${h.text}`)
              .join('\n');
            onAddToContent(allHeadings, 'allHeadings');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all headings
        </Button>
      </div>
    </motion.div>
  );
}
