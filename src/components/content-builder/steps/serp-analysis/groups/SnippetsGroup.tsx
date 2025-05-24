
import React from 'react';
import { FileText, X } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';

interface SnippetsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SnippetsGroup: React.FC<SnippetsGroupProps> = ({
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
        <FileText className="h-4 w-4 text-green-400" />
        <h4 className="font-medium text-sm">Snippets ({count})</h4>
      </div>
      
      <div className="space-y-2">
        {selectedItems.map((item, idx) => {
          // Ensure content is always a string
          const contentString = typeof item.content === 'string' 
            ? item.content 
            : String(item.content || '');
            
          return (
            <div
              key={`snippet-${idx}-${contentString.slice(0, 20)}`}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 cursor-pointer hover:bg-green-500/30 transition-colors flex items-start justify-between gap-2"
              onClick={() => handleToggleSelection(item.type, contentString)}
            >
              <p className="text-sm text-green-200 flex-1 line-clamp-3">{contentString}</p>
              <X className="h-3 w-3 text-green-300 hover:text-red-300 mt-0.5 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
