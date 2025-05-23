
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Plus, ExternalLink } from 'lucide-react';
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
      {serpData.peopleAlsoAsk.map((faq, index) => (
        <motion.div key={`faq-${index}`} variants={item}>
          <Card className="bg-amber-900/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-amber-100 mb-2 leading-relaxed">
                      {faq.question}
                    </h4>
                    {faq.answer && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-3">
                        {faq.answer}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Source: {faq.source || 'Search data'}</span>
                      {faq.source && faq.source !== 'search' && (
                        <ExternalLink className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                    onClick={() => onAddToContent(faq.question, 'question')}
                    title="Add question to content"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {faq.answer && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                      onClick={() => onAddToContent(`${faq.question}\n\n${faq.answer}`, 'faq')}
                      title="Add question and answer to content"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
