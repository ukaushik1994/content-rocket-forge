
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';

interface SelectedItemsBadgeProps {
  item: SerpSelection;
  handleToggleSelection: (type: string, content: string) => void;
  badgeClassName: string;
}

export const SelectedItemsBadge: React.FC<SelectedItemsBadgeProps> = ({
  item,
  handleToggleSelection,
  badgeClassName
}) => {
  // Ensure content is treated as a string
  const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
  
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 py-1.5 pl-3 pr-2 ${badgeClassName} transition-colors group`}
    >
      {content.length > 50 ? content.substring(0, 50) + '...' : content}
      <button 
        onClick={() => handleToggleSelection(item.type, content)}
        className="ml-1 text-purple-400 hover:text-red-400 hover:bg-white/10 rounded-full p-0.5 transition-colors"
        aria-label="Remove item"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};
