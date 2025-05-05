
import React from 'react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SelectedItemsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const KeywordsGroup: React.FC<SelectedItemsGroupProps> = ({ count, items, handleToggleSelection }) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-blue-400" />
        Keywords ({count})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Badge 
              variant="outline" 
              className="bg-blue-950/30 hover:bg-blue-950/50 border-blue-500/30 group"
            >
              {item.content}
              <button 
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const QuestionsGroup: React.FC<SelectedItemsGroupProps> = ({ count, items, handleToggleSelection }) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
        Questions ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-2 rounded-md bg-amber-950/30 border border-amber-500/20 text-xs group"
          >
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5" />
                <span>{item.content}</span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const SnippetsGroup: React.FC<SelectedItemsGroupProps> = ({ count, items, handleToggleSelection }) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        Snippets ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-2 rounded-md bg-white/5 border border-white/10 text-xs group"
          >
            <div className="flex items-start gap-2 justify-between">
              <span className="line-clamp-2">{item.content}</span>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 shrink-0"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
