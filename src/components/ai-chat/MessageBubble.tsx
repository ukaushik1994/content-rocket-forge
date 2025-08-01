
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ConversationMessage } from '@/hooks/useAIChat';
import { User, Bot, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: ConversationMessage;
  isLatest: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLatest
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Message content copied successfully",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={bubbleVariants}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <Bot className="h-4 w-4 text-primary" />
        </motion.div>
      )}

      {/* Message Content */}
      <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${isUser ? 'order-first' : ''}`}>
        {/* Message Bubble */}
        <motion.div
          className={`
            relative group px-4 py-3 rounded-2xl shadow-sm border backdrop-blur-sm
            ${isUser 
              ? 'bg-gradient-to-r from-primary/90 to-primary/80 border-primary/30 text-white ml-4' 
              : 'bg-gradient-to-r from-background/80 to-background/60 border-white/10 text-foreground mr-4'
            }
            ${isLatest && isAssistant ? 'animate-pulse-subtle' : ''}
          `}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Message Text */}
          <div className={`
            text-sm leading-relaxed whitespace-pre-wrap break-words
            ${isUser ? 'text-white' : 'text-foreground'}
          `}>
            {message.content}
          </div>

          {/* Copy Button */}
          <motion.div
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`
                h-6 w-6 p-0 rounded-md
                ${isUser 
                  ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                  : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </motion.div>

          {/* Message Tail */}
          <div className={`
            absolute top-4 ${isUser ? '-left-1' : '-right-1'} w-2 h-2 transform rotate-45
            ${isUser 
              ? 'bg-gradient-to-br from-primary/90 to-primary/80 border-l border-t border-primary/30' 
              : 'bg-gradient-to-br from-background/80 to-background/60 border-l border-t border-white/10'
            }
          `} />
        </motion.div>

        {/* Timestamp */}
        <motion.div 
          className={`
            mt-1 px-1 text-xs text-muted-foreground 
            ${isUser ? 'text-right' : 'text-left'}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </motion.div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <motion.div 
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/20 flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          <User className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};
