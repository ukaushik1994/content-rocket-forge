import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot, RefreshCw, BarChart3 } from 'lucide-react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { ModernActionButtons } from './ModernActionButtons';
import { InlineProgress } from './InlineProgress';
import { MessageStatus } from './MessageStatus';
import { ErrorMessageBubble } from './ErrorMessageBubble';
import { FormattedResponseRenderer } from './FormattedResponseRenderer';
import { Button } from '@/components/ui/button';
import { ThinkingIndicator } from './ThinkingIndicator';

interface EnhancedMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest?: boolean;
  onAction?: (action: ContextualAction) => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  onSendMessage?: (message: string) => void;
  thinkingContent?: string;
  isThinking?: boolean;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isLatest,
  onAction,
  onRetry,
  isRetrying = false,
  onSendMessage,
  thinkingContent,
  isThinking = false
}) => {
  const messageActions = message.actions || [];
  
  // Log message rendering details
  console.log('🎬 [MessageBubble] Rendering message:', {
    messageId: message.id,
    role: message.role,
    hasActions: !!message.actions,
    actionsLength: messageActions.length,
    actions: messageActions,
    hasVisualData: !!message.visualData
  });

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

  const bubbleVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.5
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
      <div className={`${isUser ? 'max-w-[50%]' : 'w-full max-w-4xl'}`}>
        <div className="relative">
          {/* Thinking Indicator - shown while AI is processing */}
          {!isUser && isThinking && thinkingContent && (
            <ThinkingIndicator
              thinkingText={thinkingContent}
              isActive={isThinking}
            />
          )}

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
              ? 'bg-primary text-primary-foreground border-primary/20 ml-4' 
              : 'bg-background/80 border-border/50 mr-4'
          }`}>
            <div className="px-8 py-4">
              <div className={`text-sm leading-relaxed ${
                isUser ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                ) : (
                  <FormattedResponseRenderer 
                    content={message.content} 
                    hasVisualData={!!message.visualData}
                  />
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


          {/* Action Buttons */}
          {messageActions.length > 0 && (
            <div className="mt-4">
              <ModernActionButtons 
                actions={messageActions} 
                onAction={onAction || (() => {})} 
              />
            </div>
          )}

                {/* Visual Data Indicator */}
                {message.visualData && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                    <BarChart3 className="w-3 h-3" />
                    <span>Contains visual data</span>
                    {message.visualData.parseError && (
                      <span className="text-yellow-600">(incomplete - click to regenerate)</span>
                    )}
                  </div>
                )}
                
                {/* Truncation Warning */}
                {message.visualData?.parseError && (
                  <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                      ⚠️ The visual data was incomplete. Click below to regenerate.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs"
                      onClick={() => onRetry?.()}
                    >
                      Regenerate Visualization
                    </Button>
                  </div>
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