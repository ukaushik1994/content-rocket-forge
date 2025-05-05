
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';
import { SelectedItemsGroupProps } from '../types';

export const EntitiesGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection 
}) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-indigo-400" />
        Entities ({count})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item, i) => {
          // Ensure content is a string
          const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
          
          return (
            <Badge 
              key={i} 
              variant="outline" 
              className="bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-500/30 group"
            >
              {content}
              <button 
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, content)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
