
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageInputProps {
  onSendMessage: (message: string, enableSearch?: boolean) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Ask me anything about content creation, SEO, or marketing strategy..."
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(() => {
    // Persist search state in localStorage
    const saved = localStorage.getItem('ai-chat-search-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Save search state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai-chat-search-enabled', JSON.stringify(isSearchEnabled));
  }, [isSearchEnabled]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), isSearchEnabled);
      setMessage('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const hasVoiceSupport = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pr-28 min-h-[60px] resize-none bg-background/80 border-white/20 focus:border-primary/40"
          disabled={isLoading}
        />
        
        <div className="absolute bottom-2 right-2 flex gap-2">
          {/* Search Toggle Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                  disabled={isLoading}
                  className={`p-2 h-8 w-8 transition-all ${
                    isSearchEnabled 
                      ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <motion.div
                    animate={isSearchEnabled ? { 
                      scale: [1, 1.1, 1],
                      filter: [
                        'drop-shadow(0 0 0px rgb(59, 130, 246))',
                        'drop-shadow(0 0 8px rgb(59, 130, 246))',
                        'drop-shadow(0 0 0px rgb(59, 130, 246))'
                      ]
                    } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isSearchEnabled ? Infinity : 0 }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSearchEnabled ? 'Web search enabled' : 'Enable web search'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isSearchEnabled ? 'AI will search the web when needed' : 'Click to enable web search'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {hasVoiceSupport && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`p-2 h-8 w-8 ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </motion.div>
            </Button>
          )}
          
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isLoading}
            className="p-2 h-8 w-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isSearchEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-blue-400 px-2"
        >
          <Search className="h-3 w-3" />
          <span>Web search active - AI will search when needed</span>
        </motion.div>
      )}
      
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground text-center"
        >
          Listening... Speak now
        </motion.div>
      )}
    </form>
  );
};
