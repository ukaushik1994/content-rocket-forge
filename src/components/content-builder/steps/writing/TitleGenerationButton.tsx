
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

export const TitleGenerationButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { state, dispatch } = useContentBuilder();
  const { 
    titleSuggestions, 
    isGeneratingTitles, 
    generateTitleSuggestions 
  } = useTitleSuggestions();
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);
  
  const handleOpenDialog = async () => {
    setShowDialog(true);
    // Generate initial titles if none exist
    if (titleSuggestions.length === 0) {
      await generateTitleSuggestions();
    }
  };
  
  const handleRegenerateTitles = () => {
    setSelectedTitleIndex(null);
    generateTitleSuggestions();
  };
  
  const handleSelectTitle = (index: number) => {
    setSelectedTitleIndex(index);
  };
  
  const handleApplyTitle = () => {
    if (selectedTitleIndex !== null && titleSuggestions[selectedTitleIndex]) {
      const selectedTitle = titleSuggestions[selectedTitleIndex];
      dispatch({ type: 'SET_CONTENT_TITLE', payload: selectedTitle });
      dispatch({ type: 'SET_META_TITLE', payload: selectedTitle });
      toast.success("Title applied successfully!");
      setShowDialog(false);
    } else {
      toast.error("Please select a title first");
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleOpenDialog}
        className="gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Generate Title
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Unique Title
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-end mb-4">
              <RefreshButton 
                isRefreshing={isGeneratingTitles} 
                onClick={handleRegenerateTitles}
                className="text-xs"
              >
                Regenerate Titles
              </RefreshButton>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {isGeneratingTitles ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : titleSuggestions.length > 0 ? (
                titleSuggestions.map((title, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-md border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      selectedTitleIndex === index 
                        ? 'border-blue-500 bg-blue-500/10 shadow-md' 
                        : 'border-border/50 hover:bg-secondary/30'
                    }`}
                    onClick={() => handleSelectTitle(index)}
                  >
                    <p className="text-sm">{title}</p>
                    {selectedTitleIndex === index && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No title suggestions available. Click "Regenerate Titles" to create some.
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyTitle}
              disabled={selectedTitleIndex === null}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Apply Selected Title <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
