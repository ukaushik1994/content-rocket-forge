import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';

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
        setVisibleMessages(prev => [...prev, { role: msg.role, text: '', complete: false }]);
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
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden ${className}`}>
      {/* Window chrome — minimal */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.04]">
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-3 text-[11px] text-muted-foreground/40 font-mono tracking-wide">creaiter.ai</span>
      </div>

      {/* Chat area */}
      <div className="p-5 md:p-7 space-y-4 min-h-[180px]">
        <AnimatePresence>
          {visibleMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/80 to-[#33C3F0]/80 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-foreground/90 rounded-br-sm'
                    : 'bg-white/[0.04] text-foreground/70 rounded-bl-sm'
                }`}
              >
                {msg.text}
                {!msg.complete && (
                  <span className="inline-block w-[2px] h-3.5 bg-primary/60 ml-0.5 animate-pulse rounded-full" />
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-foreground/40" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Action chips */}
        <AnimatePresence>
          {showChips && actionChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap gap-1.5 pl-10"
            >
              {actionChips.map((chip, i) => (
                <motion.span
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium border cursor-default transition-colors hover:bg-white/[0.03] ${chip.color}`}
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
