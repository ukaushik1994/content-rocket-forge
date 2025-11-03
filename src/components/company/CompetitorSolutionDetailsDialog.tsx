import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ExternalLink, DollarSign, Wrench, BookOpen, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompetitorSolutionDetailsDialogProps {
  solution: CompetitorSolution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompetitorSolutionDetailsDialog({
  solution,
  open,
  onOpenChange,
}: CompetitorSolutionDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {solution.logoUrl ? (
              <img src={solution.logoUrl} alt={solution.name} className="w-12 h-12 rounded object-cover" />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl">{solution.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {solution.category && <Badge variant="secondary">{solution.category}</Badge>}
                {solution.externalUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={solution.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {solution.longDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{solution.longDescription}</p>
                  </div>
                )}

                {solution.positioning && (
                  <div>
                    <h3 className="font-semibold mb-2">Market Positioning</h3>
                    <p className="text-sm text-muted-foreground">{solution.positioning}</p>
                  </div>
                )}

                {solution.uniqueValuePropositions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Value Propositions</h3>
                    <ul className="space-y-2">
                      {solution.uniqueValuePropositions.map((uvp: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">●</span>
                          <span>{typeof uvp === 'string' ? uvp : uvp.proposition || uvp.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {solution.targetAudience?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Target Audience
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {solution.targetAudience.map((audience: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {typeof audience === 'string' ? audience : audience.segment || audience.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-0 space-y-4">
                {solution.features?.length > 0 ? (
                  <div className="space-y-3">
                    {solution.features.map((feature: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <h4 className="font-medium text-sm mb-1">
                          {typeof feature === 'string' ? feature : feature.name || feature.title}
                        </h4>
                        {typeof feature === 'object' && feature.description && (
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No feature details available
                  </p>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="mt-0">
                {solution.pricing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Pricing Information</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(solution.pricing, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No pricing information available
                  </p>
                )}
              </TabsContent>

              <TabsContent value="technical" className="mt-0 space-y-6">
                {solution.technicalSpecs && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Technical Specifications</h3>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(solution.technicalSpecs, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {solution.integrations?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Integrations</h3>
                    <div className="flex flex-wrap gap-2">
                      {solution.integrations.map((integration: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {typeof integration === 'string' ? integration : integration.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="use-cases" className="mt-0 space-y-4">
                {solution.useCases?.length > 0 ? (
                  <div className="space-y-4">
                    {solution.useCases.map((useCase: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg border">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          {typeof useCase === 'string' ? useCase : useCase.title || useCase.name}
                        </h4>
                        {typeof useCase === 'object' && useCase.description && (
                          <p className="text-sm text-muted-foreground">{useCase.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No use case information available
                  </p>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
