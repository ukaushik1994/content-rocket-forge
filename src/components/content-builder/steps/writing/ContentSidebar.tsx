
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ListChecks, PenLine, Target } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface ContentSidebarProps {
  outline: string[];
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
  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Outline Card */}
      <Card className="bg-white/5 border border-white/10 flex-grow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Content Outline
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            The AI will follow this structure
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto p-4">
            {outline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No outline sections defined yet
              </div>
            ) : (
              <ol className="space-y-3 ml-1">
                {outline.map((section, index) => (
                  <li key={index} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                    {section}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Solution Card - if selected */}
      {selectedSolution && (
        <Card className="bg-white/5 border border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Selected Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-primary/10">
                {selectedSolution.name}
              </Badge>
              <div className="text-xs text-muted-foreground">
                <p className="mt-1 font-medium">Key features:</p>
                <ul className="list-disc ml-4 mt-1 space-y-1">
                  {selectedSolution.features.slice(0, 3).map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Instructions Card */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PenLine className="h-4 w-4 text-indigo-400" />
            Additional Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any specific instructions for content generation..."
            className="min-h-[120px] bg-white/5 border-white/10"
            value={additionalInstructions}
            onChange={handleInstructionsChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
