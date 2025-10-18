import React, { useEffect, useRef, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CollaborationIndicators } from './CollaborationIndicators';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { InfiniteScrollMessages } from './InfiniteScrollMessages';
import { MessageSearchBar } from './MessageSearchBar';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { VisualDataSidebar } from './VisualDataSidebar';
import { useEnhancedStreamingChat } from '@/hooks/useEnhancedStreamingChat';
import { useEnhancedAIChatDB } from '@/hooks/useEnhancedAIChatDB';
import { ChatSuggestion } from '@/hooks/useSmartSuggestions';
import { useRealtimeMessageStatus } from '@/hooks/useRealtimeMessageStatus';
import { useAdvancedCollaboration } from '@/hooks/useAdvancedCollaboration';
import { useContextSnapshots } from '@/hooks/useContextSnapshots';
import { MultiUserTypingIndicator } from './MultiUserTypingIndicator';
import { ContextSnapshotPanel } from './ContextSnapshotPanel';
import { Wifi, WifiOff, Loader2, Radio, ChevronLeft, BarChart3, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamingChatInterfaceProps {
  onClearConversation?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  activeConversation?: any;
}

export const StreamingChatInterface = forwardRef<HTMLDivElement, StreamingChatInterfaceProps>(({
  onClearConversation,
  onToggleSidebar,
  isSidebarOpen = false,
  activeConversation
}, ref) => {
  const [visualSidebarOpen, setVisualSidebarOpen] = useState(false);
  const [currentVisualData, setCurrentVisualData] = useState<any>(null);
  const [currentSerpData, setCurrentSerpData] = useState<any>(null);
  
  const { messages: dbMessages } = useEnhancedAIChatDB();
  
  const {
    messages: streamMessages,
    filteredMessages,
    isConnected,
    isTyping,
    isAIThinking,
    connectionStatus,
    hasMoreMessages,
    isLoadingMoreMessages,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    clearMessages,
    loadMoreMessages,
    searchMessages,
    getConversationAnalytics,
    exportConversation,
    retryLastMessage
  } = useEnhancedStreamingChat();
  
  // Use database messages if available, otherwise use stream messages
  const messages = dbMessages.length > 0 ? dbMessages : streamMessages;
  
  // Advanced collaboration with enhanced features
  const { 
    collaborators: collabUsers, 
    typingUsers,
    isScreenSharing, 
    startScreenSharing, 
    stopScreenSharing,
    updateTypingStatus,
    broadcastAIResponse,
    activeUserCount
  } = useAdvancedCollaboration(activeConversation?.id);
  
  // Use collaboration users or fallback to empty array
  const collaborators = collabUsers || [];

  // Smart suggestions integration - using a simpler approach for now
  const suggestions: ChatSuggestion[] = [];
  const isGenerating = false;
  
  // Real-time message status
  const { markAsDelivered, markAsRead } = useRealtimeMessageStatus(activeConversation?.id);
  
  // Context snapshots
  const { loadSnapshot } = useContextSnapshots();

  // Use filtered messages for display
  const displayMessages = filteredMessages.length > 0 ? filteredMessages : messages;
  
  // Single comprehensive visual data detection
  useEffect(() => {
    console.log('🔍 [Visual Data Check] Running detection');
    console.log('📊 [Visual Data Check] Context:', {
      displayMessagesLength: displayMessages.length,
      dbMessagesLength: dbMessages.length,
      activeConversation: activeConversation,
      visualSidebarOpen: visualSidebarOpen
    });

    // Priority 1: Check dbMessages (database-loaded messages)
    if (dbMessages.length > 0) {
      const dbMessageWithData = dbMessages
        .filter(msg => msg.role === 'assistant')
        .reverse()
        .find(msg => msg.visualData || msg.serpData);
      
      if (dbMessageWithData) {
        console.log('✅ [Visual Data Check] Found in dbMessages:', {
          id: dbMessageWithData.id,
          visualDataType: dbMessageWithData.visualData?.type,
          hasMetrics: !!dbMessageWithData.visualData?.metrics,
          metricsCount: dbMessageWithData.visualData?.metrics?.length || 0
        });
        
        setCurrentVisualData(dbMessageWithData.visualData);
        setCurrentSerpData(dbMessageWithData.serpData);
        setVisualSidebarOpen(true);
        return;
      }
    }
    
    // Priority 2: Check displayMessages (real-time messages)
    if (displayMessages.length > 0) {
      const displayMessageWithData = displayMessages
        .filter(msg => msg.role === 'assistant')
        .reverse()
        .find(msg => msg.visualData || msg.serpData);
      
      if (displayMessageWithData) {
        console.log('✅ [Visual Data Check] Found in displayMessages:', {
          id: displayMessageWithData.id,
          visualDataType: displayMessageWithData.visualData?.type
        });
        
        setCurrentVisualData(displayMessageWithData.visualData);
        setCurrentSerpData(displayMessageWithData.serpData);
        setVisualSidebarOpen(true);
        return;
      }
    }
    
    // No visual data found
    console.log('❌ [Visual Data Check] No visual data found');
  }, [
    activeConversation,
    dbMessages,
    displayMessages,
    displayMessages.length,
    dbMessages.length
  ]);

  const handleClearConversation = () => {
    clearMessages();
    onClearConversation?.();
  };

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { 
          icon: Loader2, 
          text: 'Connecting...', 
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20'
        };
      case 'connected':
        return { 
          icon: Radio, 
          text: 'Live', 
          color: 'text-green-500',
          bgColor: 'bg-green-500/10 border-green-500/20'
        };
      case 'disconnected':
        return { 
          icon: WifiOff, 
          text: 'Disconnected', 
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10 border-gray-500/20'
        };
      case 'error':
        return { 
          icon: WifiOff, 
          text: 'Connection Error', 
          color: 'text-red-500',
          bgColor: 'bg-red-500/10 border-red-500/20'
        };
      default:
        return { 
          icon: WifiOff, 
          text: 'Unknown', 
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10 border-gray-500/20'
        };
    }
  };

  const statusInfo = getConnectionStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    if (suggestion.text || suggestion.description) {
      sendMessage(suggestion.text || suggestion.description || '');
    }
  };

  const handleSnapshotLoad = (snapshot: any) => {
    // Load conversation context from snapshot
    if (snapshot.messages) {
      // This would restore the conversation state
      console.log('Loading snapshot:', snapshot);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Main Chat Interface */}
      <motion.div 
        ref={ref}
        className={`flex flex-col flex-1 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden transition-all duration-300 ${visualSidebarOpen ? 'lg:mr-[30%]' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
      {/* Header with connection status */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
        <ChatHeader 
          onClearConversation={handleClearConversation}
          onToggleSidebar={onToggleSidebar}
          sidebarOpen={isSidebarOpen}
          hasMessages={displayMessages.length > 0}
        />
        
        <div className="flex items-center gap-3">
          {/* Insights Button - Always Visible if Data Exists */}
          {displayMessages.some(m => m.visualData || m.serpData) && (
            <Button
              size="sm"
              variant={visualSidebarOpen ? "default" : "outline"}
              onClick={() => setVisualSidebarOpen(!visualSidebarOpen)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {visualSidebarOpen ? 'Hide' : 'Show'} Insights
              </span>
              {!visualSidebarOpen && (
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse ml-1" />
              )}
            </Button>
          )}
          
          {/* DEBUG: Manual sidebar trigger button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              console.log('🔧 [DEBUG] Manual sidebar trigger clicked');
              console.log('🔧 [DEBUG] Current state:', {
                dbMessagesLength: dbMessages.length,
                displayMessagesLength: displayMessages.length,
                currentVisualData: currentVisualData,
                visualSidebarOpen: visualSidebarOpen
              });
              
              // Force re-check for visual data
              const allMessages = [...dbMessages, ...displayMessages];
              const messageWithData = allMessages
                .filter(msg => msg.role === 'assistant')
                .reverse()
                .find(msg => msg.visualData || msg.serpData);
              
              if (messageWithData) {
                console.log('🔧 [DEBUG] Found visual data:', messageWithData.visualData);
                setCurrentVisualData(messageWithData.visualData);
                setCurrentSerpData(messageWithData.serpData);
                setVisualSidebarOpen(true);
              } else {
                console.log('🔧 [DEBUG] No visual data found, toggling sidebar anyway');
                setVisualSidebarOpen(!visualSidebarOpen);
              }
            }}
            className="flex items-center gap-2"
            title="Debug: Force sidebar check"
          >
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">Debug</span>
          </Button>
          
          <CollaborationIndicators 
            users={collaborators || []}
            connectionStatus={connectionStatus}
            isScreenSharing={isScreenSharing}
            onStartScreenShare={startScreenSharing}
            onStopScreenShare={stopScreenSharing}
          />
          
          {!isConnected && connectionStatus === 'disconnected' && (
            <button
              onClick={connect}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border/50">
        <MessageSearchBar
          searchQuery=""
          onSearchChange={searchMessages}
          onExportConversation={exportConversation}
          onShowAnalytics={() => {}}
          messageCount={displayMessages.length}
          filteredCount={filteredMessages.length}
        />
      </div>

      {/* Messages with Infinite Scroll */}
      <div className="flex-1 overflow-hidden">
        <InfiniteScrollMessages
          messages={displayMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMore={isLoadingMoreMessages}
          onLoadMore={loadMoreMessages}
          isTyping={isTyping}
          onRetryMessage={retryLastMessage}
          isRetryingMessage={isAIThinking}
          onSendMessage={sendMessage}
        />
        
        {/* Multi-User Typing Indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <div className="px-4 pb-2">
            <MultiUserTypingIndicator typingUsers={typingUsers} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/30">
        <MessageInput 
          onSendMessage={sendMessage}
          isLoading={isAIThinking}
          placeholder={
            isConnected 
              ? "Type your message..." 
              : "Connect to start chatting..."
          }
        />
      </div>
    </motion.div>

    {/* Smart Suggestions Sidebar */}
    {isSidebarOpen && (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="w-80 flex-shrink-0 space-y-4"
      >
        {/* <SmartSuggestionsPanel
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          isLoading={isGenerating}
        /> */}
        <ContextSnapshotPanel
          messages={displayMessages}
          onLoadSnapshot={handleSnapshotLoad}
        />
      </motion.div>
    )}
    
    {/* Visual Data Sidebar */}
    <VisualDataSidebar
      visualData={currentVisualData}
      serpData={currentSerpData}
      isOpen={visualSidebarOpen}
      onClose={() => setVisualSidebarOpen(false)}
      onDeepDive={(prompt) => {
        sendMessage(prompt);
      }}
      onActionClick={(action) => {
        // Handle action click
        console.log('Action clicked:', action);
      }}
      onSendMessage={sendMessage}
    />

        {/* Visual Data Sidebar Toggle - Always show if conversation has visual data */}
        {(displayMessages.some(m => m.visualData || m.serpData) || visualSidebarOpen) && (
          <motion.div
            className="fixed top-20 right-4 z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="sm"
              variant={visualSidebarOpen ? "default" : "outline"}
              onClick={() => setVisualSidebarOpen(!visualSidebarOpen)}
              className={`h-10 px-3 rounded-lg shadow-lg hover:shadow-xl transition-all ${
                (currentVisualData || currentSerpData) ? 'ring-2 ring-primary/50' : ''
              }`}
              title={visualSidebarOpen ? "Hide Insights" : "Show Insights"}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {visualSidebarOpen ? 'Hide' : 'Show'} Insights
              {(currentVisualData || currentSerpData) && !visualSidebarOpen && (
                <span className="ml-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </Button>
          </motion.div>
        )}
    </div>
  );
});

StreamingChatInterface.displayName = 'StreamingChatInterface';
