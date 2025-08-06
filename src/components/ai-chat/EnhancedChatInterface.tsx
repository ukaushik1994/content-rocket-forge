
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { EnhancedQuickActions } from './EnhancedQuickActions';
import { PlatformSummaryCard } from './PlatformSummaryCard';
import { TestOpenRouterButton } from './TestOpenRouterButton';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModelIndicator } from '@/components/ai/ModelIndicator';
import { Sparkles, Brain, TrendingUp, Menu, History } from 'lucide-react';

interface EnhancedChatInterfaceProps {
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  className = "" 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    createConversation,
    deleteConversation,
    sendMessage,
    handleAction,
    selectConversation
  } = useEnhancedAIChatDB();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Hide welcome when first message is sent
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages.length]);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const welcomeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, delay: 0.2 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <ChatHistorySidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={selectConversation}
            onCreateConversation={() => createConversation()}
            onDeleteConversation={deleteConversation}
            onToggleSidebar={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <motion.div 
        className="flex flex-col h-full flex-1"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      {/* Elegant Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <History className="h-4 w-4" />
              </Button>
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  AI Content Assistant
                </h1>
                <p className="text-sm text-white/60">
                  Your intelligent content marketing companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TestOpenRouterButton />
              <ModelIndicator className="text-xs" />
              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
          <div className="max-w-6xl mx-auto py-6 space-y-8">
            {/* Welcome State */}
            <AnimatePresence mode="wait">
              {showWelcome && (
                <motion.div
                  variants={welcomeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Welcome Hero */}
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-6"
                    >
                      <Sparkles className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-3">
                      Welcome to Your Content Intelligence Hub
                    </h2>
                    <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
                      I'm your AI assistant, here to help you optimize content, analyze performance, 
                      and grow your business using your solutions and real data.
                    </p>
                  </div>

                  {/* Platform Summary */}
                  <PlatformSummaryCard onAction={handleAction} />

                  {/* Quick Actions */}
                  <EnhancedQuickActions onAction={handleAction} />
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
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                  <Card className="flex items-center gap-3 text-white/70 text-sm px-4 py-3 bg-white/5 border-white/10 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    AI is analyzing your data and preparing insights...
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 bg-gradient-to-r from-background/95 to-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <EnhancedMessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder={
                messages.length === 0 
                  ? "Ask me about your content performance, start optimization workflows, or get strategic insights..."
                  : "Continue the conversation..."
              }
            />
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};
