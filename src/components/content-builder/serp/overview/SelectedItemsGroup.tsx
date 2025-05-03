
import React from 'react';
import { motion } from 'framer-motion';
import { SerpSelection } from '@/contexts/content-builder/types';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Text, FileText, X, Search } from 'lucide-react';

interface ItemsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export function QuestionsGroup({ count, items, handleToggleSelection }: ItemsGroupProps) {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
        Questions ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <div key={i} className="p-2 rounded-md bg-purple-950/30 border border-purple-500/20 text-xs group">
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-purple-400 mt-0.5" />
                <span>{item.content}</span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function KeywordsGroup({ count, items, handleToggleSelection }: ItemsGroupProps) {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-blue-400" />
        Keywords ({count})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item, i) => (
          <Badge 
            key={i} 
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
        ))}
      </div>
    </motion.div>
  );
}

export function SnippetsGroup({ count, items, handleToggleSelection }: ItemsGroupProps) {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Text className="h-3.5 w-3.5 text-amber-400" />
        Featured Snippets ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <div key={i} className="p-2 rounded-md bg-amber-950/30 border border-amber-500/20 text-xs group">
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <Text className="h-3.5 w-3.5 text-amber-400 mt-0.5" />
                <span>{item.content.substring(0, 100)}...</span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
