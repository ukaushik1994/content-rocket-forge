
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Image, LayoutGrid } from 'lucide-react';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { CheckIcon } from 'lucide-react';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  onGenerateContent: (formats: string[]) => void;  // Updated parameter to accept formats
  isGenerating: boolean;
}

const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating
}) => {
  // Helper function to get icon for content format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'carousel':
        return <LayoutGrid className="h-4 w-4 mr-1" />;
      case 'meme':
        return <Image className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  const handleToggleFormat = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      setSelectedFormats(selectedFormats.filter(id => id !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedFormats.length === contentFormats.length) {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(contentFormats.map(format => format.id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">Content Formats</CardTitle>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedFormats.length === contentFormats.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <CardDescription>
          Select which formats you want to generate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contentFormats.map(format => (
            <div 
              key={format.id}
              onClick={() => handleToggleFormat(format.id)}
              className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between ${
                selectedFormats.includes(format.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center ${
                  selectedFormats.includes(format.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}>
                  {selectedFormats.includes(format.id) && (
                    <CheckIcon className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    {getFormatIcon(format.id)}
                    <span className="font-medium">{format.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{format.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {format.id === 'meme' || format.id === 'carousel' ? 'Visual' : 'Text'}
              </Badge>
            </div>
          ))}
          
          <Button 
            onClick={() => onGenerateContent(selectedFormats)}  // Pass the selected formats
            disabled={selectedFormats.length === 0 || isGenerating}
            className="w-full mt-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              `Generate ${selectedFormats.length} Format${selectedFormats.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentFormatSelection;
