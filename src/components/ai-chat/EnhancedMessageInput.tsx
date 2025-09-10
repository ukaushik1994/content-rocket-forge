
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';

interface EnhancedMessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-3 p-4 bg-background/60 border border-border/50 rounded-2xl backdrop-blur-xl hover:border-border/70 transition-colors">
          {/* Attachment Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-background/60 p-2"
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Message Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 min-h-[20px] max-h-[120px] resize-none bg-transparent border-0 text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none p-0"
            rows={1}
          />

          {/* Voice Input Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-background/60 p-2"
            disabled={isLoading}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isLoading}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-primary-foreground border-0 p-2 min-w-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className="text-xs text-muted-foreground">
            {message.length > 0 && `${message.length} characters`}
          </span>
        </div>
      </form>
    </motion.div>
  );
};
