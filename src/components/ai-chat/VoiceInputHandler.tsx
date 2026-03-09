import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2, Square, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceInputHandlerProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

// Check for browser support
const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

export const VoiceInputHandler: React.FC<VoiceInputHandlerProps> = ({
  onTranscript,
  disabled = false,
  className
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Voice recognition error';
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      
      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if still in listening mode
        try {
          recognition.start();
        } catch (e) {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [isListening, toast]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return;

    setTranscript('');
    setInterimTranscript('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
      toast({
        title: "Listening...",
        description: "Speak now. Click stop when finished.",
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  }, [disabled, toast]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    setIsListening(false);
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Ignore errors
    }

    // Send the complete transcript
    const fullTranscript = (transcript + ' ' + interimTranscript).trim();
    if (fullTranscript) {
      onTranscript(fullTranscript);
      setTranscript('');
      setInterimTranscript('');
    }
  }, [transcript, interimTranscript, onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Not supported fallback
  if (!isSupported) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled
        className={cn(
          "text-muted-foreground/40 cursor-not-allowed p-2 h-8 w-8",
          className
        )}
        title="Voice input not supported in this browser"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        className={cn(
          "p-2 h-8 w-8 transition-colors",
          isListening 
            ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" 
            : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-transparent",
          className
        )}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Square className="h-4 w-4" />
          </motion.div>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Live transcript preview */}
      <AnimatePresence>
        {isListening && (transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 p-3 bg-card border border-border/50 rounded-lg shadow-lg max-w-[300px] z-50"
          >
            <div className="flex items-start gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-2 h-2 mt-1.5 bg-red-500 rounded-full flex-shrink-0"
              />
              <p className="text-sm text-foreground">
                {transcript}
                <span className="text-muted-foreground">{interimTranscript}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording indicator pulse */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute -top-1 -right-1"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
