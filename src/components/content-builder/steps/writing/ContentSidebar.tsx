
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Solution, OutlineSection } from '@/contexts/content-builder/types';

interface ContentSidebarProps {
  outline: OutlineSection[];
  selectedSolution: Solution | null;
  additionalInstructions: string;
  handleInstructionsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const ContentSidebar: React.FC<ContentSidebarProps> = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange
}) => {
  const renderOutlineItem = (item: OutlineSection, index: number) => {
    return (
      <div key={item.id || index} className="ml-4 border-l pl-4 py-1">
        <div className="font-medium">{item.title}</div>
        {/* Handle children sections if they exist */}
        {item.children && item.children.length > 0 && (
          <div className="ml-4 mt-1 space-y-2">
            {item.children.map((child, childIndex) => renderOutlineItem(child, childIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Outline Card */}
      <Card className="h-96 overflow-hidden border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-medium">Content Outline</CardTitle>
        </CardHeader>
        <ScrollArea className="h-80">
          <CardContent className="p-4 space-y-2">
            {outline.length > 0 ? (
              outline.map((section, index) => renderOutlineItem(section, index))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No outline sections yet</p>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
      
      {/* Solution Info Card */}
      {selectedSolution && (
        <Card className="border">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-sm font-medium">Solution Reference</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium mb-2">{selectedSolution.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedSolution.description}</p>
            </div>
            
            {selectedSolution.features.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-1">Features</h4>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.features.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedSolution.useCases.length > 0 && (
              <div>
                <h4 className="text-xs font-medium mb-1">Use Cases</h4>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  {selectedSolution.useCases.slice(0, 2).map((useCase, index) => (
                    <li key={index}>{useCase}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Additional Instructions Card */}
      <Card className="border">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-medium">Additional Instructions</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Textarea
            placeholder="Add any specific instructions for content generation..."
            className="resize-none h-24"
            value={additionalInstructions}
            onChange={handleInstructionsChange}
          />
        </CardContent>
      </Card>
    </>
  );
};
