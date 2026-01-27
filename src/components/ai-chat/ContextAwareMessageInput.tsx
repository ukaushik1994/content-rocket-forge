import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';
import { SolutionSuggestions } from './SolutionSuggestions';
import { MobileActionsSheet } from './MobileActionsSheet';

interface Solution {
  id: string;
  name: string;
  description: string;
  features?: string[];
  category?: string;
}

interface ContextAwareMessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ContextAwareMessageInput: React.FC<ContextAwareMessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSolutionSelect = (solution: Solution, action: string) => {
    let prompt = '';
    switch (action) {
      case 'analyze':
        prompt = `Analyze ${solution.name}: Provide detailed insights on its market position, content opportunities, and competitive advantages. Include specific recommendations for content strategy and positioning.`;
        break;
      case 'create-content':
        prompt = `Create a comprehensive content strategy for ${solution.name}. Include blog topics, social media content, case study ideas, and SEO-optimized content that highlights its ${solution.features?.slice(0, 2).join(' and ')} capabilities.`;
        break;
      default:
        prompt = `Tell me more about ${solution.name}`;
    }
    
    setMessage(prompt);
    setShowSuggestions(false);
    
    // Auto-send the message
    setTimeout(() => {
      if (prompt.trim()) {
        onSendMessage(prompt);
        setMessage('');
      }
    }, 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    
    // Auto-send the suggestion
    setTimeout(() => {
      if (suggestion.trim()) {
        onSendMessage(suggestion);
        setMessage('');
      }
    }, 100);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  // Show suggestions when user types solution-related terms
  useEffect(() => {
    const shouldShowSuggestions = message.length >= 2 && (
      /\b(gl|sql|people|oracle|connect|analytics|solution|help|tell|what|how|create|analyze)\b/i.test(message)
    );
    setShowSuggestions(shouldShowSuggestions);
  }, [message]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative"
    >
      {/* Solution Suggestions */}
      <AnimatePresence>
        {showSuggestions && (
          <SolutionSuggestions 
            query={message}
            onSolutionSelect={handleSolutionSelect}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className={`relative flex items-end gap-2 p-3 bg-background/95 border rounded-2xl transition-all duration-200 ${
            isFocused 
              ? 'border-primary/40 ring-1 ring-primary/20' 
              : 'border-border/40 hover:border-border/60'
          }`}
          animate={{ 
            boxShadow: isFocused 
              ? '0 4px 20px -4px hsl(var(--primary) / 0.1)' 
              : '0 2px 10px -2px hsl(var(--foreground) / 0.05)'
          }}
        >
          {/* Mobile Actions Sheet - Shows on mobile only */}
          <MobileActionsSheet
            onAttachment={() => console.log('Attachment clicked')}
            onVoice={() => console.log('Voice clicked')}
            disabled={isLoading}
          />

          {/* Attachment Button - Hidden on mobile, shown on sm+ */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="hidden sm:flex text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent p-2 h-8 w-8"
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 min-h-[24px] max-h-[120px] resize-none bg-transparent border-0 text-foreground placeholder-muted-foreground/60 focus:ring-0 focus:outline-none p-0 text-sm"
            rows={1}
          />

          {/* Voice Input Button - Hidden on mobile */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="hidden sm:flex text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent p-2 h-8 w-8"
            disabled={isLoading}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Send Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 p-2 h-9 w-9 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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
          </motion.div>
        </motion.div>

        {/* Helper Text - Cleaner */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-muted-foreground/50">
            Enter to send · Shift+Enter for new line
          </span>
          <AnimatePresence>
            {message.length > 100 && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground/50"
              >
                {message.length} characters
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
};
