
import React from 'react';
import { Solution } from '@/contexts/content-builder/types/solution-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  Sparkles, 
  Search, 
  Code, 
  BarChart, 
  FileText, 
  Zap, 
  Database, 
  Globe,
  PieChart,
  Briefcase,
  LineChart,
  BookOpen,
  Mail,
  Image,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSolutionsData } from '@/components/solutions/hooks/useSolutionsData';

interface SimpleSolutionOptionsProps {
  selectedSolution: Solution | null;
  onSolutionSelect: (solution: Solution) => void;
  onClearSelection: () => void;
}

// Enhanced helper function to get appropriate icon based on solution category
const getSolutionIcon = (solution: Solution) => {
  const category = solution.category?.toLowerCase() || '';
  
  switch (category) {
    case 'seo':
      return <Search className="h-5 w-5 text-primary" />;
    case 'development':
      return <Code className="h-5 w-5 text-primary" />;
    case 'analytics':
      return <BarChart className="h-5 w-5 text-primary" />;
    case 'content':
      return <FileText className="h-5 w-5 text-primary" />;
    case 'marketing':
      return <Zap className="h-5 w-5 text-primary" />;
    case 'data':
      return <Database className="h-5 w-5 text-primary" />;
    case 'social':
    case 'social media':
      return <Users className="h-5 w-5 text-primary" />;
    case 'web':
    case 'website':
      return <Globe className="h-5 w-5 text-primary" />;
    case 'research':
      return <BookOpen className="h-5 w-5 text-primary" />;
    case 'email':
    case 'email marketing':
      return <Mail className="h-5 w-5 text-primary" />;
    case 'design':
    case 'visual':
      return <Image className="h-5 w-5 text-primary" />;
    case 'business':
    case 'business solution':
      return <Briefcase className="h-5 w-5 text-primary" />;
    case 'reporting':
      return <PieChart className="h-5 w-5 text-primary" />;
    case 'performance':
      return <LineChart className="h-5 w-5 text-primary" />;
    default:
      return <Sparkles className="h-5 w-5 text-primary" />;
  }
};

// Helper to generate gradient colors based on solution name
const getSolutionGradient = (name: string): string => {
  // Create a deterministic but varied gradient based on solution name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
  
  const gradients = [
    'from-neon-purple to-neon-blue', 
    'from-red-500 to-orange-400',
    'from-green-500 to-emerald-400',
    'from-blue-500 to-cyan-400',
    'from-purple-500 to-pink-400',
    'from-amber-500 to-yellow-400',
    'from-indigo-500 to-violet-400',
    'from-rose-500 to-red-400',
    'from-teal-500 to-green-400',
    'from-fuchsia-500 to-purple-400'
  ];
  
  return gradients[hash];
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

  // Get initials from solution name for the avatar
  const getInitials = (name: string): string => {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <span className="bg-gradient-to-r from-neon-purple to-neon-blue h-2 w-2 rounded-full"></span>
            Solution Options
          </h3>
          {selectedSolution && (
            <button 
              onClick={onClearSelection}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displaySolutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0.9, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="cursor-pointer"
                onClick={() => onSolutionSelect(solution)}
              >
                <div 
                  className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                    selectedSolution?.id === solution.id 
                      ? 'bg-primary/20 hover:bg-primary/30 border border-primary/40' 
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="w-12 h-12 mb-2 rounded-full flex items-center justify-center">
                    {solution.logoUrl ? (
                      <img 
                        src={solution.logoUrl} 
                        alt={solution.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSolutionGradient(solution.name)} flex items-center justify-center`}>
                        {selectedSolution?.id === solution.id ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : solution.category ? (
                          getSolutionIcon(solution)
                        ) : (
                          <span className="text-sm font-bold text-white">{getInitials(solution.name)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-center truncate w-full font-medium">
                    {solution.name}
                  </span>
                  {solution.category && (
                    <Badge variant="outline" className="mt-1 text-[10px] h-4 px-1 bg-transparent">
                      {solution.category}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {displaySolutions.length === 0 && !isLoading && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No solutions available</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-red-500">Error loading solutions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
