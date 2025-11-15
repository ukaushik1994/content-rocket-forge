import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Megaphone, Target, Zap, TrendingUp, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignsHeroProps {
  onCreateClick?: () => void;
  onStartConversation?: (message: string) => void;
}

export const CampaignsHero = React.memo(({ onCreateClick, onStartConversation }: CampaignsHeroProps) => {
  const [campaignIdea, setCampaignIdea] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
          setCampaignIdea(transcript);
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

  const handleSubmit = () => {
    if (campaignIdea.trim() && onStartConversation) {
      onStartConversation(campaignIdea.trim());
      setCampaignIdea('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
    <motion.div 
      className="relative min-h-[60vh] flex items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative z-10 w-full px-6 pt-8 pb-12">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex items-center justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:scale-105 transition-transform duration-300">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Campaign Builder</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="relative space-y-2"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
                Campaign
              </span>{' '}
              <span className="text-foreground">Planner</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Create comprehensive marketing campaigns with AI-powered strategy generation
          </motion.p>

          {/* Removed Create New Campaign button - using conversational input instead */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">12</span>
              </div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </div>

            <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">34</span>
              </div>
              <div className="text-sm text-muted-foreground">Content Pieces Created</div>
            </div>

            <div className="bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-2xl font-bold text-foreground">8</span>
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </motion.div>

          {/* Campaign Idea Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <div className="relative group">
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  {/* Icon with pulse effect */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md animate-pulse" />
                    <div className="relative p-3 rounded-xl bg-primary/10 backdrop-blur-xl">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  
                  {/* Input */}
                  <input
                    type="text"
                    value={campaignIdea}
                    onChange={(e) => setCampaignIdea(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Start a conversation about your campaign idea..."
                    className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  
                  {/* Voice Button */}
                  {hasVoiceSupport && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoiceInput}
                      className={`p-2 ${isListening ? 'text-red-500' : 'text-muted-foreground'} hover:bg-white/10`}
                    >
                      <motion.div
                        animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                        transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                      >
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </motion.div>
                    </Button>
                  )}
                  
                  {/* Send Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!campaignIdea.trim()}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105"
                  >
                    <Sparkles className="h-5 w-5" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Listening indicator */}
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground text-center mt-3"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  Listening... Speak now
                </span>
              </motion.div>
            )}
            
            {/* Quick prompt suggestions */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-muted-foreground">Try:</span>
              {['Product Launch', 'Brand Awareness', 'Lead Generation'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setCampaignIdea(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all duration-200 hover:scale-105"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

CampaignsHero.displayName = "CampaignsHero";
