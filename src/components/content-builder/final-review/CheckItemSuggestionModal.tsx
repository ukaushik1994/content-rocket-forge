import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Copy, Check, Wand2, Eye, EyeOff, ArrowRight, Undo2, Redo2, AlertTriangle } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { saveSuggestionFeedback } from '@/services/suggestionFeedbackService';
import { ContentHighlightService, EnhancedSuggestion } from '@/services/contentHighlightService';
import { ContentSyncService } from '@/services/contentSyncService';
import { EnhancedContentMatcher } from '@/services/content/enhancedContentMatcher';
import { supabase } from '@/integrations/supabase/client';
import { useBatchOperations } from '@/hooks/final-review/useBatchOperations';
import { useUndoSystem } from '@/hooks/final-review/useUndoSystem';
import { useContentIntegration } from '@/hooks/final-review/useContentIntegration';
import { useErrorBoundary } from '@/hooks/final-review/useErrorBoundary';

interface CheckItemSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkTitle: string;
}

export const CheckItemSuggestionModal = ({ isOpen, onClose, checkTitle }: CheckItemSuggestionModalProps) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [enhancedSuggestions, setEnhancedSuggestions] = useState<EnhancedSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [applyingIds, setApplyingIds] = useState<Set<string>>(new Set());
  const { state, setContent } = useContentBuilder();

  // Enhanced functionality hooks
  const { 
    selectedSuggestions, 
    isApplyingBatch, 
    toggleSuggestionSelection, 
    clearSelection, 
    applySelectedSuggestions 
  } = useBatchOperations();
  
  const { 
    addUndoEntry, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useUndoSystem();

  const { safeUpdateContent } = useContentIntegration();
  const { withErrorBoundary, hasRecentErrors } = useErrorBoundary();

  const generateSuggestion = withErrorBoundary(async () => {
    if (!checkTitle || !state.content) {
      toast.error('Missing check title or content');
      return;
    }

    setIsGenerating(true);
    try {
      // Create context for the suggestion request
      const context = {
        mainKeyword: state.mainKeyword,
        selectedKeywords: state.selectedKeywords || [],
        contentLength: state.content.length,
        wordCount: state.content.split(' ').length,
        contentType: state.contentType || 'article',
        targetGoal: 'optimization',
        serpData: state.serpData,
        selectedSolution: state.selectedSolution
      };

      // Use AIServiceController with suggestion_generation use case
      const AIServiceController = (await import('@/services/aiService/AIServiceController')).default;
      
      // Create the prompt for AI analysis
      const userPrompt = `Check Title: ${checkTitle}

Content to analyze:
${state.content}

Context:
- Main Keyword: ${context.mainKeyword || 'Not specified'}
- Secondary Keywords: ${context.selectedKeywords?.join(', ') || 'None'}
- Content Type: ${context.contentType}
- Word Count: ${context.wordCount}
- Target Goal: ${context.targetGoal}

Please analyze this content for the specific issue mentioned in the check title and provide text replacement suggestions to address it.`;

      const response = await AIServiceController.generate('suggestion_generation', undefined, userPrompt);

      if (!response || !response.content) {
        toast.error('No suggestions generated');
        return;
      }

      // Parse AI response as JSON
      let rawSuggestions;
      try {
        rawSuggestions = JSON.parse(response.content);
      } catch (error) {
        console.error('Failed to parse AI response as JSON:', response.content);
        toast.error('Invalid AI response format');
        return;
      }

      if (!Array.isArray(rawSuggestions) || rawSuggestions.length === 0) {
        toast.error('No suggestions generated');
        return;
      }

      // Enhanced matching with the new content matcher
      const enhancedMatcher = EnhancedContentMatcher.getInstance();
      const validatedSuggestions = [];

      for (const suggestion of rawSuggestions) {
        const validatedReplacements = [];
        
        for (const replacement of suggestion.replacements || []) {
          // Use enhanced matching to find and validate the text location
          const matchResult = enhancedMatcher.findTextInContent(
            state.content,
            replacement.before,
            { exactMatch: false, fuzzyThreshold: 0.8, maxResults: 1 }
          );

          if (matchResult.found && matchResult.bestMatch) {
            validatedReplacements.push({
              ...replacement,
              location: {
                ...replacement.location,
                ...matchResult.bestMatch,
                confidence: matchResult.bestMatch.confidence
              }
            });
          } else {
            console.warn(`Could not locate text for replacement:`, replacement.before);
          }
        }

        if (validatedReplacements.length > 0) {
          validatedSuggestions.push({
            ...suggestion,
            replacements: validatedReplacements
          });
        }
      }

      // Convert to enhanced suggestions format
      const enhancedSuggestions: EnhancedSuggestion[] = validatedSuggestions.map(suggestion => ({
        id: suggestion.id,
        title: suggestion.title,
        replacements: suggestion.replacements,
        impact: suggestion.impact,
        category: suggestion.category,
        applied: false
      }));

      setSuggestion(JSON.stringify(validatedSuggestions, null, 2));
      setEnhancedSuggestions(enhancedSuggestions);
      
      toast.success(`Generated ${enhancedSuggestions.length} validated suggestions`);
      
    } catch (error: any) {
      console.error('Error generating suggestion:', error);
      toast.error('Failed to generate suggestion: ' + (error.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  }, 'AI Suggestion Generation', true);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const applySuggestion = withErrorBoundary(async (suggestionId: string, replacement: any) => {
    if (!state.content) {
      toast.error('No content available');
      return;
    }

    setApplyingIds(prev => new Set([...prev, suggestionId]));
    const originalContent = state.content;
    
    try {
      // Use enhanced content matcher for precise text replacement
      const enhancedMatcher = EnhancedContentMatcher.getInstance();
      const replaceResult = enhancedMatcher.applySmartReplacement(
        originalContent,
        replacement.before,
        replacement.after
      );
      
      if (!replaceResult.success) {
        toast.error('Could not locate the text to replace. Content may have changed.');
        return;
      }

      // Add to undo history before updating
      addUndoEntry(
        originalContent,
        replaceResult.newContent,
        `Applied suggestion: ${replacement.reason}`,
        suggestionId
      );

      // Use safe content update with validation and refresh
      const success = await safeUpdateContent(
        originalContent, 
        replaceResult.newContent, 
        `Applied: ${replacement.reason}`
      );

      if (success) {
        // Update the suggestions to show as applied
        setEnhancedSuggestions(prev => 
          prev.map(s => 
            s.id === suggestionId 
              ? { ...s, applied: true } 
              : s
          )
        );
        
        toast.success('Suggestion applied successfully');
      }
    } catch (error: any) {
      console.error('Failed to apply suggestion:', error);
      toast.error('Failed to apply suggestion: ' + error.message);
    } finally {
      setApplyingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestionId);
        return newSet;
      });
    }
  }, 'Suggestion Application', true);

  const handleBatchApply = async () => {
    if (!state.content) {
      toast.error('No content available');
      return;
    }

    const originalContent = state.content;
    
    await applySelectedSuggestions(
      state.content,
      enhancedSuggestions,
      (newContent: string) => {
        // Add to undo history before updating
        addUndoEntry(
          originalContent,
          newContent,
          `Applied ${selectedSuggestions.size} suggestions in batch`,
        );
        setContent(newContent);
        
        // Update suggestions to show as applied
        setEnhancedSuggestions(prev => 
          prev.map(s => 
            selectedSuggestions.has(s.id) 
              ? { ...s, applied: true } 
              : s
          )
        );
      }
    );
  };

  const togglePreview = (suggestionId: string) => {
    setShowPreview(prev => prev === suggestionId ? null : suggestionId);
  };

  const handleFeedback = async (type: 'helpful' | 'not_helpful' | 'partially_helpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User authentication required');
        return;
      }

      await saveSuggestionFeedback({
        user_id: user.id,
        check_title: checkTitle,
        suggestion_text: suggestion || enhancedSuggestions.map(s => s.title).join('; '),
        helpful: type === 'helpful'
      });
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to save feedback:', error);
      toast.error('Failed to save feedback');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            AI Content Optimizer: {checkTitle}
            {hasRecentErrors && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Issues detected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <Button 
            onClick={generateSuggestion}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Content & Generating Suggestions...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Smart Suggestions
              </>
            )}
          </Button>

          {/* Enhanced Suggestions Display */}
          {enhancedSuggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Smart Text Replacements</h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300">
                    {enhancedSuggestions.length} suggestions
                  </Badge>
                  {selectedSuggestions.size > 0 && (
                    <Badge className="bg-green-500/20 text-green-300">
                      {selectedSuggestions.size} selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Batch Operations */}
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => undo(setContent)}
                    disabled={!canUndo}
                    className="text-white/70 hover:text-white"
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => redo(setContent)}
                    disabled={!canRedo}
                    className="text-white/70 hover:text-white"
                  >
                    <Redo2 className="h-4 w-4 mr-1" />
                    Redo
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSuggestions.size > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                        className="text-white/70 hover:text-white"
                      >
                        Clear Selection
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleBatchApply}
                        disabled={isApplyingBatch}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isApplyingBatch ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Applying {selectedSuggestions.size}...
                          </>
                        ) : (
                          `Apply ${selectedSuggestions.size} Selected`
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {enhancedSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-glass border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedSuggestions.has(suggestion.id)}
                        onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                        className="border-white/20"
                      />
                      <h5 className="font-medium text-white">{suggestion.title}</h5>
                      <Badge variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}>
                        {suggestion.impact} impact
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePreview(suggestion.id)}
                        className="text-white/70 hover:text-white"
                      >
                        {showPreview === suggestion.id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {suggestion.replacements.map((replacement, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-sm text-white/80 mb-2">{replacement.reason}</div>
                      
                      {/* Before/After Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                          <div className="text-xs text-red-400 mb-1">BEFORE</div>
                          <div className="text-sm text-white/90 font-mono">
                            "{replacement.before}"
                          </div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                          <div className="text-xs text-green-400 mb-1">AFTER</div>
                          <div className="text-sm text-white/90 font-mono">
                            "{replacement.after}"
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(suggestion.id, replacement)}
                          disabled={applyingIds.has(suggestion.id) || suggestion.applied}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {applyingIds.has(suggestion.id) ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Applying...
                            </>
                          ) : suggestion.applied ? (
                            <>
                              <Check className="mr-2 h-3 w-3" />
                              Applied
                            </>
                          ) : (
                            <>
                              <ArrowRight className="mr-2 h-3 w-3" />
                              Apply This Fix
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(replacement.after, idx)}
                          className="text-white/70 hover:text-white"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Raw suggestion fallback */}
          {suggestion && enhancedSuggestions.length === 0 && (
            <div className="space-y-4">
              <div className="bg-glass border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">AI Analysis</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(suggestion, 0)}
                    className="text-white/70 hover:text-white"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-white/80 whitespace-pre-wrap bg-black/20 rounded p-3 max-h-64 overflow-y-auto">
                  {suggestion}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-white/60">
              Applied {ContentSyncService.getAppliedCount()} suggestions in this session
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('helpful')}
                className="text-green-400 border-green-400 hover:bg-green-400/10"
              >
                👍 Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('not_helpful')}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                👎 Not Helpful
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};