
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { QuickActionsPanel } from './QuickActionsPanel';
import { ConversationMessage } from '@/hooks/useAIChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onClearConversation: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  activeConversation: string | null;
}

export const ChatInterface = forwardRef<HTMLDivElement, ChatInterfaceProps>(({
  messages,
  isLoading,
  isTyping,
  onSendMessage,
  onClearConversation,
  onToggleSidebar,
  sidebarOpen,
  activeConversation
}, ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show quick actions if no conversation is active or no messages
  useEffect(() => {
    setShowQuickActions(!activeConversation || messages.length === 0);
  }, [activeConversation, messages.length]);

  const handleSendMessage = (message: string) => {
    setShowQuickActions(false);
    onSendMessage(message);
  };

  const handleQuickAction = (action: string, data?: any) => {
    if (action.startsWith('navigate:')) {
      const path = action.replace('navigate:', '');
      window.location.href = path;
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      handleSendMessage(message);
    } else if (action === 'clear-conversation') {
      onClearConversation();
      toast({
        title: "Conversation cleared",
        description: "All messages have been removed from this conversation."
      });
    }
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
        onClearConversation={onClearConversation}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
        hasMessages={messages.length > 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="max-w-4xl mx-auto space-y-6">
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
              <MessageList 
                messages={messages}
                isTyping={isTyping}
                onAction={handleQuickAction}
              />
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-muted-foreground text-sm px-4"
                >
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
                  AI is thinking...
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-background/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={
                messages.length === 0 
                  ? "Ask me anything about content creation, SEO, or marketing strategy..."
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
