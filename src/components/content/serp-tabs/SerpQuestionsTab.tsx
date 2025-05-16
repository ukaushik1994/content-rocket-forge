
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SerpQuestionsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsTab({ serpData, onAddToContent = () => {} }: SerpQuestionsTabProps) {
  if (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No FAQ data available for this search.</p>
        <p className="text-xs mt-2">Try searching for a different keyword with more question intent.</p>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">People Also Ask (FAQs)</h3>
        {serpData.peopleAlsoAsk && (
          <Badge variant="outline" className="bg-amber-900/20 border-amber-500/30 text-amber-300">
            {serpData.peopleAlsoAsk.length} Questions
          </Badge>
        )}
      </div>

      {hasMultipleRegions ? (
        // Render questions grouped by region
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
            <Card key={region} className="mb-4 overflow-hidden border-amber-500/20">
              <CardHeader className="py-2 px-4 bg-amber-950/30 border-b border-amber-500/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {regionLabel} Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-amber-500/10">
                {questions.map((item, index) => (
                  <div key={`${region}-${index}`} className="p-4 hover:bg-amber-950/10 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm">{item.question}</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => onAddToContent(item.question, 'question')}
                        className="hover:bg-amber-900/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
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
              </CardContent>
            </Card>
          );
        })
      ) : (
        // Render all questions without region grouping
        <div className="grid grid-cols-1 gap-3">
          {serpData.peopleAlsoAsk.map((item, index) => {
            const questionText = typeof item === 'string' ? item : item.question;
            
            return (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border-amber-500/20">
                <CardContent className="p-0">
                  <div className="flex justify-between items-center p-4">
                    <p className="font-medium text-sm">{questionText}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onAddToContent(questionText, 'question')}
                      className="hover:bg-amber-900/30"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {item.answer && (
                    <div className="px-4 pb-4 pt-0 text-xs text-muted-foreground bg-amber-950/10 border-t border-amber-500/10">
                      <p className="text-[10px] uppercase text-amber-500/70 mb-1">Answer:</p>
                      {item.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
