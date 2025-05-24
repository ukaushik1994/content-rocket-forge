
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SerpAnalysisResult } from '@/types/serp';
import { validateAndStandardizeFAQList, StandardizedFAQ } from '@/utils/faqDataUtils';
import { useFAQSelection } from '@/hooks/useFAQSelection';
import { SerpErrorBoundary } from './ErrorBoundary';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsSection({ 
  serpData, 
  expanded, 
  onAddToContent = () => {} 
}: SerpQuestionsSectionProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  
  // Add debug logging
  console.log('🔍 SerpQuestionsSection Debug:', {
    expanded,
    hasSerpData: !!serpData,
    peopleAlsoAskCount: serpData?.peopleAlsoAsk?.length || 0,
    peopleAlsoAskData: serpData?.peopleAlsoAsk,
    isMockData: serpData?.isMockData
  });
  
  // Standardize and validate FAQ data
  const standardizedFAQs = useMemo(() => {
    if (!serpData?.peopleAlsoAsk) {
      console.log('⚠️ No peopleAlsoAsk data available');
      return [];
    }
    
    try {
      console.log('🔄 Processing FAQ data:', serpData.peopleAlsoAsk);
      const result = validateAndStandardizeFAQList(serpData.peopleAlsoAsk);
      console.log('✅ Standardized FAQs:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('❌ Error standardizing FAQ data:', error);
      return [];
    }
  }, [serpData?.peopleAlsoAsk]);

  const { toggleFAQSelection, isFAQSelected } = useFAQSelection();
  
  // Show debug info when expanded but no FAQs
  if (expanded && standardizedFAQs.length === 0) {
    return (
      <SerpErrorBoundary>
        <Card className="border-amber-500/20 bg-amber-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">FAQ Debug Information</span>
            </div>
            <div className="space-y-2 text-xs text-amber-400/70">
              <p>Expanded: {expanded ? 'Yes' : 'No'}</p>
              <p>Has SERP Data: {serpData ? 'Yes' : 'No'}</p>
              <p>PeopleAlsoAsk Array Length: {serpData?.peopleAlsoAsk?.length || 0}</p>
              <p>Is Mock Data: {serpData?.isMockData ? 'Yes' : 'No'}</p>
              {serpData?.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Raw FAQ Data</summary>
                  <pre className="mt-1 p-2 bg-amber-900/20 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(serpData.peopleAlsoAsk, null, 2)}
                  </pre>
                </details>
              )}
              {standardizedFAQs.length === 0 && serpData?.peopleAlsoAsk?.length > 0 && (
                <p className="text-red-400">⚠️ FAQ data exists but standardization failed</p>
              )}
            </div>
          </CardContent>
        </Card>
      </SerpErrorBoundary>
    );
  }
  
  if (!expanded || standardizedFAQs.length === 0) return null;
  
  const toggleQuestion = (faqId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAddQuestion = (faq: StandardizedFAQ) => {
    try {
      onAddToContent(faq.question, 'question');
      toggleFAQSelection(faq);
      console.log('✅ Added FAQ question to content:', faq.question);
    } catch (error) {
      console.error('❌ Error adding question to content:', error);
    }
  };

  const handleAddAnswer = (faq: StandardizedFAQ) => {
    if (!faq.answer) return;
    
    try {
      onAddToContent(faq.answer, 'answer');
      console.log('✅ Added FAQ answer to content:', faq.answer);
    } catch (error) {
      console.error('❌ Error adding answer to content:', error);
    }
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
    <SerpErrorBoundary>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3 py-4"
      >
        {/* Success message for displaying FAQs */}
        <div className="text-xs text-green-400 mb-2">
          ✅ Displaying {standardizedFAQs.length} FAQ{standardizedFAQs.length !== 1 ? 's' : ''}
        </div>

        {standardizedFAQs.map((faq) => (
          <motion.div key={faq.id} variants={item}>
            <Card className="bg-amber-900/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
              <CardContent className="p-0">
                {/* Question Header */}
                <div 
                  className="p-4 flex justify-between items-start cursor-pointer hover:bg-amber-900/5 transition-colors"
                  onClick={() => toggleQuestion(faq.id)}
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
                      className={`h-7 px-2 hover:bg-amber-900/20 ${
                        isFAQSelected(faq) 
                          ? 'text-amber-300 bg-amber-900/20' 
                          : 'text-amber-400 hover:text-amber-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddQuestion(faq);
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
                        {expandedQuestions.has(faq.id) ? (
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
                  {expandedQuestions.has(faq.id) && faq.answer && (
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
                            onClick={() => handleAddAnswer(faq)}
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
    </SerpErrorBoundary>
  );
}
