import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';
import { SolutionSuggestions } from './SolutionSuggestions';

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
      transition={{ duration: 0.5 }}
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