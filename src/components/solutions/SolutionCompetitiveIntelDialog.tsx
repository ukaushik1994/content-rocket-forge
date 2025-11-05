import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Star, Users as UsersIcon } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface SolutionCompetitiveIntelDialogProps {
  solution: EnhancedSolution;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SolutionCompetitiveIntelDialog({
  solution,
  open,
  onOpenChange
}: SolutionCompetitiveIntelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Competitive Intelligence: {solution.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="positioning" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="positioning">Positioning</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="positioning" className="space-y-4">
              {/* Positioning Statement */}
              {solution.positioningStatement && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Positioning Statement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                      "{solution.positioningStatement}"
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Unique Value Propositions */}
              {solution.uniqueValuePropositions && solution.uniqueValuePropositions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Unique Value Propositions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.uniqueValuePropositions.map((uvp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-primary font-bold mt-0.5">✓</span>
                          <span>{uvp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Key Differentiators */}
              {solution.keyDifferentiators && solution.keyDifferentiators.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Differentiators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {solution.keyDifferentiators.map((diff, idx) => (
                        <Badge key={idx} variant="default" className="bg-primary/10 text-primary border-primary/30">
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!solution.positioningStatement && 
               (!solution.uniqueValuePropositions || solution.uniqueValuePropositions.length === 0) && 
               (!solution.keyDifferentiators || solution.keyDifferentiators.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Positioning Data Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit the solution to add competitive positioning information
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4">
              {solution.marketData && Object.keys(solution.marketData).length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Market Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {solution.marketData.size && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Market Size</p>
                          <p className="text-sm font-medium">{solution.marketData.size}</p>
                        </div>
                      )}
                      {solution.marketData.growthRate && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Growth Rate</p>
                          <p className="text-sm font-medium text-green-500">{solution.marketData.growthRate}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {solution.marketData.geographicAvailability && solution.marketData.geographicAvailability.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Geographic Availability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {solution.marketData.geographicAvailability.map((geo, idx) => (
                            <Badge key={idx} variant="outline">{geo}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {solution.marketData.complianceRequirements && solution.marketData.complianceRequirements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Compliance & Certifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {solution.marketData.complianceRequirements.map((comp, idx) => (
                            <Badge key={idx} className="bg-blue-500/10 text-blue-500">{comp}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Market Data Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit the solution to add market intelligence information
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              {solution.metrics && Object.keys(solution.metrics).filter(k => solution.metrics && solution.metrics[k as keyof typeof solution.metrics]).length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {solution.metrics.adoptionRate && (
                        <div className="text-center p-4 border border-border/50 rounded-lg">
                          <p className="text-3xl font-bold text-primary mb-1">{solution.metrics.adoptionRate}</p>
                          <p className="text-xs text-muted-foreground">Adoption Rate</p>
                        </div>
                      )}
                      {solution.metrics.customerSatisfaction && (
                        <div className="text-center p-4 border border-border/50 rounded-lg">
                          <p className="text-3xl font-bold text-green-500 mb-1">{solution.metrics.customerSatisfaction}</p>
                          <p className="text-xs text-muted-foreground">Customer Satisfaction</p>
                        </div>
                      )}
                      {solution.metrics.roi && (
                        <div className="text-center p-4 border border-border/50 rounded-lg">
                          <p className="text-3xl font-bold text-orange-500 mb-1">{solution.metrics.roi}</p>
                          <p className="text-xs text-muted-foreground">ROI</p>
                        </div>
                      )}
                      {solution.metrics.implementationTime && (
                        <div className="text-center p-4 border border-border/50 rounded-lg">
                          <p className="text-3xl font-bold text-blue-500 mb-1">{solution.metrics.implementationTime}</p>
                          <p className="text-xs text-muted-foreground">Implementation Time</p>
                        </div>
                      )}
                      {solution.metrics.supportResponse && (
                        <div className="text-center p-4 border border-border/50 rounded-lg">
                          <p className="text-3xl font-bold text-purple-500 mb-1">{solution.metrics.supportResponse}</p>
                          <p className="text-xs text-muted-foreground">Support Response</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Metrics Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit the solution to add performance metrics and social proof
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="competitors" className="space-y-4">
              {solution.competitors && solution.competitors.length > 0 ? (
                solution.competitors.map((competitor, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">{competitor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {competitor.strengths && competitor.strengths.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Strengths</p>
                          <ul className="space-y-1">
                            {competitor.strengths.map((strength, sIdx) => (
                              <li key={sIdx} className="text-sm flex items-start gap-2">
                                <span className="text-green-500">+</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Weaknesses</p>
                          <ul className="space-y-1">
                            {competitor.weaknesses.map((weakness, wIdx) => (
                              <li key={wIdx} className="text-sm flex items-start gap-2">
                                <span className="text-red-500">-</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(competitor.marketShare || competitor.pricing) && (
                        <div className="flex gap-4 pt-2 border-t border-border/50">
                          {competitor.marketShare && (
                            <div>
                              <p className="text-xs text-muted-foreground">Market Share</p>
                              <p className="text-sm font-medium">{competitor.marketShare}</p>
                            </div>
                          )}
                          {competitor.pricing && (
                            <div>
                              <p className="text-xs text-muted-foreground">Pricing</p>
                              <p className="text-sm font-medium">{competitor.pricing}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No Competitor Data Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Edit the solution to add competitive analysis information
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
