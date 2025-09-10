import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';

interface StreamingMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest?: boolean;
}

export const StreamingMessageBubble: React.FC<StreamingMessageBubbleProps> = ({
  message,
  isLatest = false
}) => {
  const isStreaming = message.isStreaming && message.role === 'assistant';

  return (
    <div className="relative">
      <MessageBubble message={message} isLatest={isLatest} />
      
      {/* Streaming indicator */}
      <AnimatePresence>
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -bottom-1 right-2 flex items-center gap-1 bg-primary/10 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-primary"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Streaming...</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Typing cursor effect for streaming text */}
      {isStreaming && message.content && (
        <motion.div
          className="absolute bottom-2 left-4 w-0.5 h-4 bg-primary opacity-70"
          animate={{
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            left: `${Math.min(message.content.length * 8 + 16, 90)}%`
          }}
        />
      )}
    </div>
  );
};