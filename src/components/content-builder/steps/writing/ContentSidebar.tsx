import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { ContentOutlineSection } from '@/contexts/content-builder/types';

interface ContentSidebarProps {
  outline: ContentOutlineSection[];
  selectedSolution: any;
  additionalInstructions: string;
  handleInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  condensed?: boolean;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange,
  condensed = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    outline: true,
    solution: true,
    instructions: true
  });

  // Toggle section visibility
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // If condensed mode is active, show a more compact version
  if (condensed) {
    return (
      <div className="space-y-4">
        {/* Content Outline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Content Outline</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => toggleSection('outline')}
              >
                {expandedSections.outline ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {expandedSections.outline && (
              <>
                {outline && outline.length > 0 ? (
                  <div className="space-y-2">
                    {outline.slice(0, 3).map((section: ContentOutlineSection) => (
                      <div key={section.id} className="text-xs">
                        <div className="font-medium">{section.title}</div>
                      </div>
                    ))}
                    {outline.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{outline.length - 3} more sections
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No outline created yet. Generate one in the Outline tab.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Selected Solution - Condensed */}
        {selectedSolution && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Selected Solution</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => toggleSection('solution')}
                >
                  {expandedSections.solution ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {expandedSections.solution && (
                <div className="space-y-2">
                  <div className="font-medium text-sm">{selectedSolution.name}</div>
                  {selectedSolution.features && selectedSolution.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedSolution.features.slice(0, 3).map((feature: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {selectedSolution.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedSolution.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Additional Instructions - Condensed */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Instructions</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0" 
                onClick={() => toggleSection('instructions')}
              >
                {expandedSections.instructions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {expandedSections.instructions && (
              <Textarea
                placeholder="Add any specific instructions for content generation..."
                value={additionalInstructions}
                onChange={handleInstructionsChange}
                rows={3}
                className="text-xs"
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Otherwise, render the full version
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium mb-4">Content Outline</h4>
          
          {outline && outline.length > 0 ? (
            <div className="space-y-4">
              {outline.map((section: ContentOutlineSection) => (
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
