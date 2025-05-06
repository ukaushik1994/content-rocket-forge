
import React from 'react';
import { KeywordUsageSummaryCard } from '../KeywordUsageSummaryCard';
import { TitleSuggestionsCard } from '../TitleSuggestionsCard';
import { FinalChecklistCard } from '../FinalChecklistCard';
import { Button } from '@/components/ui/button';
import { Solution, SolutionIntegrationMetrics } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OptimizeTabProps {
  keywordUsage: { keyword: string; count: number; density: string }[];
  mainKeyword: string;
  selectedKeywords: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
  solutionIntegrationMetrics: SolutionIntegrationMetrics | null;
  selectedSolution: Solution | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  titleSuggestions: string[];
  isGeneratingTitles: boolean;
  onGenerateTitleSuggestions: () => void;
  completionPercentage: number;
}

export const OptimizeTab = ({
  keywordUsage,
  mainKeyword,
  selectedKeywords,
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta,
  solutionIntegrationMetrics,
  selectedSolution,
  isAnalyzing,
  onAnalyze,
  titleSuggestions,
  isGeneratingTitles,
  onGenerateTitleSuggestions,
  completionPercentage
}: OptimizeTabProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Main optimization area */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div variants={item} className="bg-card rounded-lg border border-purple-500/20 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-purple-500 h-2 w-2 rounded-full"></span>
                Optimization Progress
              </h3>
              <p className="text-sm text-muted-foreground">Track your content's improvement</p>
            </div>
            
            {completionPercentage >= 100 && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Fully Optimized
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            
            <Progress
              value={completionPercentage} 
              className="h-2.5 bg-purple-500/10" 
            />
          </div>
        </motion.div>
        
        <motion.div variants={item}>
          <TitleSuggestionsCard 
            currentTitle={metaTitle}
            mainKeyword={mainKeyword}
            selectedKeywords={selectedKeywords}
            onSelectTitle={onMetaTitleChange}
            generateNewTitles={onGenerateTitleSuggestions}
            suggestions={titleSuggestions}
            isGenerating={isGeneratingTitles}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <KeywordUsageSummaryCard 
            keywordUsage={keywordUsage} 
            mainKeyword={mainKeyword}
            selectedKeywords={selectedKeywords}
          />
        </motion.div>
      </div>
      
      {/* Side panel */}
      <motion.div variants={item} className="space-y-6">
        {/* Quick actions specific to optimization */}
        <div className="bg-card border border-purple-500/20 rounded-lg p-6 shadow-md">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Button 
              onClick={onGenerateTitleSuggestions} 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isGeneratingTitles}
            >
              Generate Better Titles
            </Button>
            <Button 
              onClick={onAnalyze} 
              className="w-full" 
              variant="outline" 
              disabled={isAnalyzing}
            >
              Analyze Content Structure
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
