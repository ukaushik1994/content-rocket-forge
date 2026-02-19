import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

interface ActionChip {
  label: string;
  color: string;
}

interface AnimatedChatWindowProps {
  messages: ChatMessage[];
  actionChips?: ActionChip[];
  typingSpeed?: number;
  delayBetweenMessages?: number;
  className?: string;
}

export const AnimatedChatWindow: React.FC<AnimatedChatWindowProps> = ({
  messages,
  actionChips = [],
  typingSpeed = 30,
  delayBetweenMessages = 800,
  className = '',
}) => {
  const [visibleMessages, setVisibleMessages] = useState<{ role: string; text: string; complete: boolean }[]>([]);
  const [showChips, setShowChips] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < messages.length; i++) {
        if (cancelled) return;
        const msg = messages[i];
        // Add message with empty text
        setVisibleMessages(prev => [...prev, { role: msg.role, text: '', complete: false }]);
        // Type out characters
        for (let c = 0; c <= msg.text.length; c++) {
          if (cancelled) return;
          const chars = msg.text.slice(0, c);
          setVisibleMessages(prev => {
            const copy = [...prev];
            copy[i] = { ...copy[i], text: chars };
            return copy;
          });
          await new Promise(r => setTimeout(r, msg.role === 'user' ? typingSpeed : typingSpeed * 0.6));
        }
        // Mark complete
        setVisibleMessages(prev => {
          const copy = [...prev];
          copy[i] = { ...copy[i], complete: true };
          return copy;
        });
        if (i < messages.length - 1) {
          await new Promise(r => setTimeout(r, delayBetweenMessages));
        }
      }
      if (!cancelled) {
        await new Promise(r => setTimeout(r, 400));
        setShowChips(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className={`rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl overflow-hidden ${className}`}>
      {/* macOS dots */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-xs text-muted-foreground/50 font-mono">creaiter.ai</span>
      </div>

      {/* Chat area */}
      <div className="p-6 md:p-8 space-y-5 min-h-[200px]">
        <AnimatePresence>
          {visibleMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-neon-blue shrink-0 h-fit">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/15 border border-primary/20 text-foreground rounded-br-md'
                    : 'bg-white/[0.06] border border-white/[0.08] text-muted-foreground rounded-bl-md'
                }`}
              >
                {msg.text}
                {!msg.complete && (
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="p-2 rounded-xl bg-white/[0.08] shrink-0 h-fit">
                  <User className="h-4 w-4 text-foreground/60" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Action chips */}
        <AnimatePresence>
          {showChips && actionChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap gap-2 pl-11"
            >
              {actionChips.map((chip, i) => (
                <motion.span
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border cursor-default ${chip.color}`}
                >
                  {chip.label}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
