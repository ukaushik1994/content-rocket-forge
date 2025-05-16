
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SerpQuestionsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpQuestionsTab({ serpData, onAddToContent = () => {} }: SerpQuestionsTabProps) {
  if (!serpData.peopleAlsoAsk || serpData.peopleAlsoAsk.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No questions data available for this search.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg mb-2">People Also Ask</h3>
      <div className="grid grid-cols-1 gap-3">
        {serpData.peopleAlsoAsk?.map((question, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex justify-between items-center p-4">
                <p className="font-medium">{question}</p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onAddToContent(question, 'question')}
                  className="hover:bg-primary/10"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
