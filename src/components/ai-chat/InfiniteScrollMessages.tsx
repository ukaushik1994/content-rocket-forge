import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowUp } from 'lucide-react';
import { StreamingMessageBubble } from './StreamingMessageBubble';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { cn } from '@/lib/utils';

interface InfiniteScrollMessagesProps {
  messages: EnhancedChatMessage[];
  isTyping: boolean;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetryMessage?: () => void;
  isRetryingMessage?: boolean;
  onSendMessage?: (message: string) => void;
}

export const InfiniteScrollMessages: React.FC<InfiniteScrollMessagesProps> = ({
  messages,
  isTyping,
  hasMoreMessages,
  isLoadingMore,
  onLoadMore,
  onRetryMessage,
  isRetryingMessage = false,
  onSendMessage
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const loadingRef = useRef(false);
  const isInitialLoad = useRef(true);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Check if near bottom
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(nearBottom);
    setShowScrollToBottom(!nearBottom && messages.length > 5);

    // Load more messages when scrolled to top
    if (scrollTop < 100 && hasMoreMessages && !isLoadingMore && !loadingRef.current) {
      loadingRef.current = true;
      onLoadMore();
      loadingRef.current = false;
    }
  }, [hasMoreMessages, isLoadingMore, onLoadMore, messages.length]);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom, and not on initial load)
  useEffect(() => {
    if (isNearBottom && scrollAreaRef.current && !isInitialLoad.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
    
    // Mark initial load complete after first render
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
    }
  }, [messages, isTyping, isNearBottom]);

  // Scroll to bottom manually
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  return (
    <div className="relative flex-1">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full p-6 pb-safe"
        onScrollCapture={handleScroll}
      >
        <div className="space-y-6">
          {/* Load More Indicator */}
          <AnimatePresence>
            {isLoadingMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center py-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more messages...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No More Messages Indicator */}
          {!hasMoreMessages && messages.length > 20 && (
            <div className="flex justify-center py-4">
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1">
                Beginning of conversation
              </div>
            </div>
          )}

          {/* Messages */}
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
                  damping: 20,
                  layout: { duration: 0.2 }
                }}
              >
                <StreamingMessageBubble
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                  onRetry={onRetryMessage}
                  isRetrying={isRetryingMessage}
                  onSendMessage={onSendMessage}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* AI Thinking Indicator */}
          <AnimatePresence>
            {isTyping && (
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
                    <span>AI is typing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full shadow-lg bg-background/80 backdrop-blur-sm border"
              onClick={scrollToBottom}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};