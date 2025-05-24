
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsSection({ serpData, expanded, onAddToContent = () => {} }: SerpQuestionsSectionProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  
  console.log('🔍 Questions Section Debug:', {
    expanded,
    hasPeopleAlsoAsk: !!serpData?.peopleAlsoAsk,
    peopleAlsoAskLength: serpData?.peopleAlsoAsk?.length || 0,
    firstQuestion: serpData?.peopleAlsoAsk?.[0]
  });
  
  if (!expanded) return null;
  
  if (!serpData?.peopleAlsoAsk?.length) {
    return (
      <div className="p-4 text-center text-white/50">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No questions found for this keyword</p>
        <p className="text-xs mt-1">Questions help address user intent in your content</p>
      </div>
    );
  }
  
  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };
  
  // Animation variants
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
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3 py-4"
    >
      {serpData.peopleAlsoAsk.map((faq, index) => (
        <motion.div key={`faq-${index}`} variants={item}>
          <Card className="bg-amber-900/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
            <CardContent className="p-0">
              {/* Question Header */}
              <div 
                className="p-4 flex justify-between items-start cursor-pointer hover:bg-amber-900/5 transition-colors"
                onClick={() => toggleQuestion(index)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-white/90">{faq.question}</p>
                    <div className="text-xs text-amber-400/70 mt-1 flex items-center">
                      <span>Source: {faq.source || 'Search results'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToContent(faq.question, 'question');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  {faq.answer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                    >
                      {expandedQuestions.has(index) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Answer Content */}
              <AnimatePresence>
                {expandedQuestions.has(index) && faq.answer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12 border-t border-amber-500/10">
                      <div className="pt-3">
                        <p className="text-sm text-white/80 leading-relaxed mb-3">
                          {faq.answer}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-900/20 hover:border-amber-500/50"
                          onClick={() => onAddToContent(faq.answer, 'answer')}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Answer
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
