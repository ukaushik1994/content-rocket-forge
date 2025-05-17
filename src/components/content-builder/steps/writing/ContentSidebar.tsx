
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ListChecks, Sparkles } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { ContentGeneratorPanel } from './ContentGeneratorPanel';

interface ContentSidebarProps {
  outline: string[];
  selectedSolution: Solution | null;
  additionalInstructions: string;
  handleInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  showGenerator?: boolean;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange,
  showGenerator = false
}) => {
  // If generator is active, show the generator panel
  if (showGenerator) {
    return <ContentGeneratorPanel />;
  }

  return (
    <>
      {/* Outline Reference Card */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <ListChecks className="h-4 w-4 mr-2 text-primary" />
            Outline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="max-h-[300px] overflow-auto text-sm">
            {outline.length > 0 ? (
              <ol className="list-decimal list-inside space-y-1">
                {outline.map((section, index) => (
                  <li key={index} className="text-muted-foreground">
                    {section}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground italic">No outline available</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Solution Card */}
      {selectedSolution && (
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Selected Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold">{selectedSolution.name}</h4>
              </div>
              
              {selectedSolution.features && selectedSolution.features.length > 0 && (
                <div>
                  <h5 className="text-xs text-muted-foreground mb-1">Key Features:</h5>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    {selectedSolution.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Additional Instructions */}
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Additional Instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Textarea
            placeholder="Add any specific instructions for content generation..."
            className="min-h-[100px] bg-white/5 border-white/10"
            value={additionalInstructions}
            onChange={handleInstructionsChange}
          />
        </CardContent>
      </Card>
    </>
  );
};
