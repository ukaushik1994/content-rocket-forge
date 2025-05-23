import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, AlertCircle, Info, Lightbulb } from 'lucide-react';
import { contentFormats } from './formats';
import { toast } from 'sonner';
import { ContentRepurposingErrorBoundary } from './ErrorBoundary';
import BulkOperationsBar from './format-selection/BulkOperationsBar';
import GenerationProgress from './format-selection/GenerationProgress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  onGenerateContent: (formats: string[]) => void;
  isGenerating: boolean;
  generatedContents?: Record<string, string>;
  onSaveAllContent?: () => Promise<boolean>;
  onExportAll?: () => void;
  onCopyAll?: () => void;
  isSaving?: boolean;
}

const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating,
  generatedContents = {},
  onSaveAllContent,
  onExportAll,
  onCopyAll,
  isSaving = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [formatProgresses, setFormatProgresses] = useState<Array<{
    formatId: string;
    status: 'pending' | 'generating' | 'completed' | 'error';
    progress?: number;
    error?: string;
  }>>([]);

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
      
      // Initialize progress tracking
      const initialProgresses = selectedFormats.map(formatId => ({
        formatId,
        status: 'pending' as const,
        progress: 0
      }));
      setFormatProgresses(initialProgresses);

      await onGenerateContent(selectedFormats);
    } catch (err) {
      console.error('Error generating content:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCopyAll = () => {
    if (onCopyAll) {
      onCopyAll();
    } else {
      const allContent = Object.entries(generatedContents)
        .map(([formatId, content]) => {
          const format = contentFormats.find(f => f.id === formatId);
          return `=== ${format?.name || formatId} ===\n\n${content}`;
        })
        .join('\n\n---\n\n');
      
      navigator.clipboard.writeText(allContent);
      toast.success('All content copied to clipboard');
    }
  };

  const handleExportAll = () => {
    if (onExportAll) {
      onExportAll();
    } else {
      const allContent = Object.entries(generatedContents)
        .map(([formatId, content]) => {
          const format = contentFormats.find(f => f.id === formatId);
          return `=== ${format?.name || formatId} ===\n\n${content}`;
        })
        .join('\n\n---\n\n');
      
      const blob = new Blob([allContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repurposed_content_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('All content exported successfully');
    }
  };

  const getRecommendedFormats = () => {
    // Simple recommendation logic - can be enhanced based on content analysis
    return ['social-media-post', 'email-newsletter', 'blog-post'];
  };

  const recommendedFormats = getRecommendedFormats();
  const hasSelection = selectedFormats.length > 0;
  const generatedCount = Object.keys(generatedContents).length;

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

          {/* Recommendations */}
          <Collapsible open={showRecommendations} onOpenChange={setShowRecommendations}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                {showRecommendations ? 'Hide' : 'Show'} Recommended Formats
                <Info className="h-4 w-4 ml-auto" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">Based on your content, we recommend:</p>
                <div className="flex flex-wrap gap-1">
                  {recommendedFormats.map(formatId => {
                    const format = contentFormats.find(f => f.id === formatId);
                    if (!format) return null;
                    return (
                      <Badge 
                        key={formatId} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          if (!selectedFormats.includes(formatId)) {
                            setSelectedFormats([...selectedFormats, formatId]);
                          }
                        }}
                      >
                        {format.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Bulk Operations Bar */}
          <BulkOperationsBar
            selectedCount={selectedFormats.length}
            totalCount={contentFormats.length}
            generatedCount={generatedCount}
            onSelectAll={handleSelectAll}
            onClearAll={handleSelectAll}
            onSaveAll={onSaveAllContent}
            onExportAll={handleExportAll}
            onCopyAll={handleCopyAll}
            isLoading={isGenerating}
            isSaving={isSaving}
          />

          {/* Generation Progress */}
          <GenerationProgress
            formatProgresses={formatProgresses}
            isVisible={isGenerating && formatProgresses.length > 0}
          />

          {/* Format Grid */}
          <div className="grid grid-cols-1 gap-3">
            {contentFormats.map((format) => {
              const isSelected = selectedFormats.includes(format.id);
              const isRecommended = recommendedFormats.includes(format.id);
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
                    ${isRecommended ? 'ring-1 ring-blue-200' : ''}
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
                    <div className="flex items-center gap-2">
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
                      {isRecommended && (
                        <Badge variant="default" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p 
                      id={`${formatId}-description`}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {format.description}
                    </p>
                    
                    {/* Format badges */}
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Content Format
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ~1-2 min
                      </Badge>
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
