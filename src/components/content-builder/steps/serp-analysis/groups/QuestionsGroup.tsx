
import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { SelectedItemsGroupProps } from '../types';

export const QuestionsGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection 
}) => {
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
          <div key={i} className="p-2 rounded-md bg-amber-950/30 border border-amber-500/20 text-xs group">
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
          </div>
        ))}
      </div>
    </div>
  );
};
