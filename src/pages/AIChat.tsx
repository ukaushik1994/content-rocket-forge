import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import Navbar from '@/components/layout/Navbar';
import { ChatInterface } from '@/components/ai-chat/ChatInterface';
import { ChatSidebar } from '@/components/ai-chat/ChatSidebar';
import { useAIChat } from '@/hooks/useAIChat';
import { useAuth } from '@/contexts/AuthContext';
import { ContentBuilderProvider } from '@/contexts/ContentBuilderContext';

const AIChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const chatRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    createConversation,
    selectConversation,
    sendMessage,
    clearConversation,
    deleteConversation
  } = useAIChat();

  useEffect(() => {
    // Auto-create first conversation if none exist
    if (conversations.length === 0) {
      createConversation("New Chat");
    }
  }, [conversations.length, createConversation]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <ContentBuilderProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5" />
          <motion.div 
            className="absolute top-[20%] left-[10%] w-[600px] h-[600px] rounded-full bg-neon-blue opacity-[0.02] blur-[120px]"
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div 
            className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-neon-purple opacity-[0.02] blur-[120px]"
            animate={{ 
              x: [0, -80, 0],
              y: [0, -60, 0],
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <Navbar />
        
        <motion.main 
          className="flex-1 flex overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Chat Sidebar */}
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-shrink-0 border-r border-white/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-sm"
              >
                <ChatSidebar
                  conversations={conversations}
                  activeConversation={activeConversation}
                  onSelectConversation={selectConversation}
                  onCreateConversation={createConversation}
                  onDeleteConversation={deleteConversation}
                  onToggleSidebar={() => setSidebarOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatInterface
              ref={chatRef}
              messages={messages}
              isLoading={isLoading}
              isTyping={isTyping}
              onSendMessage={sendMessage}
              onClearConversation={clearConversation}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
              activeConversation={activeConversation}
            />
          </div>
        </motion.main>
      </div>
    </ContentBuilderProvider>
  );
};

export default AIChat;