
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpQuestionsSection: React.FC<SerpQuestionsSectionProps> = ({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}) => {
  if (!expanded || !serpData?.peopleAlsoAsk?.length) return null;
  
  // Group questions by region/country if they have a country prefix
  const questionsByRegion = serpData.peopleAlsoAsk.reduce((acc: Record<string, Array<{
    question: string;
    source: string;
    answer?: string;
  }>>, item) => {
    // Check if question starts with a country code pattern (e.g., "us:", "uk:", etc.)
    const match = item.question.match(/^([a-z]{2}):\s*(.*)/i);
    
    if (match) {
      const [, country, actualQuestion] = match;
      const regionKey = country.toLowerCase();
      
      if (!acc[regionKey]) {
        acc[regionKey] = [];
      }
      
      // Add the question with the prefix removed
      acc[regionKey].push({
        ...item,
        question: actualQuestion.trim()
      });
    } else {
      // If no country prefix, put in "global" category
      if (!acc.global) {
        acc.global = [];
      }
      acc.global.push(item);
    }
    
    return acc;
  }, {});
  
  const hasMultipleRegions = Object.keys(questionsByRegion).length > 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* If we have grouped questions by region, display them in separate sections */}
      {hasMultipleRegions ? (
        Object.entries(questionsByRegion).map(([region, questions]) => (
          <div key={region} className="space-y-4">
            <h4 className="text-sm font-medium capitalize mb-1">
              {region === 'global' ? 'Global Questions' : `${region.toUpperCase()} Questions`}
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              {questions.map((item, index) => (
                <div key={`${region}-${index}`} className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-amber-300">{item.question}</h4>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-auto p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
                      onClick={() => onAddToContent(item.question, 'question')}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {item.answer && (
                    <div className="mt-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                      {item.answer}
                    </div>
                  )}
                  
                  {item.source && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Source: {item.source}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        // If no country grouping, show questions as before
        <div className="grid grid-cols-1 gap-4">
          {serpData.peopleAlsoAsk.map((item, index) => (
            <div key={index} className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-amber-300">{item.question}</h4>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-auto p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
                  onClick={() => onAddToContent(item.question, 'question')}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              
              {item.answer && (
                <div className="mt-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                  {item.answer}
                </div>
              )}
              
              {item.source && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Source: {item.source}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
