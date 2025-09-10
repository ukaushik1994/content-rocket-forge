import React, { useState } from 'react';
import { StreamingChatInterface } from '@/components/ai-chat/StreamingChatInterface';
import { ChatHistorySidebar } from '@/components/ai-chat/ChatHistorySidebar';
import { motion } from 'framer-motion';

export const AIStreamingChatPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClearConversation = () => {
    // Clear current conversation
    console.log('Clearing conversation');
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? 320 : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
      >
        {isSidebarOpen && (
          <div className="p-4 text-center text-muted-foreground">
            <p>Streaming Chat Sidebar</p>
            <p className="text-xs mt-2">History features coming soon</p>
          </div>
        )}
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <StreamingChatInterface
          onClearConversation={handleClearConversation}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
    </div>
  );
};