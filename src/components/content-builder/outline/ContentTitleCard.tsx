
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckIcon, RefreshCwIcon } from 'lucide-react';

interface ContentTitleCardProps {
  title: string;
  suggestedTitles: string[];
  onTitleChange: (title: string) => void;
}

export const ContentTitleCard = ({ title, suggestedTitles, onTitleChange }: ContentTitleCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Content Title</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter a title for your content..."
          className="text-base font-medium"
        />
        
        {suggestedTitles && suggestedTitles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Titles</h4>
            <div className="space-y-2">
              {suggestedTitles.map((suggestedTitle, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{suggestedTitle}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onTitleChange(suggestedTitle)}
                    className="h-7 w-7 p-0"
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Generate more titles button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-8 mt-3"
          disabled={!title}
        >
          <RefreshCwIcon className="h-3.5 w-3.5 mr-2" />
          Generate more title options
        </Button>
      </CardContent>
    </Card>
  );
};
