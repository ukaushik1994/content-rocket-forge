
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContentOptimizer } from './useContentOptimizer';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, Plus, Target, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizationSuggestion } from './types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

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
    analyzedContent,
    analyzedSolutionIntegration,
    analyzeContent,
    optimizeContent,
    selectedSuggestions,
    toggleSuggestion,
    incorporateAllSerpItems
  } = useContentOptimizer(content);

  const { state } = useContentBuilder();
  const { mainKeyword, selectedKeywords, serpSelections } = state;

  // Get selected SERP items for display
  const selectedSerpItems = serpSelections?.filter(item => item.selected) || [];
  const selectedKeywordItems = selectedSerpItems.filter(item => item.type === 'keyword');
  const selectedQuestions = selectedSerpItems.filter(item => item.type === 'question');
  const selectedHeadings = selectedSerpItems.filter(item => item.type === 'heading');
  const selectedEntities = selectedSerpItems.filter(item => item.type === 'entity');
  const selectedContentGaps = selectedSerpItems.filter(item => item.type === 'contentGap');
  const selectedTopRanks = selectedSerpItems.filter(item => item.type === 'topRank');

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

  const renderSuggestion = (suggestion: OptimizationSuggestion, index: number) => {
    const isSelected = selectedSuggestions.includes(suggestion.id);
    
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'humanization': return <Bot className="w-4 h-4 text-purple-500" />;
        case 'serp_integration': return <Target className="w-4 h-4 text-blue-500" />;
        default: return null;
      }
    };
    
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
              <div className="flex items-center gap-1">
                {getTypeIcon(suggestion.type)}
                <Badge variant="outline" className="text-xs">
                  {suggestion.type === 'content' ? 'Content Quality' : 
                   suggestion.type === 'humanization' ? 'AI Humanization' :
                   suggestion.type === 'serp_integration' ? 'SERP Integration' :
                   'Solution Integration'}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced display for all SERP items
  const renderSerpItemsReference = () => {
    const allSerpItems = [
      ...selectedKeywordItems,
      ...selectedQuestions,
      ...selectedHeadings,
      ...selectedEntities,
      ...selectedContentGaps,
      ...selectedTopRanks
    ];

    if (selectedKeywords.length === 0 && allSerpItems.length === 0) return null;
    
    return (
      <div className="mb-4 p-3 border border-dashed rounded-md bg-secondary/10">
        <h4 className="text-sm font-medium mb-2">Keywords to Incorporate</h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {mainKeyword && (
            <Badge className="bg-blue-600 hover:bg-blue-700">{mainKeyword} (main)</Badge>
          )}
          {selectedKeywords.map((keyword, idx) => (
            <Badge key={`keyword-${idx}`} className="bg-blue-500/70 hover:bg-blue-500">{keyword}</Badge>
          ))}
          {selectedKeywordItems.map((item, idx) => (
            <Badge key={`serp-keyword-${idx}`} className="bg-blue-400/60 hover:bg-blue-400">{item.content}</Badge>
          ))}
        </div>

        {/* All Other SERP Items */}
        {(selectedQuestions.length > 0 || selectedHeadings.length > 0 || selectedEntities.length > 0 || selectedContentGaps.length > 0 || selectedTopRanks.length > 0) && (
          <>
            <h4 className="text-sm font-medium mb-2">Selected SERP Items to Integrate</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedQuestions.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-purple-600">Questions ({selectedQuestions.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedQuestions.map((item, idx) => (
                      <Badge key={`question-${idx}`} variant="outline" className="text-xs bg-purple-50 border-purple-200">
                        {item.content.substring(0, 50)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedHeadings.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-green-600">Headings ({selectedHeadings.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedHeadings.map((item, idx) => (
                      <Badge key={`heading-${idx}`} variant="outline" className="text-xs bg-green-50 border-green-200">
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEntities.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-orange-600">Entities ({selectedEntities.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedEntities.map((item, idx) => (
                      <Badge key={`entity-${idx}`} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                        {item.content}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedContentGaps.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-red-600">Content Gaps ({selectedContentGaps.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedContentGaps.map((item, idx) => (
                      <Badge key={`gap-${idx}`} variant="outline" className="text-xs bg-red-50 border-red-200">
                        {item.content.substring(0, 40)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Incorporate All SERP Items Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full text-xs"
              onClick={handleIncorporateAllSerp}
            >
              <Plus className="h-3 w-3 mr-1" />
              Incorporate All SERP Items
            </Button>
          </>
        )}
      </div>
    );
  };

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
            {(contentSuggestions.length > 0 || solutionSuggestions.length > 0 || aiDetectionSuggestions.length > 0 || serpIntegrationSuggestions.length > 0) ? (
              <div className="space-y-4">
                {renderSerpItemsReference()}
                
                {contentSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Content Quality Suggestions</h3>
                    {contentSuggestions.map(renderSuggestion)}
                  </div>
                )}
                
                {aiDetectionSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">AI Content Humanization</h3>
                    {aiDetectionSuggestions.map(renderSuggestion)}
                  </div>
                )}
                
                {serpIntegrationSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">SERP Integration Suggestions</h3>
                    {serpIntegrationSuggestions.map(renderSuggestion)}
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
