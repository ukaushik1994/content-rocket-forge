import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Bot } from 'lucide-react';
import { RefreshButton } from '@/components/ui/refresh-button';
import { EnhancedChatMessage } from '@/types/enhancedChat';

interface ErrorMessageBubbleProps {
  message: EnhancedChatMessage;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorMessageBubble: React.FC<ErrorMessageBubbleProps> = ({
  message,
  onRetry,
  isRetrying = false
}) => {
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
      className="flex gap-3 justify-start"
    >
      {/* Error Avatar */}
      <motion.div 
        className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 border border-destructive/30 flex-shrink-0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
      >
        <Bot className="h-4 w-4 text-destructive" />
      </motion.div>

      {/* Error Message Content */}
      <div className="max-w-xs sm:max-w-md lg:max-w-lg">
        {/* Error Bubble */}
        <motion.div
          className="relative px-4 py-3 rounded-2xl shadow-sm border backdrop-blur-sm bg-destructive/10 border-destructive/20 mr-4"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Error Icon and Text */}
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm leading-relaxed text-destructive">
              {message.content}
            </div>
          </div>

          {/* Retry Button */}
          <div className="mt-3 flex justify-end">
            <RefreshButton
              isRefreshing={isRetrying}
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </RefreshButton>
          </div>

          {/* Message Tail */}
          <div className="absolute top-4 -right-1 w-2 h-2 transform rotate-45 bg-destructive/10 border-l border-t border-destructive/20" />
        </motion.div>

        {/* Timestamp */}
        <motion.div 
          className="mt-1 px-1 text-xs text-muted-foreground text-left"
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
    </motion.div>
  );
};