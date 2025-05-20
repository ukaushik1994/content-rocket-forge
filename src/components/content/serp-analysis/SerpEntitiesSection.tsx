
import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpEntitiesSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpEntitiesSection({ serpData, expanded, onAddToContent = () => {} }: SerpEntitiesSectionProps) {
  if (!expanded || !serpData?.entities?.length) return null;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2 py-4"
    >
      {serpData.entities.map((entity, index) => (
        <motion.div key={`entity-${index}`} variants={item}>
          <div className="bg-indigo-900/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-md px-3 py-2 flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <FileSearch className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{entity.name}</p>
                {entity.type && (
                  <Badge variant="outline" className="text-xs bg-indigo-900/20 border-indigo-500/20 mt-1">
                    {entity.type}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onAddToContent(entity.name, 'entity')}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
