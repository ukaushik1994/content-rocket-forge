
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContentOptimizer } from './useContentOptimizer';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizationSuggestion } from './types';

interface AutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export function AutoOptimizeDialog({ isOpen, onClose, content, onContentUpdate }: AutoOptimizeDialogProps) {
  const {
    isAnalyzing,
    isOptimizing,
    contentSuggestions,
    solutionSuggestions,
    analyzedContent,
    analyzedSolutionIntegration,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion
  } = useContentOptimizer(content);

  // Initialize analysis when dialog opens
  React.useEffect(() => {
    if (isOpen && !isAnalyzing && !contentSuggestions.length && !solutionSuggestions.length) {
      analyzeContent();
    }
  }, [isOpen, isAnalyzing, contentSuggestions, solutionSuggestions, analyzeContent]);

  const handleApplySuggestions = async () => {
    const optimizedContent = await optimizeContent();
    if (optimizedContent) {
      onContentUpdate(optimizedContent);
      onClose();
    }
  };

  const renderSuggestion = (suggestion: OptimizationSuggestion, index: number) => {
    const isSelected = selectedSuggestions.includes(suggestion.id);
    
    return (
      <div key={suggestion.id} className="bg-secondary/20 rounded-md p-3 my-2">
        <div className="flex items-start gap-3">
          <div 
            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
            onClick={() => toggleSuggestion(suggestion.id)}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{suggestion.title}</h4>
              <Badge variant="outline" className="text-xs">
                {suggestion.type === 'content' ? 'Content Quality' : 'Solution Integration'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Content Optimization</DialogTitle>
          <DialogDescription>
            Select the suggestions you want to apply to improve your content
          </DialogDescription>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center">Analyzing content and generating optimization suggestions...</p>
          </div>
        ) : (
          <>
            {contentSuggestions.length > 0 || solutionSuggestions.length > 0 ? (
              <div className="space-y-4">
                {contentSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Content Quality Suggestions</h3>
                    {contentSuggestions.map(renderSuggestion)}
                  </div>
                )}
                
                {solutionSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Solution Integration Suggestions</h3>
                    {solutionSuggestions.map(renderSuggestion)}
                  </div>
                )}
                
                <Separator className="my-4" />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApplySuggestions}
                    disabled={isOptimizing || selectedSuggestions.length === 0}
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      'Apply Selected Suggestions'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                <p className="text-center">Your content looks great! No optimization suggestions needed.</p>
                <Button onClick={onClose} className="mt-4">
                  Close
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
