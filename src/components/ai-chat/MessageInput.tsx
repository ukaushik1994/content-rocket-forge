import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, Square } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  value,
  onChange,
  placeholder = "Type your message..."
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSendMessage(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice input functionality
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-2 p-3 bg-gradient-to-r from-background/90 to-background/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10 text-muted-foreground hover:text-foreground flex-shrink-0"
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="
                min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent 
                focus:ring-0 focus:ring-offset-0 p-2 text-sm
                placeholder:text-muted-foreground/70
              "
              style={{ height: 'auto' }}
            />
          </div>

          {/* Voice Input Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`
              h-8 w-8 p-0 flex-shrink-0 transition-colors
              ${isRecording 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
              }
            `}
            disabled={isLoading}
          >
            {isRecording ? (
              <Square className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={!value.trim() || isLoading}
            className={`
              h-8 w-8 p-0 flex-shrink-0 transition-all duration-200
              ${value.trim() && !isLoading
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Character count or hints */}
        <div className="flex justify-between items-center mt-2 px-1">
          <div className="text-xs text-muted-foreground">
            {isRecording && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1 text-red-400"
              >
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                Recording...
              </motion.span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Shift+Enter</kbd> for new line
          </div>
        </div>
      </form>
    </motion.div>
  );
};