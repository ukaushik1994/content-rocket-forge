import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoModal } from '@/components/landing/DemoModal';
import { FloatingKeywords } from '@/components/landing/FloatingKeywords';
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
      <div className="container max-w-5xl mx-auto relative">
        {/* Floating Keywords Background */}
        <FloatingKeywords />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          
          {/* Main Content - Centered */}
          <div className="text-center space-y-8 animate-fade-in max-w-4xl mx-auto">
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
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Transform your content strategy with AI that understands 
                <span className="text-primary font-semibold"> SERP data</span>, 
                creates <span className="text-neon-blue font-semibold">engaging copy</span>, 
                and delivers <span className="text-neon-pink font-semibold">measurable results</span>.
              </p>
            </div>

            {/* CTA Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>10k+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>100M+ words generated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:hidden grid grid-cols-3 gap-4 mt-8 animate-fade-in [animation-delay:400ms]">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 glass-card rounded-xl">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
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