
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';

interface KeywordsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const KeywordsGroup: React.FC<KeywordsGroupProps> = ({
  count,
  items,
  handleToggleSelection
}) => {
  const selectedItems = items.filter(item => item.selected);
  
  if (selectedItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-blue-400" />
        <h4 className="font-medium text-sm">Keywords ({count})</h4>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item, idx) => {
          // Ensure content is always a string
          const contentString = typeof item.content === 'string' 
            ? item.content 
            : String(item.content || '');
            
          return (
            <Badge
              key={`keyword-${idx}-${contentString}`}
              variant="secondary"
              className="bg-blue-500/20 text-blue-200 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer flex items-center gap-1"
              onClick={() => handleToggleSelection(item.type, contentString)}
            >
              <span className="truncate max-w-[200px]">{contentString}</span>
              <X className="h-3 w-3 hover:text-red-300" />
            </Badge>
          );
        })}
      </div>
    </motion.div>
  );
};
