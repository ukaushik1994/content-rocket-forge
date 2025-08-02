
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { HelpCircle, Plus, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionsTabProps {
  questions: any[];
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
}

export function QuestionsTab({ questions, serpSelections, onToggleSelection }: QuestionsTabProps) {
  const isSelected = (question: string) => {
    return serpSelections.some(
      item => (item.type === 'question' || item.type === 'peopleAlsoAsk') && 
               item.content === question && 
               item.selected
    );
  };

  // Debug: Log questions data
  console.log('📋 QuestionsTab Debug:', {
    questionsLength: questions.length,
    questionsData: questions,
    questionsType: typeof questions,
    isArray: Array.isArray(questions)
  });

  if (questions.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full backdrop-blur-sm border border-white/10">
            <HelpCircle className="h-12 w-12 text-purple-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          No FAQ questions discovered
        </h3>
        <p className="text-gray-400 max-w-md mb-6">
          No "People Also Ask" questions were found for this keyword. This could mean:
        </p>
        <div className="text-left max-w-md space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            The keyword might not trigger FAQ results
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            Try a more conversational or question-based keyword
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
            Switch to the other API provider above for different results
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <HelpCircle className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              FAQ Questions
            </h3>
            <p className="text-sm text-gray-400">
              Frequently asked questions perfect for FAQ sections
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 font-mono">
          {questions.length} questions
        </Badge>
      </motion.div>

      <div className="space-y-4">
        <AnimatePresence>
          {questions.map((question, index) => {
            const questionText = typeof question === 'string' ? question : question.question;
            const selected = isSelected(questionText);
            
            return (
              <motion.div
                key={`question-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group"
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  selected 
                    ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-white/10 hover:border-white/20'
                } backdrop-blur-xl`}>
                  
                  {/* Animated selection indicator */}
                  {selected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Floating particles for selected items */}
                  {selected && (
                    <>
                      <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </>
                  )}
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                            selected 
                              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30' 
                              : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                          }`}>
                            <HelpCircle className="h-4 w-4 text-white" />
                          </div>
                          <Badge className={`text-xs transition-all duration-300 ${
                            selected 
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            FAQ
                          </Badge>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3 text-purple-400" />
                              <span className="text-xs text-purple-400 font-medium">Selected</span>
                            </motion.div>
                          )}
                        </div>
                        
                        <p className="font-medium text-white leading-relaxed">
                          {questionText}
                        </p>
                        
                        {question.answer && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-gray-400 bg-white/5 rounded-lg p-3 border border-white/10"
                          >
                            {question.answer.length > 200 ? 
                              `${question.answer.substring(0, 200)}...` : 
                              question.answer
                            }
                          </motion.div>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={selected ? "default" : "outline"}
                          size="sm"
                          onClick={() => onToggleSelection('peopleAlsoAsk', questionText)}
                          className={`transition-all duration-300 ${
                            selected
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
                              : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm'
                          }`}
                        >
                          {selected ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-3 w-3" />
                              <span>Selected</span>
                            </motion.div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Plus className="h-3 w-3" />
                              <span>Select</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
