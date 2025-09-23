
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { QuickActionsPanel } from './QuickActionsPanel';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { WorkflowManager } from './WorkflowManager';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ContextualAction } from '@/services/aiService';
import { useEnhancedAIChat } from '@/hooks/useEnhancedAIChat';
import { useSerpSmartSuggestions } from '@/hooks/useSerpSmartSuggestions';
import { serpWorkflowOrchestrator } from '@/services/serpWorkflowOrchestrator';

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
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const { toast } = useToast();
  
  const {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleAction
  } = useEnhancedAIChat();

  const { suggestions, isLoading: suggestionsLoading } = useSerpSmartSuggestions({ 
    conversationHistory: messages, 
    userContext: {},
    serpData: []
  });

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

  // Wrapper to handle ContextualAction format for EnhancedMessageBubble
  const handleContextualAction = (action: ContextualAction) => {
    console.log('Converting contextual action:', action);
    // Convert ContextualAction to the string format expected by handleAction
    handleAction(action.action, action.data);
  };

  const handleQuickAction = (action: string, data?: any) => {
    handleAction(action, data);
  };

  const handleSuggestionClick = (suggestion: any) => {
    handleAction(suggestion.action, suggestion.data);
  };

  // Transform suggestions to match SmartSuggestion interface
  const transformedSuggestions = suggestions.map(suggestion => ({
    ...suggestion,
    type: suggestion.type === 'optimization' ? 'opportunity' : 
          suggestion.type === 'strategy' ? 'trend' :
          suggestion.type === 'competitive' ? 'opportunity' :
          suggestion.type as 'keyword' | 'content' | 'trend' | 'opportunity'
  }));

  const handleWorkflowAction = async (workflowAction: string, data?: any) => {
    try {
      // Handle workflow actions using available methods
      if (workflowAction === 'pause') {
        await serpWorkflowOrchestrator.pauseWorkflow(data?.workflowId);
      } else if (workflowAction === 'resume') {
        await serpWorkflowOrchestrator.resumeWorkflow(data?.workflowId);
      } else if (workflowAction === 'execute') {
        await serpWorkflowOrchestrator.executeWorkflow(data?.workflowType, data?.params);
      }
      
      // Refresh workflows by checking status
      const workflowStatuses = await Promise.all(
        activeWorkflows.map(w => serpWorkflowOrchestrator.getWorkflowStatus(w.id))
      );
      setActiveWorkflows(workflowStatuses.filter(Boolean));
    } catch (error) {
      toast({
        title: "Workflow Error",
        description: "Failed to execute workflow action",
        variant: "destructive"
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
        onClearConversation={() => {
          onClearConversation();
          setShowQuickActions(true);
        }}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
        hasMessages={messages.length > 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
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
                    onAction={handleContextualAction}
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

        {/* Right Sidebar - Smart Suggestions & Workflows */}
        {!sidebarOpen && (
          <div className="w-80 space-y-4 p-4 border-l border-border/50">
            <SmartSuggestionsPanel
              suggestions={transformedSuggestions}
              onSuggestionClick={handleSuggestionClick}
              isLoading={suggestionsLoading}
            />
            
            {activeWorkflows.length > 0 && (
              <WorkflowManager
                workflows={activeWorkflows}
                onWorkflowAction={handleWorkflowAction}
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatInterface.displayName = 'ChatInterface';
