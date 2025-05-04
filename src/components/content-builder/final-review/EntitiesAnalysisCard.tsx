
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, AlertCircle } from 'lucide-react';

interface Entity {
  name: string;
  type?: string;
  importance?: number;
}

interface EntitiesAnalysisCardProps {
  entities?: Entity[] | null;
}

export const EntitiesAnalysisCard = ({ entities }: EntitiesAnalysisCardProps) => {
  if (!entities || entities.length === 0) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
            Entity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px] flex-col gap-2 text-center">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No entity data available.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Sort entities by importance if available
  const sortedEntities = [...entities].sort((a, b) => 
    (b.importance || 0) - (a.importance || 0)
  );
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
          Entity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          {sortedEntities.map((entity, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`border-amber-500/30 ${
                (entity.importance || 0) > 70 ? 'bg-amber-500/20' : 
                (entity.importance || 0) > 40 ? 'bg-amber-400/10' : 'bg-amber-300/5'
              } hover:bg-amber-500/30 transition-colors`}
            >
              {entity.name}
              {entity.type && <span className="opacity-50 ml-1 text-xs">({entity.type})</span>}
            </Badge>
          ))}
        </div>
        
        <div className="mt-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <p>These entities represent key concepts detected in top-ranking content for your target keywords.</p>
        </div>
      </CardContent>
    </Card>
  );
};
