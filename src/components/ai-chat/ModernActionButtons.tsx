import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContextualAction } from '@/services/aiService';
import { ChatSuggestion } from '@/hooks/useSmartSuggestions';
import { 
  PenTool, 
  Search, 
  TrendingUp, 
  Target, 
  FileText, 
  BarChart3,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModernActionButtonsProps {
  actions: ContextualAction[];
  suggestions?: ChatSuggestion[];
  onAction: (action: ContextualAction) => void;
  onSuggestionClick?: (suggestion: ChatSuggestion) => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create-blog-post':
    case 'create-article':
      return FileText;
    case 'create-landing-page':
    case 'create-sales-page':
      return PenTool;
    case 'keyword-research':
    case 'analyze-keywords':
      return Search;
    case 'seo-optimization':
    case 'optimize-content':
      return Target;
    case 'content-strategy':
    case 'create-strategy':
      return BarChart3;
    case 'competitor-analysis':
      return TrendingUp;
    default:
      return FileText;
  }
};

export const ModernActionButtons: React.FC<ModernActionButtonsProps> = ({ 
  actions, 
  suggestions = [], 
  onAction, 
  onSuggestionClick 
}) => {
  const navigate = useNavigate();

  // Filter only working actions and limit to 4
  const workingActions = actions.filter(action => {
    // Only include actions that actually work
    return action.action?.includes('create-') || 
           action.action?.includes('content-') ||
           action.action?.includes('keyword-research') ||
           action.action?.includes('research') ||
           action.action?.includes('strategy') ||
           action.action?.includes('workflow:');
  }).slice(0, 4);

  // Combine actions and suggestions, prioritizing actions
  const allItems = [
    ...workingActions.map(action => ({ type: 'action' as const, item: action })),
    ...suggestions.slice(0, Math.max(0, 4 - workingActions.length)).map(suggestion => ({ type: 'suggestion' as const, item: suggestion }))
  ];

  if (allItems.length === 0) {
    return null;
  }

  const handleActionClick = (action: ContextualAction) => {
    console.log('🎯 Action clicked:', action);
    
    // Handle content creation actions with navigation
    if (action.action?.includes('create-') || action.action?.includes('content-')) {
      const preloadData = {
        mainKeyword: action.data?.keyword || action.data?.mainKeyword || action.label,
        selectedKeywords: action.data?.keywords || [],
        contentType: action.data?.contentType || 'blog-post',
        contentTitle: action.data?.title || action.label,
        location: action.data?.location,
        step: action.data?.step || 1,
        description: action.description,
        ...action.data
      };

      navigate('/content', { 
        state: { prefilledData: preloadData }
      });
    } else if (action.action?.includes('keyword-research') || action.action?.includes('research')) {
      navigate('/research', { 
        state: { 
          prefilledKeyword: action.data?.keyword || action.data?.mainKeyword || action.label 
        }
      });
    } else if (action.action?.includes('strategy')) {
      navigate('/strategies');
    } else {
      onAction(action);
    }
  };

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <motion.div 
      className="mt-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex gap-2 flex-wrap">
        {allItems.map((item, index) => {
          if (item.type === 'action') {
            const action = item.item as ContextualAction;
            const Icon = getActionIcon(action.action || '');
            
            return (
              <motion.div
                key={`action-${action.id || index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 gap-1.5 bg-background/50 hover:bg-primary/10 border-border/50 hover:border-primary/30 text-xs"
                  onClick={() => handleActionClick(action)}
                >
                  <Icon className="h-3 w-3" />
                  <span className="max-w-20 truncate">{action.label}</span>
                  {action.action?.includes('workflow:') && (
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  )}
                </Button>
              </motion.div>
            );
          } else {
            const suggestion = item.item as ChatSuggestion;
            
            return (
              <motion.div
                key={`suggestion-${suggestion.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/30 text-xs text-primary hover:text-primary"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="max-w-16 truncate">{suggestion.text}</span>
                  <Badge variant="secondary" className="text-xs ml-1 px-1">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </Button>
              </motion.div>
            );
          }
        })}
      </div>
    </motion.div>
  );
};