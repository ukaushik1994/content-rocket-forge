
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SerpSelection } from '@/contexts/content-builder/types';
import { HelpCircle, Plus } from 'lucide-react';
import { extractStringContent } from '@/utils/faqDataUtils';

interface SerpQuestionsListProps {
  questions: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpQuestionsList: React.FC<SerpQuestionsListProps> = ({
  questions,
  handleToggleSelection
}) => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSelectionToggle = (question: SerpSelection) => {
    try {
      const contentString = extractStringContent(question.content);
      if (contentString) {
        handleToggleSelection(question.type, contentString);
      }
    } catch (error) {
      console.error('Error toggling question selection:', error);
    }
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-purple-900/5 backdrop-blur-md shadow-xl">
      <CardContent className="pt-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {questions.map((question, index) => {
            const contentString = extractStringContent(question.content);
            
            if (!contentString) {
              console.warn(`Invalid question content at index ${index}:`, question.content);
              return null;
            }
            
            return (
              <motion.div 
                key={`question-${index}-${contentString.substring(0, 20)}`}
                variants={item}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center border rounded-md p-3 transition-all duration-200 group hover:shadow-md ${
                  question.selected 
                    ? "border-purple-500 bg-purple-500/10 shadow-inner" 
                    : "border-white/10 hover:border-purple-500/30 hover:bg-purple-900/20"
                }`}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox 
                    id={`question-${index}`} 
                    checked={question.selected}
                    onCheckedChange={() => handleSelectionToggle(question)}
                    className={`${
                      question.selected 
                        ? "border-purple-500 bg-purple-500 text-white" 
                        : "border-white/40 text-transparent"
                    }`}
                  />
                  <Label 
                    htmlFor={`question-${index}`} 
                    className="cursor-pointer flex-1 text-sm select-none"
                  >
                    {contentString}
                  </Label>
                </div>
                
                {!question.selected && (
                  <span 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-purple-500/10 text-purple-400 rounded-full px-2 py-0.5 flex items-center gap-1 border border-purple-500/20 cursor-pointer"
                    onClick={() => handleSelectionToggle(question)}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
        
        {questions.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No questions available.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
