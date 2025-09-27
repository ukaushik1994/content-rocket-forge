
import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot, User, Sparkles } from 'lucide-react';
import { ContextualAction } from '@/services/aiService';
import { WorkflowStreamingProgress } from './WorkflowStreamingProgress';
import { SerpVisualData } from './SerpVisualData';
import { VisualDataRenderer } from './VisualDataRenderer';
import { ModernActionButtons } from './ModernActionButtons';
import { MessageStatus } from './MessageStatus';
import { ErrorMessageBubble } from './ErrorMessageBubble';
import { cn } from '@/lib/utils';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest: boolean;
  onAction: (action: ContextualAction) => void;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-5xl mx-auto`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarFallback className={
            isUser 
              ? 'bg-gradient-to-br from-primary/20 to-blue-500/20' 
              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
          }>
            {isUser ? (
              <User className="h-5 w-5 text-primary" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={`flex-1 space-y-4 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Enhanced Workflow Progress Indicator */}
        {message.progressIndicator && !isUser && (
          <WorkflowStreamingProgress
            steps={message.progressIndicator.steps || []}
            currentStep={message.progressIndicator.currentStep?.toString() || '0'}
            workflowTitle={message.progressIndicator.workflowTitle || message.progressIndicator.stepName || 'Processing'}
            isStreaming={message.progressIndicator.isActive}
            progress={message.progressIndicator.progress}
          />
        )}

        {/* Main Message */}
        <Card className={`p-4 max-w-4xl backdrop-blur-xl ${
          isUser 
            ? 'bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20 ml-auto' 
            : 'bg-background/60 border-border/50'
        }`}>
          {/* Text Content */}
          <div className="prose prose-sm max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className={`text-sm leading-relaxed mb-2 last:mb-0 ${
                isUser ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {line}
              </p>
            ))}
          </div>

        {/* Visual Data Rendering */}
        {message.visualData && (
          <div className="mt-4">
            {message.visualData.type === 'serp_analysis' && message.visualData.serpData && (
              <SerpVisualData 
                serpData={message.visualData.serpData} 
                onActionClick={(action, data) => {
                  // Convert to contextual action and trigger
                  onAction({
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
            {message.visualData && (
              <div className="mt-3 mb-2">
                <VisualDataRenderer data={message.visualData} />
              </div>
            )}
          </div>
        )}
        </Card>

        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2">
            <ModernActionButtons 
              actions={message.actions}
              onAction={onAction}
            />
          </div>
        )}

        {/* Message Status for user messages */}
        {isUser && (
          <div className="flex justify-end mt-2">
            <MessageStatus 
              status={message.messageStatus as 'sent' | 'delivered' | 'read' | 'failed' || 'sent'}
              timestamp={message.timestamp}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
