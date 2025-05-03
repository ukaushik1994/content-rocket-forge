
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpQuestionsSectionProps) {
  const [expandedQuestion, setExpandedQuestion] = React.useState<number | null>(null);

  if (!expanded) return null;
  
  const questions = serpData.peopleAlsoAsk || [];
  
  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No questions available for this search term.</p>
      </motion.div>
    );
  }
  
  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-amber-500/20 shadow-lg bg-gradient-to-br from-amber-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div 
                key={index}
                className="border border-amber-500/20 rounded-lg overflow-hidden"
              >
                <div 
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-amber-900/10"
                  onClick={() => toggleQuestion(index)}
                >
                  <h4 className="text-sm font-medium flex-1">{question.question}</h4>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-amber-500/20 mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToContent(question.question, 'question');
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="text-xs">Add</span>
                    </Button>
                    {expandedQuestion === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                
                {expandedQuestion === index && question.answer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-3 pb-3 pt-1 border-t border-amber-500/10 bg-amber-900/5"
                  >
                    <p className="text-sm text-muted-foreground">{question.answer}</p>
                    {question.source && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Source: {question.source}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-amber-500/30 hover:bg-amber-500/20"
          onClick={() => {
            const allQuestions = questions.map(q => q.question).join('\n\n');
            onAddToContent(allQuestions, 'allQuestions');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all questions
        </Button>
      </div>
    </motion.div>
  );
}
