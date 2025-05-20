
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contentFormats } from './formats';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  onFormatChange: (formats: string[]) => void;
  onGenerateContent: (formats: string[]) => void;
  isGenerating: boolean;
}

const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  onFormatChange,
  onGenerateContent,
  isGenerating
}) => {
  const handleFormatToggle = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      onFormatChange(selectedFormats.filter(id => id !== formatId));
    } else {
      onFormatChange([...selectedFormats, formatId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFormats.length === contentFormats.length) {
      onFormatChange([]);
    } else {
      onFormatChange(contentFormats.map(format => format.id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Content Formats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedFormats.length === contentFormats.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {contentFormats.map((format) => (
            <div key={format.id} className="flex items-center space-x-2">
              <Checkbox 
                id={format.id}
                checked={selectedFormats.includes(format.id)}
                onCheckedChange={() => handleFormatToggle(format.id)}
              />
              <Label htmlFor={format.id} className="cursor-pointer">
                {format.name}
              </Label>
            </div>
          ))}
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
              Generating {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}...
            </>
          ) : (
            <>Generate {selectedFormats.length} Format{selectedFormats.length !== 1 ? 's' : ''}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContentFormatSelection;
