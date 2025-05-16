
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    // Pattern to match country/region prefixes, handling both formats:
    // "US: Question" or "Global: Question"
    const globalMatch = item.question.match(/^(Global):\s*(.*)/i);
    const meaMatch = item.question.match(/^(MEA):\s*(.*)/i);
    const countryMatch = item.question.match(/^([A-Z]{2}):\s*(.*)/i);
    
    let regionKey = 'global'; // Default
    let actualQuestion = item.question;
    
    if (globalMatch) {
      regionKey = 'global';
      actualQuestion = globalMatch[2].trim();
    } else if (meaMatch) {
      regionKey = 'mea';
      actualQuestion = meaMatch[2].trim();
    } else if (countryMatch) {
      regionKey = countryMatch[1].toLowerCase();
      actualQuestion = countryMatch[2].trim();
    }
    
    // Initialize region array if it doesn't exist
    if (!acc[regionKey]) {
      acc[regionKey] = [];
    }
    
    // Add the question with the prefix removed
    acc[regionKey].push({
      ...item,
      question: actualQuestion
    });
    
    return acc;
  }, {});
  
  const hasMultipleRegions = Object.keys(questionsByRegion).length > 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center">
          FAQ Questions ({serpData.peopleAlsoAsk.length})
        </h3>
      </div>
      
      {/* If we have grouped questions by region, display them in separate cards */}
      {hasMultipleRegions ? (
        Object.entries(questionsByRegion).map(([region, questions]) => {
          // Format the region label for display
          let regionLabel: string;
          switch(region.toLowerCase()) {
            case 'mea': 
              regionLabel = 'MEA'; 
              break;
            case 'global': 
              regionLabel = 'Global'; 
              break;
            default:
              regionLabel = region.toUpperCase();
          }
          
          return (
            <Card key={region} className="bg-amber-900/10 border-amber-500/20">
              <CardHeader className="py-2 px-4 border-b border-amber-500/10">
                <CardTitle className="text-xs font-medium">{regionLabel} Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-2 grid gap-2">
                {questions.map((item, index) => (
                  <div 
                    key={`${region}-${index}`} 
                    className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-amber-200">{item.question}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
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
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      ) : (
        // If no country grouping, show questions in a simpler format
        <div className="grid gap-2">
          {serpData.peopleAlsoAsk.map((item, index) => {
            const questionText = typeof item === 'string' ? item : item.question;
            
            return (
              <div
                key={index}
                className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-amber-200">{questionText}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-950/50"
                    onClick={() => onAddToContent(questionText, 'question')}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {item.answer && (
                  <div className="mt-2 text-xs text-muted-foreground bg-white/5 p-2 rounded">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
