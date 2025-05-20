
import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4"
    >
      {serpData.entities.map((entity, index) => (
        <motion.div key={`entity-${index}`} variants={item}>
          <Card className="bg-indigo-900/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all h-full">
            <CardContent className="p-4 flex flex-col h-full">
              <div className="flex items-start gap-3 flex-1">
                <FileSearch className="h-5 w-5 text-indigo-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{entity.name}</p>
                  {entity.type && (
                    <span className="text-xs px-2 py-0.5 bg-indigo-500/20 rounded-full text-indigo-300 inline-block mt-1">
                      {entity.type}
                    </span>
                  )}
                  {entity.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {entity.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20"
                  onClick={() => onAddToContent(entity.name, 'entity')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
