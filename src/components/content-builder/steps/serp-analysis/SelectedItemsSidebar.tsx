
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { X } from 'lucide-react';

interface SelectedItemsSidebarProps {
  serpSelections: SerpSelection;
  totalSelected: number;
  selectedCounts: Array<{ type: string; count: number }>;
  handleToggleSelection: (type: string, content: string) => void;
}

export const SelectedItemsSidebar: React.FC<SelectedItemsSidebarProps> = ({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection
}) => {
  // Helper function to get a readable label for selection types
  const getSelectionLabel = (type: string): string => {
    switch(type) {
      case 'keywords': return 'Keywords';
      case 'peopleAlsoAsk': return 'Questions';
      case 'topResults': return 'Top Results';
      case 'entities': return 'Entities';
      case 'headings': return 'Headings';
      case 'contentGaps': return 'Content Gaps';
      case 'recommendations': return 'Recommendations';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Helper function to get a color for each selection type
  const getTypeColor = (type: string): string => {
    switch(type) {
      case 'keywords': return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
      case 'peopleAlsoAsk': return 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30';
      case 'topResults': return 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
      case 'entities': return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30';
      case 'headings': return 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30';
      case 'contentGaps': return 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
      case 'recommendations': return 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30';
    }
  };
  
  return (
    <Card className="h-full border-white/10 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Selected Items ({totalSelected})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSelected === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Select items from the analysis to include in your content
          </div>
        ) : (
          <>
            {selectedCounts
              .filter(item => item.count > 0)
              .map(item => (
                <div key={item.type} className="space-y-2">
                  <div className="text-xs font-medium">
                    {getSelectionLabel(item.type)} ({item.count})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {serpSelections[item.type]?.map((content, index) => (
                      <Badge 
                        key={index} 
                        className={`flex items-center gap-1 ${getTypeColor(item.type)}`}
                      >
                        <span className="truncate max-w-[140px]">{content}</span>
                        <button 
                          className="h-3.5 w-3.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                          onClick={() => handleToggleSelection(item.type, content)}
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
