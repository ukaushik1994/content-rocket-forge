import React, { useState } from 'react';
import { EnhancedStreamingInterface } from '@/components/ai-chat/EnhancedStreamingInterface';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { motion } from 'framer-motion';

export const AIStreamingChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Enhanced AI Chat DB for conversation management
  const {
    conversations,
    activeConversation,
    createConversation,
    deleteConversation,
    selectConversation,
    togglePinConversation,
    toggleArchiveConversation
  } = useEnhancedAIChatDB();

  // Chat context for streaming integration  
  const {
    activeConversationId,
    updateActiveConversation
  } = useChatContextBridge();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClearConversation = () => {
    console.log('Clearing conversation');
  };

  const handleCreateConversation = async () => {
    const newConversationId = await createConversation("New Streaming Chat");
    if (newConversationId) {
      updateActiveConversation(newConversationId);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    updateActiveConversation(conversationId);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
    if (activeConversationId === conversationId) {
      updateActiveConversation(null);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-background to-muted/20">
      {/* Chat History Sidebar */}
      {isSidebarOpen && (
        <ChatHistorySidebar
          conversations={conversations}
          activeConversation={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          onToggleSidebar={handleToggleSidebar}
          onPinConversation={togglePinConversation}
          onArchiveConversation={toggleArchiveConversation}
          className="relative z-40"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <EnhancedStreamingInterface
          onClearConversation={handleClearConversation}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
};