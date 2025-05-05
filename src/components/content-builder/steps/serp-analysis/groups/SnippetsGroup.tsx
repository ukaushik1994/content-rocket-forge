
import React from 'react';
import { X } from 'lucide-react';
import { SelectedItemsGroupProps } from '../types';

export const SnippetsGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection 
}) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        Snippets ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <div key={i} className="p-2 rounded-md bg-white/5 border border-white/10 text-xs group">
            <div className="flex items-start gap-2 justify-between">
              <span className="line-clamp-2">{item.content}</span>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 shrink-0"
                onClick={() => handleToggleSelection(item.type, item.content)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
