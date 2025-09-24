import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Lightbulb, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Solution {
  id: string;
  name: string;
  description: string;
  features?: string[];
  category?: string;
}

interface SolutionSuggestionsProps {
  query: string;
  onSolutionSelect: (solution: Solution, action: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export const SolutionSuggestions: React.FC<SolutionSuggestionsProps> = ({
  query,
  onSolutionSelect,
  onSuggestionClick
}) => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('solutions')
          .select('id, name, description, features, category')
          .eq('user_id', user.id)
          .limit(10);

        if (error) throw error;
        
        // Transform the data to ensure features is always string[]
        const transformedData = (data || []).map(solution => ({
          ...solution,
          features: Array.isArray(solution.features) 
            ? solution.features.filter((f): f is string => typeof f === 'string')
            : typeof solution.features === 'string' 
              ? [solution.features]
              : []
        }));
        
        setSolutions(transformedData);
      } catch (error) {
        console.error('Error fetching solutions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolutions();
  }, [user]);

  // Filter solutions based on query with fuzzy matching
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setFilteredSolutions([]);
      return;
    }

    const fuzzyMatch = (text: string, search: string): boolean => {
      const searchLower = search.toLowerCase().replace(/\s+/g, '');
      const textLower = text.toLowerCase().replace(/\s+/g, '');
      
      // Exact match
      if (textLower.includes(searchLower)) return true;
      
      // Fuzzy match for common variations
      const variations = [
        text.toLowerCase(),
        text.toLowerCase().replace(/\s+/g, ''),
        text.toLowerCase().replace('connect', ''),
        text.toLowerCase().replace(' connect', ''),
      ];
      
      return variations.some(variation => 
        variation.includes(searchLower) || 
        searchLower.includes(variation.replace(/\s+/g, ''))
      );
    };

    const filtered = solutions.filter(solution => 
      fuzzyMatch(solution.name, query) ||
      fuzzyMatch(solution.description, query) ||
      solution.features?.some(feature => fuzzyMatch(feature, query)) ||
      fuzzyMatch(solution.category || '', query)
    );

    setFilteredSolutions(filtered);
  }, [query, solutions]);

  // Generate contextual suggestions based on detected solutions
  const generateSuggestions = (): string[] => {
    if (filteredSolutions.length === 0) return [];

    const suggestions = [];
    
    filteredSolutions.forEach(solution => {
      suggestions.push(`Tell me more about ${solution.name}`);
      suggestions.push(`How does ${solution.name} help with ${solution.features?.[0] || 'business needs'}?`);
      suggestions.push(`Create a content strategy for ${solution.name}`);
      
      // Cross-solution suggestions
      if (solution.name.toLowerCase().includes('connect')) {
        const otherConnectSolutions = filteredSolutions.filter(s => 
          s.id !== solution.id && s.name.toLowerCase().includes('connect')
        );
        if (otherConnectSolutions.length > 0) {
          suggestions.push(`Compare ${solution.name} with ${otherConnectSolutions[0].name}`);
        }
      }
    });

    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const suggestions = generateSuggestions();

  if (!query.trim() || query.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 z-50 mt-2"
      >
        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
          <CardContent className="p-3">
            {/* Solution Matches */}
            {filteredSolutions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Solutions Found</span>
                </div>
                <div className="space-y-2">
                  {filteredSolutions.slice(0, 3).map((solution) => (
                    <motion.div
                      key={solution.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{solution.name}</span>
                          {solution.category && (
                            <Badge variant="secondary" className="text-xs">
                              {solution.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {solution.description}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSolutionSelect(solution, 'analyze')}
                          className="h-7 px-2 text-xs"
                        >
                          Analyze
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSolutionSelect(solution, 'create-content')}
                          className="h-7 px-2 text-xs"
                        >
                          Content
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestionClick(suggestion)}
                      className="h-7 text-xs justify-start"
                    >
                      {suggestion}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* No matches */}
            {filteredSolutions.length === 0 && !isLoading && (
              <div className="text-center text-sm text-muted-foreground py-2">
                No solutions found matching "{query}"
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};