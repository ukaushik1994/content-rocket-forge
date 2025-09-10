import React, { useEffect, useRef, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { StreamingMessageBubble } from './StreamingMessageBubble';
import { useStreamingChatDB } from '@/hooks/useStreamingChatDB';
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isConnected,
    isTyping,
    isAIThinking,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    clearMessages
  } = useStreamingChatDB();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isAIThinking]);

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

  return (
    <motion.div 
      ref={ref}
      className="flex flex-col h-full bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden"
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
          hasMessages={messages.length > 0}
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

      {/* Messages */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-6"
      >
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <StreamingMessageBubble 
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* AI Thinking Indicator */}
          <AnimatePresence>
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-muted/50 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xs">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary/60"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Other Users Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <Badge variant="outline" className="text-xs">
                  Someone is typing...
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

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
  );
});

StreamingChatInterface.displayName = 'StreamingChatInterface';
