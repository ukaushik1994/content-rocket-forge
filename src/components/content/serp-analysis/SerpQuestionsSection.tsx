
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Link, PlusCircle, Filter, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SerpActionButton } from './SerpActionButton';
import { SerpFeedbackButton } from './SerpFeedbackButton';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpQuestionsSection({
  serpData,
  expanded,
  onAddToContent
}: SerpQuestionsSectionProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [accordionValues, setAccordionValues] = useState<string[]>([]);
  
  if (!expanded) return null;

  const toggleQuestionSelection = (question: string) => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
      toast.success(`Added "${question}" to selection`, {
        description: "Click 'Add Selected Questions' to add them to your content"
      });
    }
  };

  const addSelectedQuestions = () => {
    if (selectedQuestions.length === 0) {
      toast.error("No questions selected");
      return;
    }
    
    const selectedQuestionsData = serpData.peopleAlsoAsk?.filter(
      item => selectedQuestions.includes(item.question)
    ) || [];
    
    const questionsText = selectedQuestionsData.map(item => 
      `### ${item.question}\n${item.answer || 'No answer available'}\n\n`
    ).join('');
    
    onAddToContent(`## Frequently Asked Questions\n\n${questionsText}`, 'selectedFAQs');
    toast.success(`Added ${selectedQuestions.length} questions to your content`);
  };

  if (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) {
    return (
      <div className="py-8 text-center bg-white/5 rounded-lg border border-white/10">
        <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground">No questions data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Selected counter */}
      {selectedQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 p-2 rounded-lg flex justify-between items-center">
          <span className="text-sm">
            <span className="text-purple-300 font-medium">{selectedQuestions.length}</span> questions selected
          </span>
          <Button
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs"
            onClick={() => setSelectedQuestions([])}
          >
            Clear
          </Button>
        </div>
      )}
      
      <div className="space-y-4 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-purple-900/10 p-4 rounded-xl border border-white/10">
        <AnimatePresence mode="popLayout">
          {serpData.peopleAlsoAsk.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <div className={`
                mb-2 rounded-lg overflow-hidden border 
                ${selectedQuestions.includes(item.question) 
                  ? 'border-purple-500/30 bg-purple-900/20' 
                  : 'border-white/10 hover:border-white/20 bg-white/5'}
                transition-all duration-300
              `}>
                <div 
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => {
                    const value = `item-${index}`;
                    if (accordionValues.includes(value)) {
                      setAccordionValues(accordionValues.filter(v => v !== value));
                    } else {
                      setAccordionValues([...accordionValues, value]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <HelpCircle className={`h-4 w-4 ${selectedQuestions.includes(item.question) ? 'text-purple-400' : 'text-primary'}`} />
                    <span className="text-sm font-medium">{item.question}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${selectedQuestions.includes(item.question) ? 'bg-purple-500/30' : 'bg-white/5'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestionSelection(item.question);
                    }}
                  >
                    {selectedQuestions.includes(item.question) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {accordionValues.includes(`item-${index}`) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 p-4"
                  >
                    <div className="text-sm space-y-3">
                      <p className="text-muted-foreground">{item.answer || 'No answer available'}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        {item.source && (
                          <a 
                            href={item.source} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-1 hover:underline text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link className="h-3 w-3" />
                            Source
                          </a>
                        )}
                        
                        <SerpFeedbackButton
                          itemType="question"
                          itemContent={item.question}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col gap-2">
        <SerpActionButton
          onClick={addSelectedQuestions}
          className={`${selectedQuestions.length === 0 ? 'opacity-50' : ''} bg-gradient-to-r from-purple-600/20 to-purple-900/10 border-purple-500/20 hover:border-purple-500/40`}
          variant="outline"
          icon={<MessageCircle className="h-4 w-4 mr-2" />}
          disabled={selectedQuestions.length === 0}
        >
          Add {selectedQuestions.length} Selected Questions
        </SerpActionButton>
        
        <SerpActionButton
          variant="outline"
          onClick={() => {
            const allQuestions = serpData.peopleAlsoAsk?.map(item => 
              `### ${item.question}\n${item.answer || 'No answer available'}\n\n`
            ).join('');
            onAddToContent(`## Frequently Asked Questions\n\n${allQuestions}`, 'faqSection');
            toast.success('Added complete FAQ section');
          }}
          className="bg-gradient-to-r from-indigo-600/20 to-indigo-900/10 border-indigo-500/20 hover:border-indigo-500/40 mt-2"
          icon={<HelpCircle className="h-4 w-4 mr-2" />}
        >
          Add Complete FAQ Section
        </SerpActionButton>
      </div>
    </motion.div>
  );
}
