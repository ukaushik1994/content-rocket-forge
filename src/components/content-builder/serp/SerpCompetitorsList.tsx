
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SerpSelection } from '@/contexts/ContentBuilderContext';

interface SerpCompetitorsListProps {
  competitors: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpCompetitorsList: React.FC<SerpCompetitorsListProps> = ({
  competitors,
  handleToggleSelection
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {competitors.length > 0 ? (
          <div className="space-y-4">
            {competitors.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <Checkbox 
                    id={`competitor-${index}`} 
                    checked={item.selected}
                    onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm mb-2">{item.content}</div>
                    {item.source && (
                      <div className="text-xs text-muted-foreground">Source: {item.source}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No competitor data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
