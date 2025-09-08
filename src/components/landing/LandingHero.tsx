import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreAiterLogo } from '@/components/brand/CreAiterLogo';
import { DemoModal } from '@/components/landing/DemoModal';
import { FloatingKeywords } from '@/components/landing/FloatingKeywords';
import { InteractiveContentMock } from '@/components/landing/InteractiveContentMock';
import { Play, ArrowRight, Zap } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const stats = [
    { value: '10k+', label: 'Active Creators' },
    { value: '4.9★', label: 'User Rating' },
    { value: '100M+', label: 'Words Generated' },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-32 pb-20 relative overflow-hidden">
      <FloatingKeywords />
      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="text-left space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Zap className="h-4 w-4" />
              AI-Powered Content Creation
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold leading-tight">
                Create Content That
                <br />
                <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift">
                  Converts & Ranks
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Transform your content strategy with AI that understands 
                <span className="text-primary font-semibold"> SERP data</span>, 
                creates <span className="text-neon-blue font-semibold">engaging copy</span>, 
                and delivers <span className="text-neon-pink font-semibold">measurable results</span>.
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-4 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
                >
                  Start Creating for Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsDemoOpen(true)}
                  className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-lg px-8 py-4 backdrop-blur-sm transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{stat.value}</span>
                    <span className="text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual - Interactive Demo */}
          <div className="relative lg:block hidden animate-fade-in [animation-delay:200ms]">
            <div className="relative max-w-md ml-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 px-2">
                <CreAiterLogo showText={false} size="sm" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Interactive Demo
                </div>
              </div>

              {/* Interactive Content Mock */}
              <InteractiveContentMock />

              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mt-8 animate-fade-in [animation-delay:400ms]">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 glass-card rounded-xl">
                <div className="text-lg font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Demo Modal */}
        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};