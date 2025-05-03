
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SerpSelection } from '@/contexts/ContentBuilderContext';

interface SerpKeywordListProps {
  keywords: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpKeywordList: React.FC<SerpKeywordListProps> = ({
  keywords,
  handleToggleSelection
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keywords.map((item, index) => (
            <div key={index} className="flex items-center border rounded-md p-3">
              <Checkbox 
                id={`keyword-${index}`} 
                checked={item.selected}
                onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                className="mr-3"
              />
              <Label htmlFor={`keyword-${index}`} className="cursor-pointer flex-1">
                {item.content}
              </Label>
            </div>
          ))}
        </div>
        
        {keywords.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No keywords available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
