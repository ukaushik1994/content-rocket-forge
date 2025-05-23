
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SerpAnalysisResult } from '@/types/serp';

interface SerpQuestionsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsSection({ serpData, expanded, onAddToContent = () => {} }: SerpQuestionsSectionProps) {
  if (!expanded || !serpData?.peopleAlsoAsk?.length) return null;
  
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
      {serpData.peopleAlsoAsk.map((question, index) => (
        <motion.div key={`question-${index}`} variants={item}>
          <Card className="bg-amber-900/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
            <CardContent className="p-4 flex justify-between items-start">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{question.question}</p>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center">
                    <span>Source: {question.source || 'Search data'}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                onClick={() => onAddToContent(question.question, 'question')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
