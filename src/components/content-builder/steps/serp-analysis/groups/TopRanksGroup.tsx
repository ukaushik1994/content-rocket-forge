
import React from 'react';
import { FileText, X } from 'lucide-react';
import { SelectedItemsGroupProps } from '../types';

export const TopRanksGroup: React.FC<SelectedItemsGroupProps> = ({ 
  count, 
  items, 
  handleToggleSelection,
  competitorCount = 0
}) => {
  const totalCount = count || competitorCount;
  if (totalCount === 0) return null;
  
  const selectedItems = items.filter(item => item.selected);
  
  return (
    <div>
      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-green-400" />
        Top Ranks ({totalCount})
      </h4>
      <div className="space-y-2">
        {selectedItems.map((item, i) => (
          <div key={i} className="p-2 rounded-md bg-green-950/30 border border-green-500/20 text-xs group">
            <div className="flex items-start gap-2 justify-between">
              <div className="flex items-start gap-2">
                <FileText className="h-3.5 w-3.5 text-green-400 mt-0.5" />
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

// Add an optional property for backward compatibility
TopRanksGroup.defaultProps = {
  competitorCount: 0
};

// Add TypeScript interface
interface TopRanksGroupProps extends SelectedItemsGroupProps {
  competitorCount?: number;
}
