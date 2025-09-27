import React, { useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { InfiniteScrollMessages } from './InfiniteScrollMessages';
import { MessageSearchBar } from './MessageSearchBar';
import { SmartSuggestionsPanel } from './SmartSuggestionsPanel';
import { ContextSnapshotPanel } from './ContextSnapshotPanel';
import { useEnhancedStreamingChat } from '@/hooks/useEnhancedStreamingChat';
import { useSmartSuggestions } from '@/hooks/useSmartSuggestions';
import { useRealtimeMessageStatus } from '@/hooks/useRealtimeMessageStatus';
import { useContextSnapshots } from '@/hooks/useContextSnapshots';
import { Wifi, WifiOff, Loader2, Radio } from 'lucide-react';
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
  const {
    messages,
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
    exportConversation
  } = useEnhancedStreamingChat();

  // Smart suggestions integration
  const { suggestions, isGenerating } = useSmartSuggestions(messages);
  
  // Real-time message status
  const { markAsDelivered, markAsRead } = useRealtimeMessageStatus(activeConversation?.id);
  
  // Context snapshots
  const { loadSnapshot } = useContextSnapshots();

  // Use filtered messages for display
  const displayMessages = filteredMessages.length > 0 ? filteredMessages : messages;

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

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.text || suggestion.description) {
      sendMessage(suggestion.text || suggestion.description);
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
        className="flex flex-col flex-1 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden"
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
          <Badge 
            variant="outline"
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all",
              statusInfo.bgColor,
              statusInfo.color,
              statusInfo.icon === Loader2 && "animate-pulse"
            )}
          >
            <StatusIcon 
              className={cn(
                "h-3 w-3", 
                statusInfo.icon === Loader2 && "animate-spin"
              )} 
            />
            {statusInfo.text}
          </Badge>
          
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
      <InfiniteScrollMessages
        messages={displayMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMoreMessages={isLoadingMoreMessages}
        onLoadMore={loadMoreMessages}
        isAIThinking={isAIThinking}
        isTyping={isTyping}
        className="flex-1"
      />

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
        <SmartSuggestionsPanel
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          isLoading={isGenerating}
        />
        <ContextSnapshotPanel
          conversationId={activeConversation?.id}
          onSnapshotLoad={handleSnapshotLoad}
        />
      </motion.div>
    )}
    </div>
  );
});

StreamingChatInterface.displayName = 'StreamingChatInterface';
