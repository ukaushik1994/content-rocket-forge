import { useState, useEffect, useMemo } from 'react';
import { Solution } from '@/contexts/content-builder/types/solution-types';

interface SolutionRecommendation {
  solution: Solution;
  score: number;
  reason: string;
  type: 'complementary' | 'alternative' | 'enhancement' | 'workflow';
}

interface SolutionRelationship {
  from: string;
  to: string;
  type: 'complements' | 'enhances' | 'integrates' | 'alternative';
  weight: number;
  description: string;
}

// Define solution relationships and complementary patterns
const SOLUTION_RELATIONSHIPS: SolutionRelationship[] = [
  {
    from: 'gl-connect',
    to: 'sql-connect',
    type: 'complements',
    weight: 0.9,
    description: 'SQL Connect enhances GL Connect with advanced data analysis capabilities'
  },
  {
    from: 'sql-connect',
    to: 'gl-connect',
    type: 'complements',
    weight: 0.9,
    description: 'GL Connect provides foundational data management for SQL Connect analysis'
  },
  {
    from: 'gl-connect',
    to: 'people-analytics',
    type: 'enhances',
    weight: 0.7,
    description: 'People Analytics can provide workforce insights to complement financial data'
  },
  {
    from: 'people-analytics',
    to: 'sql-connect',
    type: 'integrates',
    weight: 0.8,
    description: 'SQL Connect can analyze people data with advanced querying capabilities'
  }
];

export const useSolutionRecommendations = (
  currentSolutions: Solution[],
  contextSolutions: Solution[] = [],
  allSolutions: Solution[] = []
) => {
  const [recommendations, setRecommendations] = useState<SolutionRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize solution names for matching
  const normalizeName = (name: string): string => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Calculate similarity between solutions based on features, audience, etc.
  const calculateSimilarity = (solution1: Solution, solution2: Solution): number => {
    let score = 0;
    let factors = 0;

    // Feature similarity
    if (solution1.features && solution2.features) {
      const commonFeatures = solution1.features.filter(f => 
        solution2.features.some(f2 => 
          f.toLowerCase().includes(f2.toLowerCase()) || 
          f2.toLowerCase().includes(f.toLowerCase())
        )
      );
      score += (commonFeatures.length / Math.max(solution1.features.length, solution2.features.length)) * 0.4;
      factors += 0.4;
    }

    // Audience similarity
    if (solution1.targetAudience && solution2.targetAudience) {
      const commonAudience = solution1.targetAudience.filter(a => 
        solution2.targetAudience.some(a2 => 
          a.toLowerCase().includes(a2.toLowerCase()) || 
          a2.toLowerCase().includes(a.toLowerCase())
        )
      );
      score += (commonAudience.length / Math.max(solution1.targetAudience.length, solution2.targetAudience.length)) * 0.3;
      factors += 0.3;
    }

    // Category similarity
    if (solution1.category && solution2.category) {
      if (solution1.category.toLowerCase() === solution2.category.toLowerCase()) {
        score += 0.2;
      } else if (solution1.category.toLowerCase().includes(solution2.category.toLowerCase()) ||
                 solution2.category.toLowerCase().includes(solution1.category.toLowerCase())) {
        score += 0.1;
      }
      factors += 0.2;
    }

    // Use case similarity
    if (solution1.useCases && solution2.useCases) {
      const commonUseCases = solution1.useCases.filter(uc => 
        solution2.useCases.some(uc2 => 
          uc.toLowerCase().includes(uc2.toLowerCase()) || 
          uc2.toLowerCase().includes(uc.toLowerCase())
        )
      );
      score += (commonUseCases.length / Math.max(solution1.useCases.length, solution2.useCases.length)) * 0.1;
      factors += 0.1;
    }

    return factors > 0 ? score / factors : 0;
  };

  // Get relationship-based recommendations
  const getRelationshipRecommendations = (solutions: Solution[]): SolutionRecommendation[] => {
    const recs: SolutionRecommendation[] = [];
    
    solutions.forEach(solution => {
      const normalizedName = normalizeName(solution.name);
      
      SOLUTION_RELATIONSHIPS.forEach(rel => {
        if (rel.from === normalizedName) {
          const targetSolution = allSolutions.find(s => 
            normalizeName(s.name) === rel.to
          );
          
          if (targetSolution && !solutions.find(s => s.id === targetSolution.id)) {
            recs.push({
              solution: targetSolution,
              score: rel.weight,
              reason: rel.description,
              type: rel.type === 'complements' ? 'complementary' : 
                    rel.type === 'enhances' ? 'enhancement' : 
                    rel.type === 'integrates' ? 'workflow' : 'alternative'
            });
          }
        }
      });
    });
    
    return recs;
  };

  // Get similarity-based recommendations
  const getSimilarityRecommendations = (solutions: Solution[]): SolutionRecommendation[] => {
    const recs: SolutionRecommendation[] = [];
    const existingIds = new Set(solutions.map(s => s.id));
    
    solutions.forEach(currentSolution => {
      allSolutions.forEach(candidate => {
        if (!existingIds.has(candidate.id)) {
          const similarity = calculateSimilarity(currentSolution, candidate);
          
          if (similarity > 0.3) {
            const reason = similarity > 0.7 
              ? `Highly compatible with ${currentSolution.name} - shares similar features and target audience`
              : similarity > 0.5
              ? `Good synergy with ${currentSolution.name} - complementary capabilities`
              : `Moderate alignment with ${currentSolution.name} - potential workflow benefits`;
              
            recs.push({
              solution: candidate,
              score: similarity,
              reason,
              type: similarity > 0.6 ? 'complementary' : 'enhancement'
            });
          }
        }
      });
    });
    
    return recs;
  };

  const generateRecommendations = useMemo(() => {
    if (!allSolutions.length) return [];
    
    const activeSolutions = [...currentSolutions, ...contextSolutions];
    if (!activeSolutions.length) return [];

    // Get relationship-based recommendations (higher priority)
    const relationshipRecs = getRelationshipRecommendations(activeSolutions);
    
    // Get similarity-based recommendations
    const similarityRecs = getSimilarityRecommendations(activeSolutions);
    
    // Combine and deduplicate
    const allRecs = [...relationshipRecs, ...similarityRecs];
    const uniqueRecs = allRecs.reduce((acc, rec) => {
      const existing = acc.find(r => r.solution.id === rec.solution.id);
      if (!existing || existing.score < rec.score) {
        return [...acc.filter(r => r.solution.id !== rec.solution.id), rec];
      }
      return acc;
    }, [] as SolutionRecommendation[]);
    
    // Sort by score and return top recommendations
    return uniqueRecs
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [currentSolutions, contextSolutions, allSolutions]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setRecommendations(generateRecommendations);
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [generateRecommendations]);

  return {
    recommendations,
    isLoading,
    refreshRecommendations: () => {
      setRecommendations(generateRecommendations);
    }
  };
};