
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
        <div className="relative flex items-end gap-3 p-4 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-2xl backdrop-blur-sm hover:border-white/30 transition-colors">
          {/* Attachment Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 p-2"
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
            className="flex-1 min-h-[20px] max-h-[120px] resize-none bg-transparent border-0 text-white placeholder-white/50 focus:ring-0 focus:outline-none p-0"
            rows={1}
          />

          {/* Voice Input Button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10 p-2"
            disabled={isLoading}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 p-2 min-w-[40px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-xs text-white/40">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className="text-xs text-white/40">
            {message.length > 0 && `${message.length} characters`}
          </span>
        </div>
      </form>
    </motion.div>
  );
};
