
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

// Define SelectedCountsType explicitly
export interface SelectedCountsType {
  [key: string]: number;
}

export interface SelectedItemsContentProps {
  selectedCounts: SelectedCountsType;
  totalSelected: number;
  onGenerateOutline: () => void;
  serpSelections?: any[]; // Add missing prop
}

export const SelectedItemsContent: React.FC<SelectedItemsContentProps> = ({
  selectedCounts,
  totalSelected,
  onGenerateOutline
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Selected Items</span>
          <Badge variant="outline">{totalSelected}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(selectedCounts).map(([key, count]) => (
            // Fix comparison with explicit type check
            count > 0 && (
              <div key={key} className="bg-muted/30 px-3 py-2 rounded-md flex justify-between items-center">
                <span className="text-sm capitalize">{key}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            )
          ))}
        </div>
        
        <Button 
          className="w-full mt-4 gap-1.5"
          onClick={onGenerateOutline}
          disabled={totalSelected === 0}
        >
          Generate Outline <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
