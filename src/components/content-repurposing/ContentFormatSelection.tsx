
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { contentFormats } from './formats';
import { toast } from 'sonner';
import { ContentRepurposingErrorBoundary } from './ErrorBoundary';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  onGenerateContent: (formats: string[]) => void;
  isGenerating: boolean;
}

const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFormatToggle = (formatId: string) => {
    try {
      setError(null);
      if (selectedFormats.includes(formatId)) {
        setSelectedFormats(selectedFormats.filter(id => id !== formatId));
      } else {
        setSelectedFormats([...selectedFormats, formatId]);
      }
    } catch (err) {
      console.error('Error toggling format:', err);
      setError('Failed to update format selection');
    }
  };

  const handleSelectAll = () => {
    try {
      setError(null);
      if (selectedFormats.length === contentFormats.length) {
        setSelectedFormats([]);
      } else {
        setSelectedFormats(contentFormats.map(format => format.id));
      }
    } catch (err) {
      console.error('Error selecting all formats:', err);
      setError('Failed to update format selection');
    }
  };

  const handleGenerate = async () => {
    if (selectedFormats.length === 0) {
      toast.error('Please select at least one format to generate');
      return;
    }

    try {
      setError(null);
      await onGenerateContent(selectedFormats);
    } catch (err) {
      console.error('Error generating content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const isAllSelected = selectedFormats.length === contentFormats.length;
  const hasSelection = selectedFormats.length > 0;

  return (
    <ContentRepurposingErrorBoundary>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Select Formats
          </CardTitle>
          <CardDescription>
            Choose which formats you want to generate for your content
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Select All Button */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {selectedFormats.length} of {contentFormats.length} formats selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isGenerating}
              aria-label={isAllSelected ? 'Deselect all formats' : 'Select all formats'}
            >
              {isAllSelected ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select All
                </>
              )}
            </Button>
          </div>

          {/* Format Grid */}
          <div className="grid grid-cols-1 gap-3">
            {contentFormats.map((format) => {
              const isSelected = selectedFormats.includes(format.id);
              const formatId = `format-${format.id}`;
              
              return (
                <div
                  key={format.id}
                  className={`
                    relative flex items-start space-x-3 rounded-lg border p-4 transition-all duration-200
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }
                    ${isGenerating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !isGenerating && handleFormatToggle(format.id)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-describedby={`${formatId}-description`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isGenerating) {
                      e.preventDefault();
                      handleFormatToggle(format.id);
                    }
                  }}
                >
                  <Checkbox
                    id={formatId}
                    checked={isSelected}
                    disabled={isGenerating}
                    onChange={() => handleFormatToggle(format.id)}
                    aria-labelledby={`${formatId}-label`}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <Label 
                      htmlFor={formatId}
                      id={`${formatId}-label`}
                      className={`
                        text-sm font-medium cursor-pointer
                        ${isSelected ? 'text-primary' : 'text-foreground'}
                      `}
                    >
                      {format.name}
                    </Label>
                    <p 
                      id={`${formatId}-description`}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {format.description}
                    </p>
                    
                    {/* Format badges */}
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {format.category || 'General'}
                      </Badge>
                      {format.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          ~{format.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleGenerate}
              disabled={!hasSelection || isGenerating}
              className="w-full"
              size="lg"
              aria-describedby="generate-button-description"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {selectedFormats.length} Selected Format{selectedFormats.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <p id="generate-button-description" className="text-xs text-muted-foreground text-center mt-2">
              {!hasSelection 
                ? 'Select at least one format to continue'
                : `This will generate content in ${selectedFormats.length} format${selectedFormats.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </ContentRepurposingErrorBoundary>
  );
};

export default ContentFormatSelection;
