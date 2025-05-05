
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OutlineSection } from '@/contexts/content-builder/types';

interface ContentSidebarProps {
  outline: OutlineSection[];
  selectedSolution: any;
  additionalInstructions: string;
  handleInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-4">Content Outline</h4>
          
          {outline && outline.length > 0 ? (
            <div className="space-y-4">
              {outline.map((section: OutlineSection) => (
                <div key={section.id} className="space-y-2">
                  <div className="font-medium text-sm">{section.title}</div>
                  
                  {section.subsections && section.subsections.length > 0 && (
                    <ul className="pl-4 space-y-1">
                      {section.subsections.map((subsection) => (
                        <li key={subsection.id} className="text-sm text-muted-foreground list-disc list-inside">
                          {subsection.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No outline created yet. Go back to the previous step to create an outline.
            </p>
          )}
        </CardContent>
      </Card>
      
      {selectedSolution && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-2">Selected Solution</h4>
            <div className="space-y-2">
              <div className="font-bold">{selectedSolution.name}</div>
              {selectedSolution.features && selectedSolution.features.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Features:</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedSolution.features.map((feature: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Include these features and benefits in your content to highlight this solution.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="additional-instructions">Additional Instructions</Label>
        <Textarea
          id="additional-instructions"
          placeholder="Add any specific instructions for content generation..."
          value={additionalInstructions}
          onChange={handleInstructionsChange}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          These instructions will be used when generating content.
        </p>
      </div>
    </div>
  );
};
