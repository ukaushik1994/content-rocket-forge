import React, { useState } from 'react';
import { EnhancedStreamingInterface } from '@/components/ai-chat/EnhancedStreamingInterface';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { motion } from 'framer-motion';

export const AIStreamingChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="h-screen flex bg-gradient-to-br from-background to-muted/20">
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