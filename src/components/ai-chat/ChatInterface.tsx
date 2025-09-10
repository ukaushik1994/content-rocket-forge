
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { QuickActionsPanel } from './QuickActionsPanel';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedAIChat } from '@/hooks/useEnhancedAIChat';

interface ChatInterfaceProps {
  onClearConversation: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  activeConversation: string | null;
}

export const ChatInterface = forwardRef<HTMLDivElement, ChatInterfaceProps>(({
  onClearConversation,
  onToggleSidebar,
  sidebarOpen,
  activeConversation
}, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const { toast } = useToast();
  
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleAction
  } = useEnhancedAIChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show/hide quick actions based on messages
  useEffect(() => {
    setShowQuickActions(messages.length === 0);
  }, [messages.length]);

  const handleSendMessage = async (message: string) => {
    setShowQuickActions(false);
    await sendMessage(message);
  };

  const handleQuickAction = (action: string, data?: any) => {
    handleAction(action, data);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      ref={ref}
      className="flex flex-col h-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <ChatHeader 
        onClearConversation={() => {
          onClearConversation();
          setShowQuickActions(true);
        }}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
        hasMessages={messages.length > 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome State */}
            <AnimatePresence mode="wait">
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuickActionsPanel onAction={handleQuickAction} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="space-y-8">
                {messages.map((message, index) => (
                  <EnhancedMessageBubble
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4 max-w-4xl mx-auto"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary/20" />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    AI is analyzing and preparing your response...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={
                messages.length === 0 
                  ? "Ask me anything about your content performance, start keyword research, or get platform insights..."
                  : "Continue the conversation..."
              }
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ChatInterface.displayName = 'ChatInterface';
