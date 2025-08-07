import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RefreshButton } from '@/components/ui/refresh-button';
import { Badge } from '@/components/ui/badge';
import { useTitleSuggestions } from '@/hooks/final-review/useTitleSuggestions';
import { TitleStyleSelector } from './TitleStyleSelector';
import { Sparkles, Check, ChevronRight, Settings, Eye } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
export const TitleGenerationButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['how-to', 'benefit']);
  const {
    state
  } = useContentBuilder();
  const {
    titleSuggestions,
    isGeneratingTitles,
    generateTitleSuggestions,
    applyTitle,
    currentTitle
  } = useTitleSuggestions();
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);

  // Reset selected index when suggestions change
  useEffect(() => {
    // Find if current title is in the suggestions
    if (currentTitle && titleSuggestions.length > 0) {
      const index = titleSuggestions.findIndex(title => title === currentTitle);
      if (index >= 0) {
        setSelectedTitleIndex(index);
      } else {
        setSelectedTitleIndex(null);
      }
    }
  }, [titleSuggestions, currentTitle]);
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
      applyTitle(selectedTitle);
      setShowDialog(false);
    } else {
      toast.error("Please select a title first");
    }
  };
  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev => prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]);
  };
  const handleGenerateWithStyles = () => {
    setSelectedTitleIndex(null);
    generateTitleSuggestions();
    toast.success(`Generating titles with ${selectedStyles.length} selected styles`);
  };
  const getTitleStyle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.startsWith('how to') || lowerTitle.includes('step')) return 'how-to';
    if (/\d+/.test(title) && (lowerTitle.includes('tips') || lowerTitle.includes('ways'))) return 'listicle';
    if (lowerTitle.includes('?')) return 'question';
    if (lowerTitle.includes('boost') || lowerTitle.includes('improve') || lowerTitle.includes('transform')) return 'benefit';
    if (lowerTitle.includes('master') || lowerTitle.includes('unlock')) return 'action';
    return 'guide';
  };
  return <>
      
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {currentTitle ? "Update Content Title" : "Generate Smart Titles"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {currentTitle && <div className="p-3 bg-secondary/20 rounded-md border border-secondary/30">
                <p className="text-xs text-muted-foreground mb-1">Current Title:</p>
                <p className="text-sm font-medium">{currentTitle}</p>
              </div>}
            
            {/* Style Selector Toggle */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowStyleSelector(!showStyleSelector)} className="gap-2">
                <Settings className="h-3.5 w-3.5" />
                {showStyleSelector ? 'Hide' : 'Show'} Style Options
                <Badge variant="secondary" className="ml-1">
                  {selectedStyles.length}
                </Badge>
              </Button>
              
              <RefreshButton isRefreshing={isGeneratingTitles} onClick={handleRegenerateTitles} className="text-xs">
                Regenerate Titles
              </RefreshButton>
            </div>
            
            {/* Style Selector */}
            {showStyleSelector && <TitleStyleSelector selectedStyles={selectedStyles} onStyleToggle={handleStyleToggle} onGenerateWithStyles={handleGenerateWithStyles} isGenerating={isGeneratingTitles} />}
            
            {/* Title Suggestions */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {isGeneratingTitles ? <div className="flex items-center justify-center p-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <div className="ml-3 text-sm text-muted-foreground">
                    Analyzing content and generating smart titles...
                  </div>
                </div> : titleSuggestions.length > 0 ? <div className="space-y-2">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    {titleSuggestions.length} content-based suggestions
                  </div>
                  {titleSuggestions.map((title, index) => {
                const titleStyle = getTitleStyle(title);
                return <div key={index} className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${selectedTitleIndex === index ? 'border-blue-500 bg-blue-500/10 shadow-md' : 'border-border/50 hover:bg-secondary/30'}`} onClick={() => handleSelectTitle(index)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm mb-1">{title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {titleStyle}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {title.length} characters
                              </span>
                            </div>
                          </div>
                          {selectedTitleIndex === index && <Check className="h-4 w-4 text-blue-500 ml-2" />}
                        </div>
                      </div>;
              })}
                </div> : <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No title suggestions available.</p>
                  <p className="text-xs">Click "Regenerate Titles" to create smart, content-based suggestions.</p>
                </div>}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTitle} disabled={selectedTitleIndex === null} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Apply Selected Title <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};