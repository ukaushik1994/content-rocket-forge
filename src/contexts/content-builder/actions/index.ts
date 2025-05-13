
import { ContentBuilderState } from '../types/state-types';
import { ContentBuilderAction } from '../types/action-types';
import { createKeywordActions } from './keywordActions';
import { createSerpActions } from './serpActions';
import { createContentActions } from './contentActions';
import { createOutlineActions } from './outlineActions';
import { createNavigationActions } from './navigationActions';
import { createSeoActions } from './seoActions';
import { createMetaActions } from './metaActions';
import { createClusterActions } from './clusterActions';
import { createSolutionActions } from './solutionActions';
import { createContentGenerationActions } from './contentGenerationActions';
import { createSaveActions } from './saveActions';
import { createAdvancedContentActions } from './advancedContentActions';
import { ContentBuilderContextType } from '../types/context-types';
import { SaveContentParams } from '../types/content-types';

export const createContentBuilderActions = (
  state: ContentBuilderState,
  dispatch: React.Dispatch<ContentBuilderAction>
): Omit<ContentBuilderContextType, 'state' | 'dispatch'> => {
  const keywordActions = createKeywordActions(state, dispatch);
  const serpActions = createSerpActions(state, dispatch);
  const contentActions = createContentActions(state, dispatch);
  const outlineActions = createOutlineActions(state, dispatch);
  const navigationActions = createNavigationActions(state, dispatch);
  const seoActions = createSeoActions(state, dispatch);
  const metaActions = createMetaActions(state, dispatch);
  const clusterActions = createClusterActions(state, dispatch);
  const solutionActions = createSolutionActions(state, dispatch);
  const contentGenerationActions = createContentGenerationActions(state, dispatch);
  const saveActions = createSaveActions(state, dispatch);
  const advancedContentActions = createAdvancedContentActions(state, dispatch);

  // Build a properly typed context object
  return {
    // Keyword actions
    setMainKeyword: keywordActions.setMainKeyword,
    addKeyword: keywordActions.addKeyword,
    removeKeyword: keywordActions.removeKeyword,

    // SERP actions
    analyzeKeyword: serpActions.analyzeKeyword as (keyword: string, regions?: string[]) => Promise<void>,
    addContentFromSerp: serpActions.addContentFromSerp,
    generateOutlineFromSelections: serpActions.generateOutlineFromSelections,
    
    // Content actions
    setContentTitle: contentActions.setContentTitle,
    setContentType: contentActions.setContentType,
    setContentFormat: contentActions.setContentFormat,
    setContentIntent: contentActions.setContentIntent,
    generateContent: contentActions.generateContent,
    saveContent: contentActions.saveContent,
    setContent: contentActions.setContent,
    updateContent: contentActions.updateContent,
    setOutline: outlineActions.setOutline,
    setOutlineSections: outlineActions.setOutlineSections,
    
    // Outline actions
    addOutlineItem: outlineActions.addOutlineItem,
    removeOutlineItem: outlineActions.removeOutlineItem,
    updateOutlineItem: outlineActions.updateOutlineItem,
    moveOutlineItem: outlineActions.moveOutlineItem,
    
    // Navigation actions
    navigateToStep: navigationActions.navigateToStep,
    
    // SEO actions
    analyzeSeo: async (content: string) => {
      // Implement the analyzeSeo method
      console.log('Analyzing SEO for content:', content);
      return Promise.resolve();
    },
    applySeoImprovement: (id: string) => {
      dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
    },
    skipOptimizationStep: seoActions.skipOptimizationStep,
    updateSeoScore: seoActions.updateSeoScore,
    addSeoImprovement: seoActions.addSeoImprovement,
    
    // Meta actions
    setMetaTitle: metaActions.setMetaTitle,
    setMetaDescription: metaActions.setMetaDescription,
    
    // Solution actions
    setSelectedSolution: solutionActions.setSelectedSolution,
    setContentLeadIn: solutionActions.setContentLeadIn,
    
    // Advanced Content actions
    saveContentToDraft: async (options: SaveContentParams): Promise<string | null> => {
      console.log('Saving content to draft:', options);
      return Promise.resolve("draft-id-123");
    },
    
    saveContentToPublished: async (options: SaveContentParams): Promise<string | null> => {
      console.log('Publishing content:', options);
      return Promise.resolve("publish-id-123");
    },
    
    setAdditionalInstructions: advancedContentActions.setAdditionalInstructions,
    setSuggestedTitles: contentActions.setSuggestedTitles,
    generateContentRequest: advancedContentActions.generateContentRequest,
    
    // SERP Region settings
    setSelectedRegions: serpActions.setSelectedRegions,
    
    // Cluster actions
    selectCluster: clusterActions.selectCluster
  };
};
