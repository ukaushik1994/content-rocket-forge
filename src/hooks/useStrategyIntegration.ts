
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { unifiedDataService } from '@/services/unifiedDataService';
import { useAuth } from '@/contexts/AuthContext';
import { keywordStrategyBridge } from '@/services/keywordStrategyBridge';
import { keywordLibraryService } from '@/services/keywordLibraryService';

interface StrategyIntegrationState {
  isLoading: boolean;
  context: any;
  crossToolActions: any[];
}

export const useStrategyIntegration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { currentStrategy } = useContentStrategy();
  const [state, setState] = useState<StrategyIntegrationState>({
    isLoading: true,
    context: null,
    crossToolActions: []
  });

  useEffect(() => {
    if (user) {
      loadIntegratedContext();
    }
  }, [user, currentStrategy]);

  const loadIntegratedContext = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const context = await unifiedDataService.getUserContext(user.id);
      const actions = await generateCrossToolActions(context);
      
      setState({
        isLoading: false,
        context,
        crossToolActions: actions
      });
    } catch (error) {
      console.error('Error loading integrated context:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const generateCrossToolActions = async (context: any) => {
    const actions = [];

    // Strategy-based actions
    if (context.currentStrategy) {
      actions.push({
        id: 'create-content',
        label: 'Create Content from Strategy',
        icon: 'FileText',
        action: () => navigateToContentBuilder(context.currentStrategy),
        priority: 'high'
      });

      if (context.currentStrategy.main_keyword) {
        actions.push({
          id: 'analyze-keyword',
          label: `Analyze "${context.currentStrategy.main_keyword}"`,
          icon: 'TrendingUp',
          action: () => navigateToAIChat('keyword-analysis', context.currentStrategy.main_keyword),
          priority: 'medium'
        });
      }

      // Keyword-driven actions
      try {
        const keywordRecommendations = await keywordStrategyBridge.getKeywordRecommendations(
          context.currentStrategy.id, 
          3
        );
        
        if (keywordRecommendations.length > 0) {
          const topKeyword = keywordRecommendations[0];
          actions.push({
            id: 'high-opportunity-keyword',
            label: `Create Content for "${topKeyword.keyword.keyword}"`,
            icon: 'Zap',
            action: () => navigateToContentBuilder(null, null, null, topKeyword.keyword.keyword),
            priority: 'high',
            metadata: { 
              opportunityScore: topKeyword.opportunityScore,
              contentType: topKeyword.recommendedContentType 
            }
          });
        }

        // Content gap analysis action
        const gapAnalysis = await keywordStrategyBridge.analyzeContentGaps(context.currentStrategy.id);
        if (gapAnalysis.gapKeywords.length > 0) {
          actions.push({
            id: 'address-content-gaps',
            label: `Address ${gapAnalysis.gapKeywords.length} Content Gaps`,
            icon: 'Target',
            action: () => navigateToKeywords('gap-analysis'),
            priority: 'medium',
            metadata: { gapCount: gapAnalysis.gapKeywords.length }
          });
        }
      } catch (error) {
        console.error('Error generating keyword-driven actions:', error);
      }
    }

    // Solution-based actions
    if (context.solutions.length > 0) {
      actions.push({
        id: 'solution-content',
        label: `Create Content for ${context.solutions[0].name}`,
        icon: 'Target',
        action: () => navigateToContentBuilder(null, context.solutions[0]),
        priority: 'medium'
      });
    }

    // Pipeline actions
    if (context.pipelineItems.length > 0) {
      const inProgressItems = context.pipelineItems.filter((item: any) => 
        item.stage === 'in_progress'
      );
      
      if (inProgressItems.length > 0) {
        actions.push({
          id: 'continue-content',
          label: `Continue ${inProgressItems[0].title}`,
          icon: 'Play',
          action: () => navigateToContentBuilder(null, null, inProgressItems[0]),
          priority: 'high'
        });
      }
    }

    // Keyword library actions
    try {
      const { keywords } = await keywordLibraryService.getKeywords({ data_freshness: 'stale' }, 1, 5);
      if (keywords.length > 0) {
        actions.push({
          id: 'refresh-keyword-data',
          label: `Refresh ${keywords.length} Stale Keywords`,
          icon: 'RefreshCw',
          action: () => navigateToKeywords('refresh-data'),
          priority: 'low'
        });
      }
    } catch (error) {
      console.error('Error checking stale keywords:', error);
    }

    return actions.sort((a, b) => 
      (b.priority === 'high' ? 2 : b.priority === 'medium' ? 1 : 0) - 
      (a.priority === 'high' ? 2 : a.priority === 'medium' ? 1 : 0)
    );
  };

  const navigateToContentBuilder = (strategy?: any, solution?: any, pipelineItem?: any, keyword?: string) => {
    const params = new URLSearchParams();
    
    if (keyword) params.set('keyword', keyword);
    else if (strategy?.main_keyword) params.set('keyword', strategy.main_keyword);
    if (strategy?.target_audience) params.set('audience', strategy.target_audience);
    if (strategy?.id) params.set('strategy_id', strategy.id);
    if (solution?.id) params.set('solution_id', solution.id);
    if (pipelineItem?.id) params.set('pipeline_id', pipelineItem.id);
    
    navigate(`/ai-chat`);
  };

  const navigateToKeywords = (tab?: string) => {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    navigate(`/keywords?${params.toString()}`);
  };

  const navigateToAIChat = (context: string, keyword?: string) => {
    const message = keyword 
      ? `Help me analyze the keyword "${keyword}" for my content strategy`
      : `Help me with my content strategy`;
    
    navigate('/ai-chat', {
      state: { message, context }
    });
  };

  const refreshContext = () => {
    unifiedDataService.invalidateCache();
    loadIntegratedContext();
  };

  return {
    ...state,
    refreshContext,
    navigateToContentBuilder,
    navigateToAIChat
  };
};
