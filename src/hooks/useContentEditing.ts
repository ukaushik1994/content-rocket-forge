import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { supabase } from '@/integrations/supabase/client';

interface EditingOptions {
  contentId?: string;
  onContentUpdate?: (newContent: string) => void;
}

type EditAction = 'regenerate' | 'improve' | 'expand' | 'compress' | 'tone';

interface EditHistoryEntry {
  content: string;
  action: EditAction;
  timestamp: Date;
}

export function useContentEditing(options: EditingOptions = {}) {
  const { contentId, onContentUpdate } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<EditAction | null>(null);
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add to history
  const addToHistory = useCallback((content: string, action: EditAction) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ content, action, timestamp: new Date() });
      return newHistory.slice(-20); // Keep last 20 entries
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevEntry = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onContentUpdate?.(prevEntry.content);
      return prevEntry.content;
    }
    return null;
  }, [history, historyIndex, onContentUpdate]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onContentUpdate?.(nextEntry.content);
      return nextEntry.content;
    }
    return null;
  }, [history, historyIndex, onContentUpdate]);

  // Generic AI operation
  const performAIOperation = useCallback(async (
    content: string,
    action: EditAction,
    additionalContext?: string
  ) => {
    if (isProcessing || !content.trim()) return null;

    setIsProcessing(true);
    setCurrentAction(action);

    const prompts: Record<EditAction, { system: string; user: string }> = {
      regenerate: {
        system: 'You are a professional content writer. Regenerate the following content while maintaining its core message, structure, and intent. Improve clarity and engagement.',
        user: `Regenerate this content:\n\n${content}`
      },
      improve: {
        system: 'You are a content optimization expert. Improve the following content for better readability, engagement, and SEO. Fix any issues and enhance the quality.',
        user: `Improve this content:\n\n${content}`
      },
      expand: {
        system: 'You are a content expansion specialist. Expand the following content by adding more details, examples, and explanations. Keep the same structure but make it more comprehensive.',
        user: `Expand this content to be more detailed and comprehensive:\n\n${content}`
      },
      compress: {
        system: 'You are a content summarization expert. Condense the following content to be more concise while retaining all key points. Remove redundancy and tighten the language.',
        user: `Compress this content to be more concise:\n\n${content}`
      },
      tone: {
        system: `You are a content rewriting specialist. Rewrite the following content with a ${additionalContext || 'professional'} tone while maintaining the core message.`,
        user: `Rewrite this content with a ${additionalContext || 'professional'} tone:\n\n${content}`
      }
    };

    try {
      const { system, user } = prompts[action];
      
      const result = await AIServiceController.generate(
        'content_improvement',
        system,
        user,
        { temperature: 0.7, maxTokens: 4000 }
      );

      if (!result?.content) {
        throw new Error('No content generated');
      }

      const newContent = result.content.trim();
      addToHistory(content, action);
      onContentUpdate?.(newContent);

      // Persist to database if contentId provided
      if (contentId) {
        const { error } = await supabase
          .from('content_items')
          .update({ content: newContent, updated_at: new Date().toISOString() })
          .eq('id', contentId);

        if (error) {
          console.error('[useContentEditing] Failed to save:', error);
          toast.warning('Content updated but failed to save');
        }
      }

      toast.success(`Content ${action === 'tone' ? 'tone changed' : action + 'd'} successfully`);
      return newContent;

    } catch (error) {
      console.error(`[useContentEditing] ${action} error:`, error);
      toast.error(`Failed to ${action} content. Please check AI provider settings.`);
      return null;
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  }, [isProcessing, contentId, onContentUpdate, addToHistory]);

  // Convenience methods
  const regenerate = useCallback((content: string) => 
    performAIOperation(content, 'regenerate'), [performAIOperation]);
  
  const improve = useCallback((content: string) => 
    performAIOperation(content, 'improve'), [performAIOperation]);
  
  const expand = useCallback((content: string) => 
    performAIOperation(content, 'expand'), [performAIOperation]);
  
  const compress = useCallback((content: string) => 
    performAIOperation(content, 'compress'), [performAIOperation]);
  
  const changeTone = useCallback((content: string, tone: string) => 
    performAIOperation(content, 'tone', tone), [performAIOperation]);

  return {
    isProcessing,
    currentAction,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    historyLength: history.length,
    regenerate,
    improve,
    expand,
    compress,
    changeTone,
    undo,
    redo
  };
}
