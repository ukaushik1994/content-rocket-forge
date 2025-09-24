import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ContextAwareMessageInput } from './ContextAwareMessageInput';
import { EnhancedQuickActions } from './EnhancedQuickActions';
import { PlatformSummaryCard } from './PlatformSummaryCard';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { SolutionIntelligenceCard } from './SolutionIntelligenceCard';
import { SolutionSuggestions } from './SolutionSuggestions';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AiServiceStatusIndicator } from '@/components/ai/AiServiceStatusIndicator';
import { Brain, TrendingUp, Menu, History, MoreVertical, Share2, Download, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
interface EnhancedChatInterfaceProps {
  className?: string;
}
export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  className = ""
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true); // Show sidebar by default

  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    searchTerm,
    createConversation,
    deleteConversation,
    sendMessage,
    handleAction,
    handleLegacyAction,
    selectConversation,
    togglePinConversation,
    toggleArchiveConversation,
    addTagToConversation,
    removeTagFromConversation,
    exportConversation,
    shareConversation,
    searchConversations,
    clearSearch
  } = useEnhancedAIChatDB();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  const welcomeVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.2
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4
      }
    }
  };
  return <div className={`h-full ${className}`}>
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showSidebar && <ChatHistorySidebar conversations={conversations} activeConversation={activeConversation} onSelectConversation={selectConversation} onCreateConversation={() => createConversation()} onDeleteConversation={deleteConversation} onToggleSidebar={() => setShowSidebar(false)} onPinConversation={togglePinConversation} onArchiveConversation={toggleArchiveConversation} />}
      </AnimatePresence>

      {/* Main Chat Interface */}
      <div className={`flex transition-all duration-300 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
        <motion.div className="flex-1 flex flex-col h-full pt-16 pb-24" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Elegant Header */}
      <div className="fixed top-16 left-0 right-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className={`max-w-6xl mx-auto px-6 py-4 transition-all duration-300 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!showSidebar && <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)} className="text-muted-foreground hover:text-foreground hover:bg-background/60 mr-2">
                  <Menu className="h-4 w-4" />
                </Button>}
              <motion.div className="inline-flex items-center gap-3 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50" whileHover={{
                scale: 1.02
              }} transition={{
                type: "spring",
                stiffness: 300
              }}>
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-border/30">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
                    AI Assistant
                  </h2>
                  <p className="text-xs text-muted-foreground">Ready to help with your content strategy</p>
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative pt-20">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6">
          <div className="max-w-6xl mx-auto py-6 space-y-8">
            {/* Welcome State */}
            <AnimatePresence mode="wait">
              {showWelcome && <motion.div variants={welcomeVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  {/* Welcome Hero */}
                  <motion.div className="text-center py-8" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.8
                }}>
                    <motion.div className="p-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 mx-auto w-fit mb-6" whileHover={{
                    scale: 1.05
                  }} transition={{
                    type: "spring",
                    stiffness: 300
                  }}>
                      <Brain className="h-12 w-12 text-primary" />
                    </motion.div>
                    <motion.h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent mb-6" initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: 0.2
                  }}>
                      Welcome to AI Assistant
                    </motion.h2>
                    <motion.p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed" initial={{
                    opacity: 0,
                    y: 20
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    delay: 0.4
                  }}>
                      I'm here to help you optimize your content strategy, analyze performance, 
                      and discover new opportunities using your solutions and real data.
                    </motion.p>
                  </motion.div>

                  {/* Platform Summary & Quick Actions */}
                  <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" initial={{
                  opacity: 0,
                  y: 30
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: 0.6
                }}>
                    <PlatformSummaryCard onAction={handleLegacyAction} />
                    <EnhancedQuickActions onAction={handleLegacyAction} />
                  </motion.div>
                </motion.div>}
            </AnimatePresence>

            {/* Messages */}
            {messages.length > 0 && <div className="space-y-8">
                {messages.map((message, index) => <EnhancedMessageBubble key={message.id} message={message} isLatest={index === messages.length - 1} onAction={handleAction} />)}
              </div>}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="flex items-center gap-4 max-w-4xl mx-auto">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                  <Card className="flex items-center gap-3 text-white/70 text-sm px-4 py-3 bg-white/5 border-white/10 backdrop-blur-sm">
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 bg-purple-400 rounded-full" animate={{
                      scale: [1, 1.2, 1]
                    }} transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0
                    }} />
                      <motion.div className="w-2 h-2 bg-blue-400 rounded-full" animate={{
                      scale: [1, 1.2, 1]
                    }} transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.2
                    }} />
                      <motion.div className="w-2 h-2 bg-purple-400 rounded-full" animate={{
                      scale: [1, 1.2, 1]
                    }} transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: 0.4
                    }} />
                    </div>
                    AI is analyzing your data and preparing insights...
                  </Card>
                </motion.div>}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className={`fixed bottom-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300 ${showSidebar ? 'left-80' : 'left-0'}`}>
          <div className="max-w-6xl mx-auto px-6 py-4">
            <ContextAwareMessageInput onSendMessage={handleSendMessage} isLoading={isLoading} placeholder={messages.length === 0 ? "Ask me about your solutions like GLConnect, SQL Connect, People Analytics..." : "Continue the conversation..."} />
          </div>
        </div>
        </div>
        </motion.div>

      </div>
    </div>;
};