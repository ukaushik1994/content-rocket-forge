import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { DemoModal } from '@/components/landing/DemoModal';
import { Play, ArrowRight, Star, Users, Zap } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const stats = [
    { icon: Users, value: '10k+', label: 'Creators' },
    { icon: Star, value: '4.9', label: 'Rating' },
    { icon: Zap, value: '100M+', label: 'Words Generated' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
      <div className="container max-w-6xl mx-auto text-center relative">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <CreAiterLogo showText size="xl" />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-neon-blue to-primary bg-300% bg-clip-text text-transparent animate-gradient-shift animate-fade-in [animation-delay:200ms]">
          Where Creativity
          <br />
          <span className="text-neon-blue">Meets AI Intelligence</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in [animation-delay:400ms]">
          Generate high-ranking, conversion-driven content by integrating{' '}
          <span className="text-primary font-semibold">real-time SERP data</span>,{' '}
          <span className="text-neon-blue font-semibold">keyword clusters</span>, and{' '}
          <span className="text-neon-pink font-semibold">business solutions</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in [animation-delay:600ms]">
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-6 neon-glow hover:shadow-neon-strong transition-all duration-300"
          >
            Start Creating for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsDemoOpen(true)}
            className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 py-6 backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center animate-fade-in [animation-delay:800ms]">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 glass-card px-6 py-3 rounded-full">
              <stat.icon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>


        {/* Demo Modal */}
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};