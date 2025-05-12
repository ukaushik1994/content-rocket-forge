
import React from 'react';
import { Solution } from '@/contexts/content-builder/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContentSidebarProps {
  outline: any[];
  selectedSolution: Solution | null;
  additionalInstructions: string;
  handleInstructionsChange: (instructions: string) => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange,
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <Card className="flex-grow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Content Outline</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 overflow-auto max-h-[200px]">
          {outline && outline.length > 0 ? (
            <ol className="list-decimal list-inside space-y-1">
              {outline.map((item, index) => (
                <li key={index} className="text-sm">
                  {typeof item === 'string' ? item : item.title}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground">No outline sections defined</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Solution Integration</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSolution ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {selectedSolution.logoUrl ? (
                  <img 
                    src={selectedSolution.logoUrl} 
                    alt={selectedSolution.name} 
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Package className="w-5 h-5 text-primary" />
                )}
                <h3 className="font-medium">{selectedSolution.name}</h3>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-xs font-medium mb-1">Key Features:</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedSolution.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedSolution.painPoints && selectedSolution.painPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1">Pain Points:</h4>
                  <ul className="text-xs space-y-0.5 list-disc list-inside">
                    {selectedSolution.painPoints.slice(0, 2).map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-center">
              <div>
                <AlertCircle className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No solution selected</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Additional Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add specific instructions for content generation..."
            value={additionalInstructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            className="min-h-[120px] text-sm resize-none"
          />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Include tone of voice, special requirements, etc.
        </CardFooter>
      </Card>
    </div>
  );
};
