import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitorSolution } from '@/contexts/content-builder/types/company-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ExternalLink, DollarSign, Wrench, BookOpen, Target, RefreshCw, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { refreshCompetitorSolution } from '@/services/competitorSolutionsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !solution) throw new Error('Not authenticated');
      
      return refreshCompetitorSolution(
        solution.id,
        solution.externalUrl || '',
        user.id
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor-solutions'] });
      toast({
        title: 'Solution Refreshed',
        description: 'Latest data has been fetched successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending || !solution.externalUrl}
              className="shrink-0"
            >
              {refreshMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solution.features.map((feature: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-lg border bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {typeof feature === 'string' ? feature : feature.name || feature.title}
                            </h4>
                            {typeof feature === 'object' && feature.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted/50 p-6 mb-4">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No feature details discovered yet
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="mt-0">
                {solution.pricing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Pricing Information</h3>
                    </div>

                    {solution.pricing.model && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-white/10">
                        <span className="text-xs text-muted-foreground">Pricing Model</span>
                        <p className="text-sm font-medium capitalize mt-1">{solution.pricing.model.replace(/-/g, ' ')}</p>
                      </div>
                    )}

                    {solution.pricing.startingPrice && (
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <span className="text-xs text-muted-foreground">Starting Price</span>
                        <p className="text-lg font-bold text-primary mt-1">{solution.pricing.startingPrice}</p>
                      </div>
                    )}

                    {solution.pricing.tiers && solution.pricing.tiers.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Pricing Tiers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {solution.pricing.tiers.map((tier: any, idx: number) => (
                            <div key={idx} className="p-4 rounded-lg border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-semibold text-sm">{tier.name}</h5>
                                {tier.price && (
                                  <Badge variant="secondary" className="text-xs">{tier.price}</Badge>
                                )}
                              </div>
                              {tier.description && (
                                <p className="text-xs text-muted-foreground mb-3">{tier.description}</p>
                              )}
                              {tier.features && tier.features.length > 0 && (
                                <ul className="space-y-1">
                                  {tier.features.slice(0, 5).map((feature: string, fIdx: number) => (
                                    <li key={fIdx} className="text-xs flex items-start gap-1">
                                      <span className="text-primary">✓</span>
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted/50 p-6 mb-4">
                      <DollarSign className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No pricing information available for this solution
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="technical" className="mt-0 space-y-6">
                {solution.technicalSpecs ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold">Technical Specifications</h3>
                    </div>

                    {solution.technicalSpecs.supportedPlatforms?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Supported Platforms</h4>
                        <div className="flex flex-wrap gap-2">
                          {solution.technicalSpecs.supportedPlatforms.map((platform: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {solution.technicalSpecs.apiCapabilities?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">API & Integrations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {solution.technicalSpecs.apiCapabilities.map((api: string, idx: number) => (
                            <div key={idx} className="p-3 rounded border bg-card/50 text-sm">
                              {api}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {solution.technicalSpecs.securityFeatures?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Security & Compliance</h4>
                        <div className="flex flex-wrap gap-2">
                          {solution.technicalSpecs.securityFeatures.map((security: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-green-500/30 text-green-600">
                              {security}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted/50 p-6 mb-4">
                      <Wrench className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No technical specifications available
                    </p>
                  </div>
                )}

                {solution.integrations?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Available Integrations
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {solution.integrations.map((integration: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border bg-card/30 backdrop-blur-sm hover:bg-card/60 transition-all text-center">
                          <span className="text-sm font-medium">
                            {typeof integration === 'string' ? integration : integration.name}
                          </span>
                        </div>
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
