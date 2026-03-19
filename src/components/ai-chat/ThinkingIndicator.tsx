import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

interface ThinkingIndicatorProps {
  thinkingText: string;
  isActive: boolean;
  onComplete?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  thinkingText,
  isActive,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!isActive || currentIndex >= thinkingText.length) {
      if (currentIndex >= thinkingText.length && onComplete) {
        onComplete();
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + thinkingText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, 15); // 15ms per character for smooth typing

    return () => clearTimeout(timeout);
  }, [currentIndex, thinkingText, isActive, onComplete]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  // Reset when thinking text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [thinkingText]);

  if (!isActive && displayedText.length === 0) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="mb-3"
        >
          <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent backdrop-blur-sm">
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            />
            
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="p-1.5 rounded-lg bg-primary/20"
                >
                  <Brain className="w-4 h-4 text-primary" />
                </motion.div>
                
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm font-medium text-primary">AI is thinking</span>
                  
                  {/* Animated dots */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Sparkles className="w-4 h-4 text-primary/60" />
              </div>

              {/* Thinking content with typewriter effect */}
              <div className="relative">
                <div className="text-sm text-muted-foreground leading-relaxed font-mono">
                  {displayedText.split('\n').map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-pre-wrap break-words"
                    >
                      {line || '\u00A0'}
                    </motion.div>
                  ))}
                  
                  {/* Typing cursor */}
                  {currentIndex < thinkingText.length && (
                    <motion.span
                      animate={{ opacity: showCursor ? 1 : 0 }}
                      className="inline-block w-2 h-4 ml-0.5 bg-primary"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
