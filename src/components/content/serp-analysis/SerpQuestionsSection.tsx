
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Enhanced debugging with data validation
  const debugInfo = React.useMemo(() => {
    const info = {
      hasData: !!serpData,
      hasPeopleAlsoAsk: !!serpData?.peopleAlsoAsk,
      peopleAlsoAskType: typeof serpData?.peopleAlsoAsk,
      peopleAlsoAskLength: Array.isArray(serpData?.peopleAlsoAsk) ? serpData.peopleAlsoAsk.length : 'not array',
      firstQuestionStructure: serpData?.peopleAlsoAsk?.[0] ? Object.keys(serpData.peopleAlsoAsk[0]) : 'no first item',
      validQuestions: 0,
      invalidQuestions: 0,
      sampleData: serpData?.peopleAlsoAsk?.slice(0, 2) || []
    };
    
    // Count valid vs invalid questions
    if (Array.isArray(serpData?.peopleAlsoAsk)) {
      serpData.peopleAlsoAsk.forEach(question => {
        if (question && typeof question === 'object' && question.question) {
          info.validQuestions++;
        } else {
          info.invalidQuestions++;
        }
      });
    }
    
    return info;
  }, [serpData]);
  
  console.log('🔍 Questions Section Enhanced Debug:', debugInfo);
  
  if (!expanded) return null;
  
  // Validate and filter questions
  const validQuestions = React.useMemo(() => {
    if (!Array.isArray(serpData?.peopleAlsoAsk)) {
      console.warn('❌ peopleAlsoAsk is not an array:', typeof serpData?.peopleAlsoAsk);
      return [];
    }
    
    return serpData.peopleAlsoAsk.filter((faq, index) => {
      if (!faq || typeof faq !== 'object') {
        console.warn(`⚠️ Invalid question at index ${index}:`, faq);
        return false;
      }
      
      if (!faq.question || typeof faq.question !== 'string') {
        console.warn(`⚠️ Missing or invalid question at index ${index}:`, faq);
        return false;
      }
      
      return true;
    });
  }, [serpData?.peopleAlsoAsk]);
  
  // Show empty state with debugging info
  if (validQuestions.length === 0) {
    return (
      <div className="p-4 text-center text-white/50">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No valid questions found for this keyword</p>
        <p className="text-xs mt-1">Questions help address user intent in your content</p>
        
        {/* Debug information panel */}
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-xs text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-red-400">Debug Information</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="h-6 px-2 text-xs text-red-400"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          <div className="space-y-1 text-red-300/80">
            <div>Data Present: {debugInfo.hasData ? '✅' : '❌'}</div>
            <div>PeopleAlsoAsk: {debugInfo.hasPeopleAlsoAsk ? '✅' : '❌'}</div>
            <div>Type: {debugInfo.peopleAlsoAskType}</div>
            <div>Length: {debugInfo.peopleAlsoAskLength}</div>
            <div>Valid Questions: {debugInfo.validQuestions}</div>
            <div>Invalid Questions: {debugInfo.invalidQuestions}</div>
          </div>
          
          {showDebugInfo && (
            <div className="mt-2 pt-2 border-t border-red-500/20">
              <div className="text-xs">First Item Structure: {Array.isArray(debugInfo.firstQuestionStructure) ? debugInfo.firstQuestionStructure.join(', ') : debugInfo.firstQuestionStructure}</div>
              {debugInfo.sampleData.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Sample Data:</div>
                  <pre className="text-xs bg-black/20 p-2 rounded mt-1 overflow-auto">
                    {JSON.stringify(debugInfo.sampleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
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
      {/* Success indicator */}
      <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Found {validQuestions.length} valid question{validQuestions.length !== 1 ? 's' : ''}</span>
        {debugInfo.invalidQuestions > 0 && (
          <span className="text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {debugInfo.invalidQuestions} skipped
          </span>
        )}
      </div>
      
      {validQuestions.map((faq, index) => {
        const question = faq.question;
        const answer = faq.answer || '';
        const source = faq.source || 'Search results';

        return (
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
                      <p className="font-medium text-sm text-white/90">{question}</p>
                      <div className="text-xs text-amber-400/70 mt-1 flex items-center">
                        <span>Source: {source}</span>
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
                        onAddToContent(question, 'question');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    {answer && (
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
                  {expandedQuestions.has(index) && answer && (
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
                            {answer}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-900/20 hover:border-amber-500/50"
                            onClick={() => onAddToContent(answer, 'answer')}
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
        );
      })}
    </motion.div>
  );
}
