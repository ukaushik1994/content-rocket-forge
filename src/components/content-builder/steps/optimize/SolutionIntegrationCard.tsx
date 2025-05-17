
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Puzzle, CheckCircle, AlertCircle } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export function SolutionIntegrationCard() {
  const { state } = useContentBuilder();
  const { selectedSolution } = state;
  
  if (!selectedSolution) {
    return null;
  }
  
  // Placeholder metrics - in real app this would come from AI analysis
  const integrationMetrics = {
    mentions: 2,
    descriptionsCount: 1,
    benefitsMentioned: true,
    callToAction: true,
    naturalIntegration: 80 // percentage
  };
  
  return (
    <Card className="border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-primary" />
          Solution Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {selectedSolution.logoUrl && (
              <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center">
                <img 
                  src={selectedSolution.logoUrl} 
                  alt={selectedSolution.name} 
                  className="h-6 w-6"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{selectedSolution.name}</p>
              <p className="text-xs text-muted-foreground">{selectedSolution.category}</p>
            </div>
          </div>
          
          {/* Integration metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs">Solution mentions</span>
              <Badge variant={integrationMetrics.mentions > 0 ? "outline" : "secondary"} className="text-xs">
                {integrationMetrics.mentions}x
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs">Features described</span>
              <Badge variant={integrationMetrics.descriptionsCount > 0 ? "outline" : "secondary"} className="text-xs">
                {integrationMetrics.descriptionsCount}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs">Benefits mentioned</span>
              {integrationMetrics.benefitsMentioned ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs">Call to action</span>
              {integrationMetrics.callToAction ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-400" />
              )}
            </div>
          </div>
          
          {/* Integration quality */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs">Integration quality</span>
              <span className={`text-xs font-medium ${integrationMetrics.naturalIntegration >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                {integrationMetrics.naturalIntegration}%
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  integrationMetrics.naturalIntegration >= 80 ? 'bg-green-500' :
                  integrationMetrics.naturalIntegration >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${integrationMetrics.naturalIntegration}%` }}
              />
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="p-3 bg-white/5 rounded border border-white/10">
            <p className="text-xs font-medium mb-1">Improvement suggestions:</p>
            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Add more specific features of {selectedSolution.name}</li>
              <li>Include a comparison with alternatives</li>
              <li>Strengthen the call to action</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
