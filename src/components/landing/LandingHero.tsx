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
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
      {/* Abstract gradient orbs */}
      <div className="absolute top-1/4 left-[15%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-25 pointer-events-none bg-gradient-to-br from-primary to-neon-blue" />
      <div className="absolute bottom-1/4 right-[15%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none bg-gradient-to-br from-neon-pink to-neon-orange" />

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          Just tell your AI.
          <br />
          <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift">
            It handles everything.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
        >
          Create content, run campaigns, manage audiences, and track performance — all from one AI conversation.
        </motion.p>

        {/* Animated Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative mb-12"
        >
          <div className="absolute -inset-6 bg-gradient-to-r from-primary/10 via-neon-blue/8 to-neon-pink/10 blur-3xl rounded-3xl pointer-events-none" />
          <AnimatedChatWindow
            messages={heroMessages}
            actionChips={heroChips}
            typingSpeed={25}
            delayBetweenMessages={600}
            className="relative"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
          >
            Start Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsDemoOpen(true)}
            className="text-lg px-8 py-6 border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </motion.div>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
};
