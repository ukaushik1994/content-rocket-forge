
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SerpEntitiesTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpEntitiesTab({ serpData, onAddToContent = () => {} }: SerpEntitiesTabProps) {
  if (!serpData.entities || serpData.entities.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No entity data available for this search.
      </div>
    );
  }

  // Group entities by type if available
  const groupedEntities: Record<string, string[]> = {};
  serpData.entities.forEach(entity => {
    const type = entity.type || 'Other';
    if (!groupedEntities[type]) {
      groupedEntities[type] = [];
    }
    groupedEntities[type].push(entity.name);
  });

  return (
    <div className="space-y-6">
      {Object.keys(groupedEntities).length > 0 ? (
        Object.entries(groupedEntities).map(([type, entities]) => (
          <div key={type} className="space-y-2">
            <h3 className="font-medium text-lg capitalize">{type}</h3>
            <Card className="p-4">
              <div className="flex flex-wrap gap-2">
                {entities.map((entity, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80 py-1.5"
                    onClick={() => onAddToContent(entity, 'entity')}
                  >
                    {entity}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        ))
      ) : (
        // If there's no type grouping, just display all entities
        <div>
          <h3 className="font-medium text-lg">Important Entities</h3>
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {serpData.entities.map((entity, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80 py-1.5"
                  onClick={() => onAddToContent(entity.name, 'entity')}
                >
                  {entity.name}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
