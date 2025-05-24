
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { extractStringContent } from '@/utils/faqDataUtils';

interface QuestionsGroupProps {
  count: number;
  items: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const QuestionsGroup: React.FC<QuestionsGroupProps> = ({
  count,
  items,
  handleToggleSelection
}) => {
  const selectedQuestions = items.filter(item => item.selected);

  if (selectedQuestions.length === 0) return null;

  const handleRemoveQuestion = (question: SerpSelection) => {
    try {
      const contentString = extractStringContent(question.content);
      if (contentString) {
        handleToggleSelection(question.type, contentString);
      }
    } catch (error) {
      console.error('Error removing question:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-purple-900/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-purple-400" />
            Selected Questions
            <Badge variant="secondary" className="ml-auto">
              {count}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedQuestions.map((question, index) => {
            const contentString = extractStringContent(question.content);
            
            if (!contentString) {
              console.warn(`Invalid question content at index ${index}:`, question.content);
              return null;
            }

            return (
              <motion.div
                key={`selected-question-${index}-${contentString.substring(0, 20)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-purple-500/10"
              >
                <HelpCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 break-words">
                    {contentString}
                  </p>
                  <div className="text-xs text-purple-400/70 mt-1">
                    Type: {question.type}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(question)}
                  className="h-6 w-6 p-0 text-white/50 hover:text-red-400 hover:bg-red-900/20 flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};
