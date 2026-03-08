import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ContextAwareMessageInput } from './ContextAwareMessageInput';
import { EnhancedQuickActions } from './EnhancedQuickActions';
import { PlatformSummaryCard } from './PlatformSummaryCard';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import { VisualizationSidebar } from './VisualizationSidebar';
import { SolutionIntelligenceCard } from './SolutionIntelligenceCard';
import { SolutionSuggestions } from './SolutionSuggestions';
import { SolutionContextCard } from './SolutionContextCard';
import { SolutionRecommendations } from './SolutionRecommendations';
import { SolutionWorkflowTemplates } from './SolutionWorkflowTemplates';
import { ContextDisplayIndicator } from './ContextDisplayIndicator';
import { MessageSearchBar } from './MessageSearchBar';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AiServiceStatusIndicator } from '@/components/ai/AiServiceStatusIndicator';
import { RateLimitBanner } from '@/components/common/RateLimitBanner';
import { GlobalApiStatus } from '@/components/common/GlobalApiStatus';
import { Brain, TrendingUp, Menu, History, MoreVertical, Share2, Download, Trash2, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChartConfiguration } from '@/types/enhancedChat';
import { cn } from '@/lib/utils';
import { extractWizardContext, WizardContextExtraction } from '@/services/wizardContextExtraction';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedChatInterfaceProps {
  className?: string;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  className = ""
}) => {
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
    clearSearch,
    editMessage,
    deleteMessage,
    handleConfirmAction,
    handleCancelAction
  } = useEnhancedAIChatDB();

  // Message search state
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [messageSearchResults, setMessageSearchResults] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [showMessageSearch, setShowMessageSearch] = useState(false);

  // Filter messages based on search
  const filteredMessages = React.useMemo(() => {
    if (!messageSearchQuery.trim()) return messages;
    
    const query = messageSearchQuery.toLowerCase();
    const matchingMessages = messages.filter(msg => 
      msg.content.toLowerCase().includes(query)
    );
    
    // Update search results for navigation
    setMessageSearchResults(matchingMessages.map(m => m.id));
    
    return messages; // Return all messages, but we track matches separately
  }, [messages, messageSearchQuery]);

  // Handle search navigation
  const handleNavigateMatch = (direction: 'prev' | 'next') => {
    if (messageSearchResults.length === 0) return;
    
    if (direction === 'next') {
      setCurrentMatchIndex(prev => 
        prev >= messageSearchResults.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentMatchIndex(prev => 
        prev <= 0 ? messageSearchResults.length - 1 : prev - 1
      );
    }
  };

  // Scroll to current match
  useEffect(() => {
    if (messageSearchResults.length > 0 && currentMatchIndex < messageSearchResults.length) {
      const matchId = messageSearchResults[currentMatchIndex];
      const element = document.getElementById(`message-${matchId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatchIndex, messageSearchResults]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [contextSources, setContextSources] = useState<any[]>([]);
  const [showContextIndicator, setShowContextIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Visualization sidebar state
  const [showVisualizationSidebar, setShowVisualizationSidebar] = useState(false);
  const [visualizationData, setVisualizationData] = useState<{
    visualData: any;
    chartConfig: ChartConfiguration | null;
    title?: string;
    description?: string;
  } | null>(null);
  
  // Smart persistence: track if user has interacted with sidebar
  const [sidebarInteracted, setSidebarInteracted] = useState(false);
  
  // Issue #4 Fix: Track explicit user close intent
  const [userClosedSidebar, setUserClosedSidebar] = useState(false);

  // Handle manual expand visualization (kept for backwards compatibility)
  const handleExpandVisualization = (visualData: any, chartConfig: ChartConfiguration) => {
    setVisualizationData({
      visualData,
      chartConfig,
      title: visualData?.title || chartConfig?.title,
      description: visualData?.description
    });
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true); // Manual expand counts as interaction
  };

  // Handle setting visualization from choice card (content_wizard or proposal_browser)
  const handleSetVisualization = (visualData: any) => {
    setVisualizationData({
      visualData,
      chartConfig: null,
      title: visualData?.title,
      description: visualData?.description
    });
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true);
    setUserClosedSidebar(false);
  };

  // AUTO-OPEN sidebar when AI response contains visual data
  // Respects user's explicit close intent (Issue #4 fix)
  useEffect(() => {
    // If user explicitly closed sidebar, don't auto-open
    if (userClosedSidebar) {
      return;
    }
    
    if (messages.length === 0) {
      // No messages - close sidebar if user hasn't interacted
      if (!sidebarInteracted) {
        setShowVisualizationSidebar(false);
      }
      return;
    }
    
    // Find the most recent assistant message with visual data
    // (excluding SERP analysis which renders inline)
    const messagesWithVisualData = messages.filter(msg => 
      msg.role === 'assistant' && 
      msg.visualData && 
      msg.visualData.type !== 'serp_analysis' &&
      msg.visualData.type !== 'content_creation_choice' // Choice card renders inline, not in sidebar
    );
    
    const latestVisualization = messagesWithVisualData[messagesWithVisualData.length - 1];
    
    if (latestVisualization?.visualData) {
      // Has visual data - open sidebar with the most recent visualization
      const chartConfig = latestVisualization.visualData?.chartConfig || null;
      
      setVisualizationData({
        visualData: latestVisualization.visualData,
        chartConfig,
        title: latestVisualization.visualData?.title || 'Data Visualization',
        description: latestVisualization.visualData?.description
      });
      setShowVisualizationSidebar(true);
    } else {
      // No visualization data in entire conversation
      // Close sidebar if user hasn't interacted with it
      if (!sidebarInteracted) {
        setShowVisualizationSidebar(false);
      }
    }
  }, [messages, sidebarInteracted, userClosedSidebar]);
  
  // Reset close intent when starting a new conversation
  useEffect(() => {
    setUserClosedSidebar(false);
  }, [activeConversation]);

  // Track user interaction with sidebar (for smart persistence)
  const handleSidebarInteraction = () => {
    setSidebarInteracted(true);
  };

  // Close sidebar and track user's explicit close intent (Issue #4 fix)
  const handleCloseSidebar = () => {
    setShowVisualizationSidebar(false);
    setSidebarInteracted(false);
    setUserClosedSidebar(true); // Remember user explicitly closed
  };
  
  // Handle manual open (resets close intent)
  const handleOpenSidebar = () => {
    setShowVisualizationSidebar(true);
    setSidebarInteracted(true);
    setUserClosedSidebar(false); // User manually reopened, reset close intent
  };

  // Issue #1 Fix: Enhanced scroll using double-RAF to ensure DOM is fully rendered
  const scrollToBottom = React.useCallback(() => {
    // Double requestAnimationFrame ensures DOM updates are complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive (Issue #1 enhanced fix)
  // Uses a small delay to ensure content rendering is complete
  useEffect(() => {
    // Immediate scroll attempt
    scrollToBottom();
    
    // Delayed scroll to catch late-rendering content (charts, markdown, etc.)
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, scrollToBottom]);


  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showSidebar) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showSidebar]);
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
        duration: 0.2
      }
    }
  };
  const { isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();

  return <div className={cn("h-full flex flex-col", className)}>
      {/* Chat History Sidebar */}
      <AnimatePresence>
        {showSidebar && <ChatHistorySidebar conversations={conversations} activeConversation={activeConversation} onSelectConversation={selectConversation} onCreateConversation={() => createConversation()} onDeleteConversation={deleteConversation} onToggleSidebar={() => setShowSidebar(false)} onPinConversation={togglePinConversation} onArchiveConversation={toggleArchiveConversation} />}
      </AnimatePresence>

      {/* Visualization Sidebar (Right) - positioned within chat area */}
      <VisualizationSidebar
        isOpen={showVisualizationSidebar}
        onClose={handleCloseSidebar}
        visualData={visualizationData?.visualData}
        chartConfig={visualizationData?.chartConfig || null}
        title={visualizationData?.title}
        description={visualizationData?.description}
        onSendMessage={sendMessage}
        onInteract={handleSidebarInteraction}
      />

      {/* Floating Sidebar Toggle */}
      <div
        className={`fixed z-[60] transition-all duration-300 ${
          showSidebar 
            ? 'top-[4.5rem] sm:left-[16.5rem] lg:left-[18.5rem]' 
            : 'top-20 left-4'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSidebar(!showSidebar)}
          className="rounded-full border border-border/20 hover:border-border/40 hover:bg-muted/30 bg-transparent text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content Area - Chat and Visualization side by side */}
      <div className={cn(
        "flex-1 flex transition-all duration-300 ease-out pt-20 pb-24 overflow-hidden",
        // Left sidebar margin - desktop only (sidebars overlay on mobile/tablet)
        showSidebar && !isMobile && "sm:ml-72 lg:ml-80"
      )}>
        {/* Chat Messages Area - shrinks when visualization sidebar is open */}
        <motion.div 
          className={cn(
            "flex-1 flex flex-col min-h-0 transition-all duration-300 ease-out",
            // Right margin for visualization - only on xl screens (overlays on smaller)
            showVisualizationSidebar && "xl:mr-[600px]"
          )}
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
        >
          {/* Rate Limit Banner */}
          <RateLimitBanner 
            className="mx-6 mt-2" 
            onRetry={() => console.log('Retrying after rate limit clear')}
          />

          {/* Message Search Bar (toggleable) */}
          {messages.length > 0 && (
            <div className="mx-6 mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
              
              <AnimatePresence>
                {showMessageSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <MessageSearchBar
                      searchQuery={messageSearchQuery}
                      onSearchChange={setMessageSearchQuery}
                      onExportConversation={exportConversation}
                      onShowAnalytics={() => {}}
                      messageCount={messages.length}
                      filteredCount={messageSearchResults.length}
                      onNavigateMatch={handleNavigateMatch}
                      currentMatch={currentMatchIndex + 1}
                      totalMatches={messageSearchResults.length}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Messages Area - with ref for proper scrolling (Issue #1 fix) */}
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="max-w-6xl mx-auto py-6 space-y-8">
              {/* Welcome State - Premium Minimal */}
              <AnimatePresence>
                {messages.length === 0 && <motion.div variants={welcomeVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center min-h-[60vh] py-12 sm:py-16 lg:py-24 space-y-8">
                    {/* Minimal Brain Icon */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Brain className="h-6 w-6 text-muted-foreground/60" />
                    </motion.div>

                    {/* Two-line greeting */}
                    <motion.div
                      className="text-center space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                        {(() => {
                          const hour = new Date().getHours();
                          if (hour < 12) return 'Good morning.';
                          if (hour < 17) return 'Good afternoon.';
                          return 'Good evening.';
                        })()}
                      </h2>
                      <p className="text-base text-muted-foreground font-normal">
                        What would you like to do?
                      </p>
                    </motion.div>

                    {/* Pill suggestions */}
                    <EnhancedQuickActions onAction={handleLegacyAction} onSetVisualization={handleSetVisualization} />

                    {/* Metrics strip — only shows if user has data */}
                    <PlatformSummaryCard onAction={handleLegacyAction} />
                  </motion.div>}
              </AnimatePresence>

              {/* Messages */}
              {messages.length > 0 && <div className="space-y-6">
                  {messages.map((message, index) => {
                    const isMatch = messageSearchQuery && message.content.toLowerCase().includes(messageSearchQuery.toLowerCase());
                    const isCurrentMatch = messageSearchResults[currentMatchIndex] === message.id;
                    
                    return (
                      <div 
                        key={message.id} 
                        id={`message-${message.id}`}
                        className={cn(
                          "transition-all duration-200",
                          isMatch && "search-highlight",
                          isCurrentMatch && "ring-2 ring-primary/50 rounded-lg"
                        )}
                      >
                        <EnhancedMessageBubble 
                          message={message} 
                          isLatest={index === messages.length - 1} 
                          onAction={handleAction} 
                          onSendMessage={sendMessage}
                          onExpandVisualization={handleExpandVisualization}
                          onEditMessage={editMessage}
                          onDeleteMessage={deleteMessage}
                          onConfirmAction={handleConfirmAction}
                          onCancelAction={handleCancelAction}
                          onSetVisualization={handleSetVisualization}
                        />
                      </div>
                    );
                  })}
                </div>}

              {/* Typing Indicator - Refined Minimal */}
              <AnimatePresence>
                {isTyping && <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 max-w-4xl mx-auto"
                >
                    {/* Avatar with pulse */}
                     <div className="flex-shrink-0">
                       <div className="w-8 h-8 rounded-full bg-transparent border border-border/20 flex items-center justify-center">
                         <Brain className="w-4 h-4 text-muted-foreground" />
                       </div>
                     </div>
                     
                     {/* Clean message card */}
                     <Card className="flex items-center gap-3 text-muted-foreground text-sm px-4 py-3 bg-transparent border border-border/20">
                       {/* Subtle animated dots */}
                       <div className="flex gap-1">
                         <motion.div 
                           className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full" 
                           animate={{ opacity: [0.4, 1, 0.4] }}
                           transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                         />
                         <motion.div 
                           className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full" 
                           animate={{ opacity: [0.4, 1, 0.4] }}
                           transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                         />
                         <motion.div 
                           className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full" 
                           animate={{ opacity: [0.4, 1, 0.4] }}
                           transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                         />
                       </div>
                      <span className="text-sm">Thinking...</span>
                    </Card>
                  </motion.div>}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      {/* Input Area - ALWAYS full width, respects left sidebar only on desktop */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "border-t border-border/20 bg-background/80 backdrop-blur-md",
        "transition-all duration-300 ease-out",
        // Left padding only on desktop when sidebar is open (sidebars overlay on mobile/tablet)
        showSidebar && isDesktop && "lg:pl-80"
      )}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Context Indicator */}
          {showContextIndicator && (
            <div className="mb-3">
              <ContextDisplayIndicator
                sources={contextSources}
                isActive={showContextIndicator}
                overallConfidence={88}
                variant="compact"
              />
            </div>
          )}
          
          <ContextAwareMessageInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            placeholder={messages.length === 0 ? "Ask me anything..." : "Continue the conversation..."} 
            onOpenProposals={() => {
              // Trigger the proposal browser sidebar via the same visual data flow
              handleSetVisualization({
                type: 'proposal_browser',
                title: 'AI Proposals',
                description: 'Browse AI-generated content proposals',
                step: 'solution_selection'
              });
            }}
          />
        </div>
      </div>
    </div>;
};