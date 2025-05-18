
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { contentFormats, getFormatIconComponent } from './formats';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerateContent: (formatIds: string[]) => void;
  isGenerating: boolean;
}

export const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Content Formats</CardTitle>
        <CardDescription>Select formats to transform your content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {contentFormats.map((format) => {
            const IconComponent = getFormatIconComponent(format.id);
            
            return (
              <div
                key={format.id}
                className={`flex items-center p-2 rounded-md cursor-pointer ${
                  selectedFormats.includes(format.id)
                    ? 'bg-primary/20 border border-primary/50'
                    : 'hover:bg-accent/10 border border-transparent'
                }`}
                onClick={() => {
                  if (selectedFormats.includes(format.id)) {
                    setSelectedFormats(selectedFormats.filter(f => f !== format.id));
                  } else {
                    setSelectedFormats([...selectedFormats, format.id]);
                  }
                }}
              >
                <div
                  className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                    selectedFormats.includes(format.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-muted-foreground'
                  }`}
                >
                  {selectedFormats.includes(format.id) && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium flex items-center gap-1">
                    {format.name}
                    <IconComponent className="h-4 w-4" />
                  </span>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={selectedFormats.length === 0 || isGenerating}
          onClick={() => onGenerateContent(selectedFormats)}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            `Generate ${selectedFormats.length} Format${selectedFormats.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentFormatSelection;
