
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface SerpSectionCardProps {
  title: string;
  description: string;
  count: number;
  provider: string;
  items: Array<{
    content: string;
    type: string;
    metadata?: any;
    selected?: boolean;
  }>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectItem: (item: any) => void;
  onSelectAll: () => void;
  icon: React.ReactNode;
}

export const SerpSectionCard: React.FC<SerpSectionCardProps> = ({
  title,
  description,
  count,
  provider,
  items,
  isExpanded,
  onToggleExpand,
  onSelectItem,
  onSelectAll,
  icon
}) => {
  const selectedCount = items.filter(item => item.selected).length;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-neon-purple">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{title}</span>
                <Badge variant="secondary">{count}</Badge>
                {selectedCount > 0 && (
                  <Badge variant="default">{selectedCount} selected</Badge>
                )}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {provider}
            </Badge>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="flex items-center space-x-1"
            >
              <Plus className="h-3 w-3" />
              <span>Select All</span>
            </Button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={item.selected || false}
                  onCheckedChange={() => onSelectItem(item)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {item.content}
                  </p>
                  {item.metadata && (
                    <div className="mt-1 space-y-1">
                      {item.metadata.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.metadata.description}
                        </p>
                      )}
                      {item.metadata.source && (
                        <p className="text-xs text-blue-500 truncate">
                          {item.metadata.source}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
