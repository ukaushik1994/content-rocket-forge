
import React from 'react';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, Search, Code, BarChart, FileText, Zap, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSolutionsData } from '@/components/solutions/hooks/useSolutionsData';

interface SimpleSolutionOptionsProps {
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onClearSelection: () => void;
}

// Helper function to get appropriate icon based on solution category
const getSolutionIcon = (solution: Solution) => {
  switch (solution.category?.toLowerCase()) {
    case 'seo':
      return <Search className="h-4 w-4 text-primary flex-shrink-0" />;
    case 'development':
      return <Code className="h-4 w-4 text-primary flex-shrink-0" />;
    case 'analytics':
      return <BarChart className="h-4 w-4 text-primary flex-shrink-0" />;
    case 'content':
      return <FileText className="h-4 w-4 text-primary flex-shrink-0" />;
    case 'marketing':
      return <Zap className="h-4 w-4 text-primary flex-shrink-0" />;
    case 'data':
      return <Database className="h-4 w-4 text-primary flex-shrink-0" />;
    default:
      return <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />;
  }
};

export const SimpleSolutionOptions: React.FC<SimpleSolutionOptionsProps> = ({
  selectedSolution,
  onSolutionSelect,
  onClearSelection
}) => {
  const { solutions, isLoading, error, fetchSolutions } = useSolutionsData();

  // Fetch solutions on component mount
  React.useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // If we have no solutions from the API, fall back to mock data
  const displaySolutions = solutions.length > 0 ? solutions : [
    {
      id: '1',
      name: 'Content Optimizer Pro',
      description: '',
      features: ['AI content generation', 'Keyword optimization', 'Readability analysis'],
      painPoints: ['Poor content quality', 'Time-consuming content creation', 'Low search rankings'],
      useCases: [],
      targetAudience: [],
      category: 'seo',
      logoUrl: null,
      externalUrl: null,
      resources: []
    },
    {
      id: '2',
      name: 'SEO Wizard',
      description: '',
      features: ['Keyword research', 'Competitor analysis', 'Backlink tracking'],
      painPoints: ['Low organic traffic', 'Poor keyword targeting', 'Limited SEO knowledge'],
      useCases: [],
      targetAudience: [],
      category: 'seo',
      logoUrl: null,
      externalUrl: null,
      resources: []
    }
  ];

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Solution Options</h3>
          {selectedSolution && (
            <button 
              onClick={onClearSelection}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displaySolutions.map((solution) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0.9, scale: 0.95 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className={`cursor-pointer`}
              onClick={() => onSolutionSelect(solution)}
            >
              <div 
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                  selectedSolution?.id === solution.id 
                    ? 'bg-primary/20 hover:bg-primary/30 border border-primary/40' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="w-12 h-12 mb-2 rounded-full bg-white/10 flex items-center justify-center">
                  {solution.logoUrl ? (
                    <img 
                      src={solution.logoUrl} 
                      alt={solution.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center`}>
                      {selectedSolution?.id === solution.id ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        getSolutionIcon(solution)
                      )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-center truncate w-full">{solution.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
