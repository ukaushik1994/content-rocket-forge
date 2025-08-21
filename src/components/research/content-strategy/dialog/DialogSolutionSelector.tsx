import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Building2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution } from '@/contexts/content-builder/types';
import { toast } from '@/hooks/use-toast';

interface DialogSolutionSelectorProps {
  selectedSolution: EnhancedSolution | null;
  onSolutionSelect: (solution: EnhancedSolution) => void;
  proposal: any;
}

export function DialogSolutionSelector({ 
  selectedSolution, 
  onSolutionSelect, 
  proposal 
}: DialogSolutionSelectorProps) {
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        const formattedSolutions: EnhancedSolution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) 
            ? solution.features.map(f => String(f)) 
            : [],
          useCases: Array.isArray(solution.use_cases) 
            ? solution.use_cases.map(u => String(u)) 
            : [],
          painPoints: Array.isArray(solution.pain_points) 
            ? solution.pain_points.map(p => String(p)) 
            : [],
          targetAudience: Array.isArray(solution.target_audience) 
            ? solution.target_audience.map(t => String(t)) 
            : [],
          description: `${solution.name} - Business Solution`,
          category: solution.category || "Business Solution",
          logoUrl: solution.logo_url,
          externalUrl: solution.external_url,
          resources: Array.isArray(solution.resources) 
            ? solution.resources.map((resource, index) => {
                if (typeof resource === 'object' && resource !== null && 'title' in resource && 'url' in resource) {
                  return {
                    id: String(resource.id || `resource-${index}`),
                    title: String(resource.title || ''),
                    url: String(resource.url || ''),
                    category: String(resource.category || 'other') as any,
                    order: index
                  };
                }
                return {
                  id: `resource-${index}`,
                  title: '',
                  url: '',
                  category: 'other' as const,
                  order: index
                };
              }).filter(r => r.title && r.url)
            : []
        }));
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
      toast({
        title: "Error",
        description: "Failed to load solutions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSolution = (solution: EnhancedSolution) => {
    onSolutionSelect(solution);
    toast({
      title: "Solution Selected",
      description: `Selected ${solution.name} for content creation`
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Your Solution</h3>
        <p className="text-muted-foreground">
          Choose the solution you want to feature in the content for "{proposal?.primary_keyword || 'this strategy'}"
        </p>
      </div>

      {solutions.length === 0 ? (
        <Card className="text-center p-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">No Solutions Found</h4>
          <p className="text-muted-foreground mb-4">
            You need to add solutions before creating content.
          </p>
          <Button onClick={() => window.open('/solutions', '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage Solutions
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {solutions.map((solution) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSolution?.id === solution.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelectSolution(solution)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 rounded-lg border">
                      {solution.logoUrl ? (
                        <AvatarImage 
                          src={solution.logoUrl} 
                          alt={solution.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="rounded-lg font-medium">
                          {getInitials(solution.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold truncate">{solution.name}</h4>
                        {selectedSolution?.id === solution.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {solution.description}
                      </p>
                      
                      <div className="space-y-2">
                        {solution.features.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-primary">Features:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {solution.features.slice(0, 2).map((feature, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                              {solution.features.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{solution.features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {solution.targetAudience.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-primary">Target:</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {solution.targetAudience.slice(0, 2).join(', ')}
                              {solution.targetAudience.length > 2 ? '...' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}