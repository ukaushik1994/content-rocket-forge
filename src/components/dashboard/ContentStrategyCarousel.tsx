import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Lightbulb, TrendingUp, Target, Calendar, Eye, FileText } from 'lucide-react';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { useNavigate } from 'react-router-dom';

export const ContentStrategyCarousel = () => {
  const { aiProposals } = useContentStrategy();
  const navigate = useNavigate();
  const [displayProposals, setDisplayProposals] = useState<any[]>([]);

  useEffect(() => {
    if (aiProposals && aiProposals.length > 0) {
      // Take first 6 proposals for the carousel
      setDisplayProposals(aiProposals.slice(0, 6));
    }
  }, [aiProposals]);

  if (!displayProposals || displayProposals.length === 0) {
    return null;
  }

  const handleViewStrategy = () => {
    navigate('/research/content-strategy#strategies');
  };

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="relative"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary/30 to-blue-500/30 flex items-center justify-center backdrop-blur-xl border border-white/10">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Content Strategy Insights
            </h2>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewStrategy}
            className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            View All Strategies
          </Button>
        </div>

        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {displayProposals.map((proposal, index) => (
                <CarouselItem key={proposal.primary_keyword || index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold leading-tight mb-2 line-clamp-2">
                              {proposal.primary_keyword || 'Content Strategy'}
                            </CardTitle>
                            {proposal.search_volume && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                {proposal.search_volume} searches/mo
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {proposal.content_type || 'Article'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        {proposal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {proposal.description}
                          </p>
                        )}
                        
                        {proposal.target_audience && (
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">
                              {proposal.target_audience}
                            </span>
                          </div>
                        )}

                        {proposal.keywords && proposal.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {proposal.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {proposal.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{proposal.keywords.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {proposal.estimated_timeline && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {proposal.estimated_timeline}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-12" />
            <CarouselNext className="hidden sm:flex -right-12" />
          </Carousel>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={handleViewStrategy}
            className="text-primary hover:text-primary/80"
          >
            <FileText className="mr-2 h-4 w-4" />
            Explore Full Content Strategy Workspace
          </Button>
        </div>
      </div>
    </motion.section>
  );
};