
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SerpSelection } from '@/contexts/ContentBuilderContext';

interface SerpQuestionsListProps {
  questions: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpQuestionsList: React.FC<SerpQuestionsListProps> = ({
  questions,
  handleToggleSelection
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((item, index) => (
              <div key={index} className="flex items-start gap-3 border-b pb-4 last:border-0">
                <Checkbox 
                  id={`question-${index}`} 
                  checked={item.selected}
                  onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor={`question-${index}`}
                    className="font-medium cursor-pointer"
                  >
                    {item.content}
                  </Label>
                  {item.source && (
                    <p className="text-xs text-muted-foreground">Source: {item.source}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
