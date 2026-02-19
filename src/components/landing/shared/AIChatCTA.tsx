import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight, Sparkles, User } from 'lucide-react';

interface AIChatCTAProps {
  chatPrompt?: string;
  secondaryLabel?: string;
  secondaryRoute?: string;
  accentColor?: string;
}

export const AIChatCTA: React.FC<AIChatCTAProps> = ({
  chatPrompt = 'Write me a blog post about sustainable fashion trends...',
  secondaryLabel = 'Explore all tools',
  secondaryRoute = '/auth?mode=signup',
  accentColor = '#9b87f5',
}) => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i <= chatPrompt.length; i++) {
        if (cancelled) return;
        setTypedText(chatPrompt.slice(0, i));
        await new Promise(r => setTimeout(r, 25));
      }
      if (!cancelled) {
        await new Promise(r => setTimeout(r, 500));
        setShowResponse(true);
      }
    };

    // Only start when in view - use a simple delay
    const timeout = setTimeout(run, 1000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [chatPrompt]);

  return (
    <section className="py-24 md:py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Glow */}
          <div
            className="absolute -inset-6 rounded-3xl blur-3xl opacity-15 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${accentColor}, #9b87f5)` }}
          />

          <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-10 md:p-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Or just tell your AI
              <br />
              <span className="text-muted-foreground">what you need.</span>
            </h2>

            {/* Animated chat bubble */}
            <div className="max-w-2xl mx-auto mb-10">
              <div className="space-y-4">
                {/* User message */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="rounded-2xl rounded-br-md bg-primary/15 border border-primary/20 px-5 py-3 text-left">
                    <p className="text-muted-foreground text-base">
                      {typedText}
                      {typedText.length < chatPrompt.length && (
                        <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                      )}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.08] shrink-0">
                    <User className="h-4 w-4 text-foreground/60" />
                  </div>
                </div>

                {/* AI response */}
                {showResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 justify-start"
                  >
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-neon-blue shrink-0">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08] px-5 py-3 text-left">
                      <p className="text-muted-foreground text-base">
                        On it. I'll handle everything — you'll have it ready in minutes. ✨
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start a Conversation
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(secondaryRoute)}
                className="text-lg px-8 py-6 border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {secondaryLabel}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
