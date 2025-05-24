
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

  // Helper function to safely extract string content from any data type
  const extractStringContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      // Handle objects with block_position and items
      if (content.items && Array.isArray(content.items)) {
        return content.items.map((item: any) => 
          typeof item === 'string' ? item : String(item)
        ).join(', ');
      }
      // Handle other object types
      if (content.text) return String(content.text);
      if (content.title) return String(content.title);
      if (content.query) return String(content.query);
      if (content.name) return String(content.name);
      // Fallback for other objects
      return JSON.stringify(content);
    }
    return String(content || '');
  };

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
          const contentString = extractStringContent(item.content);
            
          return (
            <Badge
              key={`keyword-${idx}-${contentString.substring(0, 20)}`}
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
