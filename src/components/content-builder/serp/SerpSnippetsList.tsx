
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SerpSelection } from '@/contexts/ContentBuilderContext';

interface SerpSnippetsListProps {
  snippets: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
  addContentFromSerp: (content: string, type: string) => void;
}

export const SerpSnippetsList: React.FC<SerpSnippetsListProps> = ({
  snippets,
  handleToggleSelection,
  addContentFromSerp
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {snippets.length > 0 ? (
          <div className="space-y-4">
            {snippets.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start mb-3">
                  <Checkbox 
                    id={`snippet-${index}`} 
                    checked={item.selected}
                    onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="text-sm mb-2">{item.content}</div>
                    {item.source && (
                      <div className="text-xs text-muted-foreground">Source: {item.source}</div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => addContentFromSerp(item.content, "snippet")}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add to Content
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No snippets available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
