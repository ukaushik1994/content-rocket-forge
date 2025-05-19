
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { Sparkles, Check, ChevronRight, Edit, Pencil } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const TitleGenerationButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const { state, dispatch } = useContentBuilder();
  const { 
    titleSuggestions, 
    isGeneratingTitles, 
    generateTitleSuggestions,
    applyTitle,
    currentTitle 
  } = useTitleSuggestions();
  
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [wordCountLimit, setWordCountLimit] = useState<number>(
    state.wordCountLimit || 1500
  );
  
  // Reset selected index when suggestions change
  useEffect(() => {
    // Find if current title is in the suggestions
    if (currentTitle && titleSuggestions.length > 0) {
      const index = titleSuggestions.findIndex(title => title === currentTitle);
      if (index >= 0) {
        setSelectedTitleIndex(index);
        setEditedTitle(currentTitle);
      } else {
        setSelectedTitleIndex(null);
      }
    }
  }, [titleSuggestions, currentTitle]);
  
  const handleOpenDialog = async () => {
    setShowDialog(true);
    setIsEditing(false);
    
    // Set the current word count limit
    if (state.wordCountLimit) {
      setWordCountLimit(state.wordCountLimit);
    }
    
    // Generate initial titles if none exist
    if (titleSuggestions.length === 0) {
      await generateTitleSuggestions();
    }
  };
  
  const handleRegenerateTitles = () => {
    setSelectedTitleIndex(null);
    setIsEditing(false);
    generateTitleSuggestions();
  };
  
  const handleSelectTitle = (index: number) => {
    setSelectedTitleIndex(index);
    setEditedTitle(titleSuggestions[index]);
    setIsEditing(false);
  };
  
  const handleApplyTitle = () => {
    let finalTitle = '';
    
    if (isEditing && editedTitle) {
      finalTitle = editedTitle;
    } else if (selectedTitleIndex !== null && titleSuggestions[selectedTitleIndex]) {
      finalTitle = titleSuggestions[selectedTitleIndex];
    } else {
      toast.error("Please select or edit a title first");
      return;
    }
    
    // Apply the title and word count limit
    applyTitle(finalTitle);
    dispatch({ type: 'SET_WORD_COUNT_LIMIT', payload: wordCountLimit });
    setShowDialog(false);
    
    toast.success("Title applied and word count limit set");
  };
  
  const handleEditMode = () => {
    if (selectedTitleIndex !== null) {
      setIsEditing(true);
    } else if (currentTitle) {
      setEditedTitle(currentTitle);
      setIsEditing(true);
    } else {
      toast.error("Please select a title to edit");
    }
  };
  
  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWordCountLimit(value);
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
        {currentTitle ? "Change Title" : "Generate Title"}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {currentTitle ? "Update Content Title" : "Generate Unique Title"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {currentTitle && !isEditing && (
              <div className="mb-4 p-3 bg-secondary/20 rounded-md border border-secondary/30">
                <p className="text-xs text-muted-foreground mb-1">Current Title:</p>
                <p className="text-sm font-medium">{currentTitle}</p>
              </div>
            )}
            
            {isEditing ? (
              <div className="mb-6 space-y-2">
                <Label htmlFor="title-edit">Edit Title</Label>
                <Textarea 
                  id="title-edit"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full min-h-[100px]"
                  placeholder="Edit your title here..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  className="mt-2"
                >
                  Cancel Edit
                </Button>
              </div>
            ) : (
              <div className="flex justify-between mb-4 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditMode}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Manually
                </Button>
                <RefreshButton 
                  isRefreshing={isGeneratingTitles} 
                  onClick={handleRegenerateTitles}
                  className="text-xs"
                >
                  Generate New Titles
                </RefreshButton>
              </div>
            )}
            
            {!isEditing && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
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
                    No title suggestions available. Click "Generate New Titles" to create some.
                  </div>
                )}
              </div>
            )}
            
            {/* Word Count Limit Input */}
            <div className="mt-6 pt-4 border-t border-border">
              <Label htmlFor="word-count" className="text-sm mb-2 block">
                Target Word Count
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="word-count"
                  type="number"
                  min="100"
                  value={wordCountLimit}
                  onChange={handleWordCountChange}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">words</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be used as a target for content generation
              </p>
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
              disabled={(!isEditing && selectedTitleIndex === null) || (isEditing && !editedTitle.trim())}
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
