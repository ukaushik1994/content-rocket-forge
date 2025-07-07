
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { HelpCircle, Plus, Check } from 'lucide-react';

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

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No questions found</h3>
        <p className="text-muted-foreground">
          No "People Also Ask" questions were found for this keyword
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">People Also Ask</h3>
          <p className="text-sm text-muted-foreground">
            Select questions to address in your content
          </p>
        </div>
        <Badge variant="outline">
          {questions.length} questions
        </Badge>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const questionText = typeof question === 'string' ? question : question.question;
          const selected = isSelected(questionText);
          
          return (
            <Card key={index} className={`transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline" className="text-xs">
                        FAQ
                      </Badge>
                    </div>
                    <p className="font-medium mb-2">{questionText}</p>
                    {question.answer && (
                      <p className="text-sm text-muted-foreground">
                        {question.answer.length > 200 ? 
                          `${question.answer.substring(0, 200)}...` : 
                          question.answer
                        }
                      </p>
                    )}
                  </div>
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleSelection('peopleAlsoAsk', questionText)}
                    className="ml-4"
                  >
                    {selected ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
