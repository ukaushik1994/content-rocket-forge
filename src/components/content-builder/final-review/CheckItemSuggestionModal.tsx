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
      // Import CheckContextMapper for strategic context injection
      const { CheckContextMapper } = await import('@/services/content/CheckContextMapper');
      const contextMapper = CheckContextMapper.getInstance();
      
      // Generate strategic context based on check type and ContentBuilder state
      const strategicContext = contextMapper.mapCheckToStrategicContext(checkTitle, state);
      
      // Create enhanced context for the suggestion request
      const context = {
        mainKeyword: state.mainKeyword,
        selectedKeywords: state.selectedKeywords || [],
        contentLength: state.content.length,
        wordCount: state.content.split(' ').length,
        contentType: state.contentType || 'article',
        targetGoal: 'optimization',
        strategicContext: strategicContext.promptEnhancement,
        checkType: strategicContext.checkType
      };

      // Call dedicated content suggestions edge function
      console.log('🚀 Calling content suggestions service:', { checkTitle, contentLength: state.content.length });
      
      const response = await supabase.functions.invoke('content-suggestions', {
        body: {
          content: state.content,
          checkTitle: checkTitle,
          context: context
        }
      });

      console.log('🔍 Edge Function Response:', response);

      if (response.error) {
        console.error('❌ Edge function error:', response.error);
        toast.error('Failed to generate suggestions: ' + response.error.message);
        return;
      }

      if (!response.data || !response.data.suggestions) {
        console.error('❌ Empty suggestions response:', response.data);
        toast.error('No suggestions generated - empty response from AI service');
        return;
      }

      console.log('📝 Raw AI Suggestions:', response.data.suggestions);

      // Extract suggestions from the structured response (already parsed)
      const rawSuggestions = response.data.suggestions;
      console.log('✅ Using suggestions from edge function:', rawSuggestions);

      if (!Array.isArray(rawSuggestions) || rawSuggestions.length === 0) {
        console.log('⚠️ No suggestions in response:', rawSuggestions);
        toast.error('No suggestions generated - AI returned empty suggestions array');
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
      <DialogContent className="glass-panel max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader className="pb-4 border-b border-white/10">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
              <Wand2 className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white">AI Content Optimizer</span>
              <span className="text-sm text-white/70 font-normal">{checkTitle}</span>
            </div>
            {hasRecentErrors && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Issues detected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20 backdrop-blur-sm">
            <Button 
              onClick={generateSuggestion}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Content & Generating Smart Suggestions...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate AI Optimization Suggestions
                </>
              )}
            </Button>
          </div>

          {/* Enhanced Suggestions Display */}
          {enhancedSuggestions.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-white/10 backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"></div>
                  Smart Text Replacements
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {enhancedSuggestions.length} suggestions
                  </Badge>
                  {selectedSuggestions.size > 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                      {selectedSuggestions.size} selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Batch Operations */}
              <div className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => undo(setContent)}
                    disabled={!canUndo}
                    className="text-white/70 hover:text-white border-white/20 hover:bg-white/10"
                  >
                    <Undo2 className="h-4 w-4 mr-1" />
                    Undo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => redo(setContent)}
                    disabled={!canRedo}
                    className="text-white/70 hover:text-white border-white/20 hover:bg-white/10"
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
                        className="text-white/70 hover:text-white border-white/20 hover:bg-white/10"
                      >
                        Clear Selection
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleBatchApply}
                        disabled={isApplyingBatch}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
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
                <div key={suggestion.id} className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSuggestions.has(suggestion.id)}
                        onCheckedChange={() => toggleSuggestionSelection(suggestion.id)}
                        className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <div className="flex flex-col gap-1">
                        <h5 className="font-medium text-white text-sm">{suggestion.title}</h5>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={suggestion.impact === 'high' ? 'destructive' : suggestion.impact === 'medium' ? 'default' : 'secondary'}
                            className="text-xs px-2 py-0.5"
                          >
                            {suggestion.impact} impact
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 border-white/20 text-white/70">
                            {suggestion.category}
                          </Badge>
                          {suggestion.applied && (
                            <Badge className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30">
                              Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePreview(suggestion.id)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
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
                    <div key={idx} className="space-y-3">
                      <div className="text-sm text-white/80 p-2 bg-white/5 rounded-lg border-l-2 border-purple-500/50">
                        <span className="font-medium text-purple-300">Reason:</span> {replacement.reason}
                      </div>
                      
                      {/* Before/After Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
                          <div className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">Before</div>
                          <div className="text-sm text-white/90 font-mono leading-relaxed">
                            "{replacement.before}"
                          </div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
                          <div className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">After</div>
                          <div className="text-sm text-white/90 font-mono leading-relaxed">
                            "{replacement.after}"
                          </div>
                          <ArrowRight className="h-4 w-4 text-green-400 mt-2" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-3">
                        <Button
                          size="sm"
                          onClick={() => applySuggestion(suggestion.id, replacement)}
                          disabled={applyingIds.has(suggestion.id) || suggestion.applied}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md border-0"
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
                              Apply Change
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(replacement.after, idx)}
                          className="text-white/70 hover:text-white border-white/30 hover:bg-white/10 backdrop-blur-sm"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="mr-1 h-3 w-3 text-green-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              Copy Text
                            </>
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
              <div className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Raw AI Analysis
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(suggestion, 0)}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {copiedIndex === 0 ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-white/80 whitespace-pre-wrap bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto border border-white/5">
                  {suggestion}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-white/10 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-white/60 px-3 py-2 bg-white/5 rounded-lg">
              Applied {ContentSyncService.getAppliedCount()} suggestions in this session
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('helpful')}
                className="text-green-400 border-green-400/30 hover:bg-green-400/10 backdrop-blur-sm"
              >
                👍 Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFeedback('not_helpful')}
                className="text-red-400 border-red-400/30 hover:bg-red-400/10 backdrop-blur-sm"
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