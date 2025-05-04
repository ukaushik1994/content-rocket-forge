
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, BarChart2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContentCardFooterProps {
  updatedAt: string;
  onEdit: () => void;
  onAnalyze: () => void;
}

export const ContentCardFooter: React.FC<ContentCardFooterProps> = ({ 
  updatedAt, 
  onEdit,
  onAnalyze 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
      <div className="text-xs text-muted-foreground">
        Updated {formatDate(updatedAt)}
      </div>
      
      {/* Quick action buttons that appear on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={(e) => { e.stopPropagation(); onAnalyze(); }}
        >
          <BarChart2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
