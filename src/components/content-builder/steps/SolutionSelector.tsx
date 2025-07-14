
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ExternalLink, Building2 } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
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
  const [solutions, setSolutions] = useState<Solution[]>([]);
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
        const formattedSolutions: Solution[] = data.map(solution => ({
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
            ? solution.resources.map(resource => {
                if (typeof resource === 'object' && resource !== null && 'title' in resource && 'url' in resource) {
                  return {
                    title: String(resource.title || ''),
                    url: String(resource.url || '')
                  };
                }
                return { title: '', url: '' };
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

  const handleSelectSolution = (solution: Solution) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map((solution) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:bg-white/10 ${
                  selectedSolution?.id === solution.id 
                    ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/50' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => handleSelectSolution(solution)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 rounded-lg border border-white/20">
                      {solution.logoUrl ? (
                        <AvatarImage 
                          src={solution.logoUrl} 
                          alt={solution.name}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="rounded-lg bg-white/10 text-white font-medium">
                          {getInitials(solution.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white truncate">{solution.name}</h4>
                        {selectedSolution?.id === solution.id && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-white/70 mb-3 line-clamp-2">
                        {solution.description}
                      </p>
                      
                      <div className="space-y-2">
                        {solution.features.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-purple-300">Features:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {solution.features.slice(0, 2).map((feature, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/30"
                                >
                                  {feature}
                                </Badge>
                              ))}
                              {solution.features.length > 2 && (
                                <span className="text-xs text-white/60">
                                  +{solution.features.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {solution.targetAudience.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-blue-300">Target:</span>
                            <span className="text-xs text-white/70 ml-1">
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
};
