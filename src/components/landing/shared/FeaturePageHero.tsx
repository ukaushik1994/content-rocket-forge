import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface FeaturePageHeroProps {
  badge: string;
  badgeIcon: React.ReactNode;
  headline: string;
  highlightedText: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  orbColorA: string;
  orbColorB: string;
  secondaryCTA: string;
  secondaryRoute: string;
}

export const FeaturePageHero: React.FC<FeaturePageHeroProps> = ({
  badge,
  badgeIcon,
  headline,
  highlightedText,
  subtitle,
  gradientFrom,
  gradientTo,
  orbColorA,
  orbColorB,
  secondaryCTA,
  secondaryRoute,
}) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-20 overflow-hidden">
      {/* Abstract gradient orbs */}
      <div
        className="absolute top-1/4 left-[20%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-25 pointer-events-none"
        style={{ background: orbColorA }}
      />
      <div
        className="absolute bottom-1/4 right-[20%] w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ background: orbColorB }}
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium backdrop-blur-md"
            style={{
              background: `${orbColorA}15`,
              borderColor: `${orbColorA}30`,
              color: orbColorA,
            }}
          >
            {badgeIcon}
            {badge}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8"
        >
          {headline}
          <br />
          <span
            className="bg-clip-text text-transparent bg-300% animate-gradient-shift"
            style={{ backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo}, ${gradientFrom})` }}
          >
            {highlightedText}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="text-lg px-8 py-6 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Start a Conversation
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(secondaryRoute)}
            className="text-lg px-8 py-6 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-white/5"
          >
            {secondaryCTA}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
