
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, ExternalLink, Building2, Check } from 'lucide-react';
import { Solution, EnhancedSolution } from '@/contexts/content-builder/types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Helper function to safely convert Json to string array
const jsonToStringArray = (jsonValue: any): string[] => {
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
  }
  return [];
};

export const SolutionSelector = () => {
  const { state, dispatch } = useContentBuilder();
  const { selectedSolution } = state;
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        // Transform the data from jsonb columns to the expected format with validation
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
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"],
        category: "Business Solution",
        logoUrl: null,
        externalUrl: null,
        resources: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSolution = (solution: EnhancedSolution) => {
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
    toast.success(`Selected solution: ${solution.name}`);
  };

  const handleNavigateToSolutions = () => {
    navigate('/solutions');
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
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Choose Your Solution</h3>
          <p className="text-sm text-white/70">
            Select the solution you want to create content for
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleNavigateToSolutions}
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage Solutions
        </Button>
      </div>

      {solutions.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">No Solutions Found</h4>
            <p className="text-sm text-white/70 mb-4">
              You need to add solutions before creating content.
            </p>
            <Button onClick={handleNavigateToSolutions}>
              Add Your First Solution
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
            {solutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative cursor-pointer transition-all duration-200 ${
                        selectedSolution?.id === solution.id 
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                          : ''
                      }`}
                      onClick={() => handleSelectSolution(solution)}
                    >
                      <Avatar className="h-16 w-16 rounded-full border-2 border-white/20 hover:border-primary/50 transition-colors">
                        {solution.logoUrl ? (
                          <AvatarImage 
                            src={solution.logoUrl} 
                            alt={solution.name}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-white font-semibold text-lg">
                            {getInitials(solution.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      {selectedSolution?.id === solution.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center border-2 border-background"
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-popover border border-border max-w-md">
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-foreground">{solution.name}</p>
                        <p className="text-xs text-muted-foreground">{solution.category}</p>
                      </div>
                      
                      {solution.positioningStatement && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2">
                          "{solution.positioningStatement}"
                        </p>
                      )}
                      
                      {solution.metrics && (
                        <div className="flex gap-2">
                          {solution.metrics.customerSatisfaction && (
                            <Badge variant="outline" className="text-xs">
                              ⭐ {solution.metrics.customerSatisfaction}
                            </Badge>
                          )}
                          {solution.metrics.adoptionRate && (
                            <Badge variant="outline" className="text-xs">
                              👥 {solution.metrics.adoptionRate}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {solution.features && solution.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {solution.features.slice(0, 3).map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                          {solution.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{solution.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
};
