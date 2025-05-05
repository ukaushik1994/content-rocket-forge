
import React from 'react';
import { Globe, X } from 'lucide-react';
import { SelectedItemsGroupProps } from '../types';

export const TopRanksGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection,
  competitorCount
}) => {
  if (count === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 text-purple-400" />
        Top Rankings ({count})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <div key={i} className="p-2 rounded-md bg-purple-950/30 border border-purple-500/20 text-xs group">
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <Globe className="h-3.5 w-3.5 text-purple-400 mt-0.5" />
                <span>{typeof item.content === 'string' ? item.content : JSON.stringify(item.content)}</span>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                onClick={() => handleToggleSelection(item.type, typeof item.content === 'string' ? item.content : JSON.stringify(item.content))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            {item.source && (
              <div className="mt-1 pl-5 text-xs text-muted-foreground">
                Source: {item.source}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
