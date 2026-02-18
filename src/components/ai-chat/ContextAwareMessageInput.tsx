import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { SolutionSuggestions } from './SolutionSuggestions';
import { MobileActionsSheet } from './MobileActionsSheet';
import { FileUploadHandler } from './FileUploadHandler';
import { VoiceInputHandler } from './VoiceInputHandler';

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
  onTypingChange?: (isTyping: boolean) => void;
}

export const ContextAwareMessageInput: React.FC<ContextAwareMessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Type your message...",
  onTypingChange
}) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle voice transcript
  const handleVoiceTranscript = useCallback((transcript: string) => {
    setMessage(prev => (prev + ' ' + transcript).trim());
    textareaRef.current?.focus();
  }, []);

  // Handle file analysis result
  const handleFileAnalyzed = useCallback((analysis: {
    fileName: string;
    fileType: string;
    summary: string;
    insights: string[];
  }) => {
    const fileMessage = `I've uploaded a file: **${analysis.fileName}**\n\nPlease analyze this content:\n${analysis.summary}\n\nKey insights:\n${analysis.insights.map(i => `- ${i}`).join('\n')}`;
    onSendMessage(fileMessage);
    setShowFileUpload(false);
  }, [onSendMessage]);

  // Handle attachment button click
  const handleAttachmentClick = useCallback(() => {
    setShowFileUpload(true);
  }, []);

  // Handle typing broadcast with debounce
  const handleTypingBroadcast = useCallback((isTyping: boolean) => {
    if (onTypingChange) {
      onTypingChange(isTyping);
    }
  }, [onTypingChange]);

  // Track message changes and broadcast typing status
  const handleMessageChange = useCallback((newMessage: string) => {
    setMessage(newMessage);
    
    // Broadcast typing = true
    handleTypingBroadcast(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to broadcast typing = false after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingBroadcast(false);
    }, 3000);
  }, [handleTypingBroadcast]);

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setShowSuggestions(false);
      handleTypingBroadcast(false); // Stop typing indicator on send
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
        <div 
          className={`relative flex items-end gap-2 p-2.5 bg-background/60 border rounded-2xl transition-all duration-200 ${
            isFocused 
              ? 'border-primary/30' 
              : 'border-border/20 hover:border-border/40'
          }`}
        >
          {/* File Upload Handler */}
          <FileUploadHandler
            isVisible={showFileUpload}
            onFileAnalyzed={handleFileAnalyzed}
            onCancel={() => setShowFileUpload(false)}
          />

          {/* Mobile Actions Sheet - Shows on mobile only */}
          <MobileActionsSheet
            onAttachment={handleAttachmentClick}
            onVoice={() => {}} // Handled by VoiceInputHandler on desktop
            onImage={handleAttachmentClick} // Use same file handler - accepts images
            onDocument={handleAttachmentClick} // Use same file handler - accepts documents
            disabled={isLoading}
          />

          {/* Attachment Button - Hidden on mobile, shown on sm+ */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleAttachmentClick}
            className="hidden sm:flex text-muted-foreground/40 hover:text-muted-foreground hover:bg-transparent p-2 h-8 w-8"
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Message Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              handleTypingBroadcast(false); // Stop typing on blur
            }}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 min-h-[24px] max-h-[120px] resize-none bg-transparent border-0 text-foreground placeholder-muted-foreground/60 focus:ring-0 focus:outline-none p-0 text-sm"
            rows={1}
          />

          {/* Voice Input Button - Hidden on mobile */}
          <div className="hidden sm:flex">
            <VoiceInputHandler
              onTranscript={handleVoiceTranscript}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={!message.trim() || isLoading}
            className="text-muted-foreground hover:text-foreground hover:bg-transparent p-2 h-9 w-9 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full"
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
