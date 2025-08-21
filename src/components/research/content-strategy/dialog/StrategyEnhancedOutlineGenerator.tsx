import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { AIOutlineGenerator } from '@/components/content-builder/outline/AIOutlineGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StrategyEnhancedOutlineGeneratorProps {
  proposal: any;
}

export function StrategyEnhancedOutlineGenerator({ proposal }: StrategyEnhancedOutlineGeneratorProps) {
  const { state } = useContentBuilder();
  const { selectedSolution, serpSelections } = state;

  const selectedSerpCount = serpSelections.filter(item => item.selected).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Generate Content Outline</h3>
        <p className="text-muted-foreground">
          Create a structured outline for "{proposal?.primary_keyword}" featuring {selectedSolution?.name}
        </p>
      </div>

      {/* Context Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Solution Context */}
        {selectedSolution && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Selected Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{selectedSolution.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedSolution.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {selectedSolution.features.slice(0, 4).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {selectedSolution.features.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedSolution.features.length - 4} more features
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* SERP Context */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SERP Research</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Selected SERP Items</span>
                <Badge variant={selectedSerpCount > 0 ? "default" : "secondary"}>
                  {selectedSerpCount} selected
                </Badge>
              </div>
              {selectedSerpCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Your outline will incorporate insights from {selectedSerpCount} SERP research items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Use existing Content Builder AIOutlineGenerator */}
      <AIOutlineGenerator />
    </div>
  );
}