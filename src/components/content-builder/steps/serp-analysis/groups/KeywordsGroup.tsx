
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { SelectedItemsGroupProps } from '../types';

export const KeywordsGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection 
}) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-white/60 mb-2 flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-blue-400" />
        Keywords ({count})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item, i) => {
          // Ensure content is a string
          const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
          
          return (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              key={i}
            >
              <Badge 
                variant="outline" 
                className="bg-blue-950/30 hover:bg-blue-950/50 border-blue-500/30 group py-1 px-2"
              >
                {content}
                <button 
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  onClick={() => handleToggleSelection(item.type, content)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
