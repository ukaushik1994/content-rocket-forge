
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { unifiedDataService } from '@/services/unifiedDataService';
import { useAuth } from '@/contexts/AuthContext';

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
      const actions = generateCrossToolActions(context);
      
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

  const generateCrossToolActions = (context: any) => {
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

    return actions.sort((a, b) => 
      (b.priority === 'high' ? 2 : b.priority === 'medium' ? 1 : 0) - 
      (a.priority === 'high' ? 2 : a.priority === 'medium' ? 1 : 0)
    );
  };

  const navigateToContentBuilder = (strategy?: any, solution?: any, pipelineItem?: any) => {
    const params = new URLSearchParams();
    
    if (strategy?.main_keyword) params.set('keyword', strategy.main_keyword);
    if (strategy?.target_audience) params.set('audience', strategy.target_audience);
    if (strategy?.id) params.set('strategy_id', strategy.id);
    if (solution?.id) params.set('solution_id', solution.id);
    if (pipelineItem?.id) params.set('pipeline_id', pipelineItem.id);
    
    navigate(`/content-builder?${params.toString()}`);
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
