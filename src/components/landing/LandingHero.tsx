import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { AnimatedChatWindow } from '@/components/landing/AnimatedChatWindow';
import { DemoModal } from '@/components/landing/DemoModal';

const heroMessages = [
  {
    role: 'user' as const,
    text: 'Create a blog post about sustainable fashion, generate hero images, and schedule it across all platforms.',
  },
  {
    role: 'ai' as const,
    text: 'Done. I\'ve written a 2,400-word SEO-optimized post (score: 94/100), generated 4 hero images in your brand style, and scheduled it on LinkedIn, Twitter, and Instagram for optimal engagement times.',
  },
];

const heroChips = [
  { label: 'View Post', color: 'bg-primary/10 text-primary border-primary/20' },
  { label: 'See Images', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/20' },
  { label: 'Edit Schedule', color: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' },
  { label: 'View Analytics', color: 'bg-neon-orange/10 text-neon-orange border-neon-orange/20' },
];

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">
      {/* Rich layered background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary orb — top left */}
        <div className="absolute top-[10%] left-[5%] w-[700px] h-[700px] rounded-full blur-[200px] opacity-[0.12] bg-[#9b87f5]" />
        {/* Secondary orb — bottom right */}
        <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.08] bg-[#D946EF]" />
        {/* Accent orb — center */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] rounded-full blur-[160px] opacity-[0.06] bg-[#33C3F0]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        {/* Tiny label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase bg-primary/8 text-primary/80 border border-primary/10">
            AI-Powered Content OS
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.08] tracking-[-0.03em] mb-5"
        >
          Just tell your AI.
          <br />
          <span className="bg-gradient-to-r from-[#9b87f5] via-[#33C3F0] to-[#D946EF] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift">
            It handles everything.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Create content, run campaigns, manage audiences, and track performance — all from one AI conversation.
        </motion.p>

        {/* Animated Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-14 max-w-3xl mx-auto"
        >
          {/* Glow behind chat */}
          <div className="absolute -inset-10 bg-gradient-to-br from-[#9b87f5]/10 via-[#33C3F0]/5 to-[#D946EF]/10 blur-[60px] rounded-[40px] pointer-events-none" />
          <AnimatedChatWindow
            messages={heroMessages}
            actionChips={heroChips}
            typingSpeed={25}
            delayBetweenMessages={600}
            className="relative shadow-2xl shadow-primary/5"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="text-base px-8 py-6 bg-foreground text-background hover:bg-foreground/90 rounded-full font-semibold shadow-lg transition-all duration-300 group"
          >
            Start Free
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => setIsDemoOpen(true)}
            className="text-base px-8 py-6 text-muted-foreground hover:text-foreground rounded-full font-medium"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </motion.div>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
};
