import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, RefreshCw } from 'lucide-react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { InlineProgress } from './InlineProgress';
import { SerpVisualData } from './SerpVisualData';
import { MessageStatus } from './MessageStatus';
import { ErrorMessageBubble } from './ErrorMessageBubble';
import { FormattedResponseRenderer } from './FormattedResponseRenderer';
import { Button } from '@/components/ui/button';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest?: boolean;
  onAction?: (action: ContextualAction) => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isLatest,
  onAction,
  onRetry,
  isRetrying = false
}) => {
  // Check if this is an error message
  if (message.messageStatus === 'error' && onRetry) {
    return (
      <ErrorMessageBubble
        message={message}
        onRetry={onRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const isUser = message.role === 'user';

  // Helper function to generate prompts for SERP actions
  const getActionPrompt = (action: string, data: any): string => {
    switch (action) {
      case 'create-content-strategy':
        return `Create a comprehensive content strategy for "${data.keyword}" based on the SERP analysis. Include:
        - Content brief targeting ${data.searchVolume?.toLocaleString()} monthly searches
        - Strategy to compete against difficulty level ${data.difficulty}%
        - Content gaps to address: ${data.contentGaps?.join(', ') || 'competitive analysis needed'}
        - Opportunities in: ${Object.entries(data.opportunities || {}).map(([key, values]) => `${key} (${Array.isArray(values) ? values.length : 0} keywords)`).join(', ')}`;
        
      case 'analyze-competitors':
        return `Analyze the top competitors for "${data.keyword}" and provide actionable insights:
        - Competitor analysis for: ${data.competitors?.map(c => c.title).join(', ')}
        - Search volume context: ${data.searchVolume?.toLocaleString()} monthly searches
        - Competition level: ${data.difficulty}% difficulty
        - Provide content gaps, backlink opportunities, and competitive advantages to pursue`;
        
      case 'explore-related-keywords':
        return `Expand keyword research for "${data.keyword}" with related opportunities:
        - Base keyword: ${data.searchVolume?.toLocaleString()} monthly searches
        - Related keywords to analyze: ${data.relatedKeywords?.join(', ')}
        - Low competition opportunities: ${data.opportunities?.lowCompetition?.join(', ')}
        - High volume opportunities: ${data.opportunities?.highVolume?.join(', ')}
        - Trending keywords: ${data.opportunities?.trending?.join(', ')}`;
        
      default:
        return `Help me with ${action} for keyword "${data.keyword}"`;
    }
  };

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (only for AI messages) */}
      {!isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <Bot className="h-4 w-4 text-primary" />
        </motion.div>
      )}

      {/* Message Content */}
      <div className="max-w-sm sm:max-w-lg lg:max-w-2xl">
        <div className="relative">
          {/* AI Processing Indicator */}
          {message.progressIndicator && (
            <InlineProgress
              workflowTitle={message.progressIndicator.workflowTitle}
              currentStep={message.progressIndicator.currentStep}
              totalSteps={message.progressIndicator.totalSteps}
              stepName={message.progressIndicator.stepName}
              progress={message.progressIndicator.progress}
              isActive={message.progressIndicator.isActive}
            />
          )}

          {/* Message Content */}
          <Card className={`shadow-sm border backdrop-blur-sm ${
            isUser 
              ? 'bg-primary text-primary-foreground border-primary/20 ml-2' 
              : 'bg-background/80 border-border/50 mr-2'
          }`}>
            <div className="px-3 py-2">
              <div className={`text-sm leading-relaxed ${
                isUser ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                ) : (
                  <FormattedResponseRenderer content={message.content} />
                )}
              </div>
            </div>

            {/* Message Tail */}
            <div className={`absolute top-4 ${
              isUser ? '-left-1' : '-right-1'
            } w-2 h-2 transform rotate-45 ${
              isUser 
                ? 'bg-primary border-r border-b border-primary/20' 
                : 'bg-background/80 border-l border-t border-border/50'
            }`} />
          </Card>

          {/* Visual Data Rendering */}
          {message.visualData && (
            <div className="mt-3">
              {message.visualData.type === 'serp_analysis' && message.visualData.serpData && (
                <SerpVisualData 
                  serpData={message.visualData.serpData} 
                  onActionClick={(action, data) => {
                    // Convert to contextual action and trigger
                    onAction?.({
                      id: `serp-action-${Date.now()}`,
                      type: 'button',
                      label: action,
                      action: 'send_message',
                      data: { 
                        message: getActionPrompt(action, data)
                      }
                    });
                  }}
                />
              )}
              <VisualDataRenderer data={message.visualData} />
            </div>
          )}

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <ModernActionButtons 
              actions={message.actions} 
              onAction={onAction || (() => {})} 
            />
          )}

          {/* Retry Button for AI messages */}
          {!isUser && onRetry && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          )}

          {/* User message status */}
          {isUser && (
            <MessageStatus 
              status={message.messageStatus === 'error' ? 'failed' : (message.messageStatus as 'sent' | 'delivered' | 'read' | 'failed') || 'sent'}
              timestamp={message.timestamp}
            />
          )}
        </div>

        {/* Timestamp */}
        <motion.div 
          className={`mt-1 px-1 text-xs text-muted-foreground ${
            isUser ? 'text-right' : 'text-left'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.div>
      </div>

      {/* Avatar (only for user messages) */}
      {isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 border border-secondary/30 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <User className="h-4 w-4 text-secondary" />
        </motion.div>
      )}
    </motion.div>
  );
};