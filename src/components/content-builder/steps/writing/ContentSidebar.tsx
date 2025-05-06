
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Lightbulb, CheckSquare } from 'lucide-react';
import { OutlineList } from './OutlineList';
import { Badge } from '@/components/ui/badge';

interface ContentSidebarProps {
  outline: string[];
  selectedSolution: any | null;
  additionalInstructions: string;
  handleInstructionsChange: (value: string) => void;
  seoInstructions?: string;
  unappliedRecommendationsCount?: number;
}

export const ContentSidebar = ({
  outline,
  selectedSolution,
  additionalInstructions,
  handleInstructionsChange,
  seoInstructions,
  unappliedRecommendationsCount = 0
}: ContentSidebarProps) => {
  return (
    <>
      <Card className="shadow border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Content Outline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {outline && outline.length > 0 ? (
            <OutlineList outline={outline} />
          ) : (
            <p className="text-sm text-muted-foreground">No outline created yet.</p>
          )}
        </CardContent>
      </Card>

      {/* SEO Recommendations Card - Show if there are SEO recommendations */}
      {seoInstructions && unappliedRecommendationsCount > 0 && (
        <Card className="shadow border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500" />
                SEO Recommendations
              </span>
              <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200">
                {unappliedRecommendationsCount} to apply
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto text-xs text-muted-foreground border border-green-100 rounded-md p-2 bg-white">
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-green-800 bg-transparent">
                {seoInstructions.trim()}
              </pre>
            </div>
            <p className="text-xs text-green-600 mt-2">
              These recommendations will be included when generating content
            </p>
          </CardContent>
        </Card>
      )}

      {selectedSolution && (
        <Card className="shadow border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              Selected Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p className="font-medium">{selectedSolution.name}</p>
              {selectedSolution.features && selectedSolution.features.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {selectedSolution.features.slice(0, 3).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <div className="mt-0.5">•</div>
                      <div>{feature}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Additional Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any specific instructions for generating your content..."
            className="resize-none bg-white"
            rows={3}
            value={additionalInstructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
          />
        </CardContent>
      </Card>
    </>
  );
};
