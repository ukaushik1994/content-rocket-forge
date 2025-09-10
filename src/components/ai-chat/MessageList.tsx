
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { ActionButtons } from './ActionButtons';
import { ConversationMessage } from '@/hooks/useAIChat';

interface MessageListProps {
  messages: ConversationMessage[];
  isTyping: boolean;
  onAction: (action: string, data?: any) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  onAction
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            layout
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <MessageBubble 
              message={message} // Pass the full ConversationMessage with all required properties
              isLatest={index === messages.length - 1}
            />
            
            {/* Action Buttons for Assistant Messages */}
            {message.role === 'assistant' && message.actions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-start"
              >
                <div className="max-w-xs sm:max-w-md">
                  <ActionButtons 
                    actions={message.actions}
                    onAction={onAction}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
