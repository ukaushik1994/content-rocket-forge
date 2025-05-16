
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpEntitiesSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpEntitiesSection: React.FC<SerpEntitiesSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.entities?.length) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-wrap gap-2">
        {serpData.entities.map((entity, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="py-1.5 pl-3 pr-2 bg-indigo-950/30 border-indigo-500/20 hover:bg-indigo-900/30 cursor-pointer group flex items-center gap-1"
            onClick={() => onAddToContent(entity.name, 'entity')}
          >
            {entity.name}
            <PlusCircle className="h-3 w-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Badge>
        ))}
      </div>
    </motion.div>
  );
};
