import React from 'react';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimpleSolutionOptionsProps {
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onClearSelection: () => void;
}

// Mock solutions for demonstration (keep same as original)
const mockSolutions: Solution[] = [
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

export const SimpleSolutionOptions: React.FC<SimpleSolutionOptionsProps> = ({
  selectedSolution,
  onSolutionSelect,
  onClearSelection
}) => {
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
        
        <div className="flex gap-2">
          {mockSolutions.map((solution) => (
            <motion.div
              key={solution.id}
              initial={{ opacity: 0.9, scale: 0.95 }}
              whileHover={{ opacity: 1, scale: 1.05 }}
              className={`flex-1 cursor-pointer`}
              onClick={() => onSolutionSelect(solution)}
            >
              <Badge 
                className={`w-full py-2 px-3 justify-center items-center gap-1 flex ${
                  selectedSolution?.id === solution.id 
                    ? 'bg-primary/20 hover:bg-primary/30 border-primary/40' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                {selectedSolution?.id === solution.id && (
                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                )}
                <span className="truncate">{solution.name}</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
