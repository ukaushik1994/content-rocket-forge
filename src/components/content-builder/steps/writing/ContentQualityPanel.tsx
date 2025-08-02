import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, RefreshCw, Target, Hash, Users, Lightbulb, TrendingUp, Eye } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const ContentQualityPanel: React.FC = () => {
  const { state } = useContentBuilder();
  const { seoScore, seoImprovements } = state;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleApplyImprovement = (id: string) => {
    // Dispatch action to apply the SEO improvement
    console.log(`Applying improvement with ID: ${id}`);
  };

  const handleRunAnalysis = () => {
    // Dispatch action to run SEO analysis
    console.log('Running SEO analysis...');
  };

  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Content Quality
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRunAnalysis}
            className="text-xs h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Run Analysis
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              SEO Score
            </div>
            <Badge variant="secondary">
              {seoScore} / 100
            </Badge>
          </div>
          <Progress value={seoScore} max={100} />
          <Collapsible onOpenChange={toggleExpand} open={isExpanded}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Suggestions
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  {isExpanded ? (
                    <>
                      Hide <ChevronUp className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Show <ChevronDown className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pl-4 mt-2 space-y-2">
              {seoImprovements && seoImprovements.length > 0 ? (
                seoImprovements.map((improvement) => (
                  <div key={improvement.id} className="flex items-start gap-2">
                    {improvement.applied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{improvement.title}</p>
                      <p className="text-xs text-muted-foreground">{improvement.description}</p>
                      {!improvement.applied && (
                        <Button 
                          variant="secondary" 
                          size="xs"
                          onClick={() => handleApplyImprovement(improvement.id)}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No suggestions available
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
