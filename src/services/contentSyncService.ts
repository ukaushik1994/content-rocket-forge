import { ContentHighlightService, SuggestionReplacement } from './contentHighlightService';
import { toast } from 'sonner';

export interface ContentSyncState {
  appliedSuggestions: string[];
  pendingChanges: SuggestionReplacement[];
  lastModified: Date;
}

export class ContentSyncService {
  private static appliedSuggestions = new Set<string>();
  
  /**
   * Apply a single suggestion to content and update context
   */
  static async applySuggestion(
    content: string,
    suggestionId: string,
    replacement: SuggestionReplacement,
    updateContentCallback: (newContent: string) => void
  ): Promise<boolean> {
    try {
      if (this.appliedSuggestions.has(suggestionId)) {
        toast.info('This suggestion has already been applied');
        return false;
      }

      const updatedContent = ContentHighlightService.applyReplacement(content, replacement);
      
      // Update the content in the context
      updateContentCallback(updatedContent);
      
      // Mark as applied
      this.appliedSuggestions.add(suggestionId);
      
      toast.success(`Applied: ${replacement.reason}`, {
        description: `Replaced "${replacement.before}" with "${replacement.after}"`
      });
      
      return true;
    } catch (error: any) {
      toast.error('Failed to apply suggestion: ' + error.message);
      return false;
    }
  }

  /**
   * Apply multiple suggestions at once
   */
  static async applyMultipleSuggestions(
    content: string,
    suggestions: Array<{ suggestionId: string; replacement: SuggestionReplacement }>,
    updateContentCallback: (newContent: string) => void
  ): Promise<number> {
    let appliedCount = 0;
    
    try {
      // Filter out already applied suggestions
      const unappliedSuggestions = suggestions.filter(
        ({ suggestionId }) => !this.appliedSuggestions.has(suggestionId)
      );
      
      if (unappliedSuggestions.length === 0) {
        toast.info('All selected suggestions have already been applied');
        return 0;
      }

      const replacements = unappliedSuggestions.map(s => s.replacement);
      const updatedContent = ContentHighlightService.applyMultipleReplacements(content, replacements);
      
      // Update the content in the context
      updateContentCallback(updatedContent);
      
      // Mark all as applied
      unappliedSuggestions.forEach(({ suggestionId }) => {
        this.appliedSuggestions.add(suggestionId);
      });
      
      appliedCount = unappliedSuggestions.length;
      
      toast.success(`Applied ${appliedCount} suggestions successfully`, {
        description: 'Content has been updated with the selected improvements'
      });
      
    } catch (error: any) {
      toast.error('Failed to apply some suggestions: ' + error.message);
    }
    
    return appliedCount;
  }

  /**
   * Check if suggestion has been applied
   */
  static isSuggestionApplied(suggestionId: string): boolean {
    return this.appliedSuggestions.has(suggestionId);
  }

  /**
   * Reset applied suggestions (useful when content changes significantly)
   */
  static resetAppliedSuggestions(): void {
    this.appliedSuggestions.clear();
    toast.info('Suggestion tracking reset');
  }

  /**
   * Get applied suggestions count
   */
  static getAppliedCount(): number {
    return this.appliedSuggestions.size;
  }

  /**
   * Revert a specific suggestion (if possible)
   */
  static revertSuggestion(suggestionId: string): void {
    this.appliedSuggestions.delete(suggestionId);
    toast.info('Suggestion marked as reverted');
  }
}

export default ContentSyncService;