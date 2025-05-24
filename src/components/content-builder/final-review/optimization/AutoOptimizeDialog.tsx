
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useContentOptimizer } from './useContentOptimizer';
import { SerpItemsReference } from './components/SerpItemsReference';
import { SuggestionSection } from './components/SuggestionSection';

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
    aiDetectionSuggestions,
    serpIntegrationSuggestions,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
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

  const handleIncorporateAllSerp = () => {
    incorporateAllSerpItems();
  };

  const hasSuggestions = contentSuggestions.length > 0 || 
                       solutionSuggestions.length > 0 || 
                       aiDetectionSuggestions.length > 0 || 
                       serpIntegrationSuggestions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Content Optimization</DialogTitle>
          <DialogDescription>
            Select the suggestions to optimize your content and incorporate all your keywords and SERP data
          </DialogDescription>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center">Analyzing content and generating optimization suggestions...</p>
          </div>
        ) : (
          <>
            {hasSuggestions ? (
              <div className="space-y-4">
                <SerpItemsReference onIncorporateAllSerp={handleIncorporateAllSerp} />
                
                <SuggestionSection
                  title="Content Quality Suggestions"
                  suggestions={contentSuggestions}
                  selectedSuggestions={selectedSuggestions}
                  onToggleSuggestion={toggleSuggestion}
                />
                
                <SuggestionSection
                  title="AI Content Humanization"
                  suggestions={aiDetectionSuggestions}
                  selectedSuggestions={selectedSuggestions}
                  onToggleSuggestion={toggleSuggestion}
                />
                
                <SuggestionSection
                  title="SERP Integration Suggestions"
                  suggestions={serpIntegrationSuggestions}
                  selectedSuggestions={selectedSuggestions}
                  onToggleSuggestion={toggleSuggestion}
                />
                
                <SuggestionSection
                  title="Solution Integration Suggestions"
                  suggestions={solutionSuggestions}
                  selectedSuggestions={selectedSuggestions}
                  onToggleSuggestion={toggleSuggestion}
                />
                
                <Separator className="my-4" />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApplySuggestions}
                    disabled={isOptimizing || selectedSuggestions.length === 0}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
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
