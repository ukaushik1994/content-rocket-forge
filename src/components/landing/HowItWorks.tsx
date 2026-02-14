import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, TrendingUp, ArrowRight, Globe, Brain, ChevronDown } from 'lucide-react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

export const HowItWorks = () => {
  const [openStep, setOpenStep] = useState<number | null>(0);
  
  const steps = [
    {
      number: '01',
      title: 'Research & Create',
      description: 'AI analyzes live SERP data to understand what content ranks and why',
      icon: Search,
      features: ['Live competitor analysis', 'Content gap detection', 'SERP-aware writing', 'SEO optimization'],
      color: 'from-primary to-neon-blue'
    },
    {
      number: '02',
      title: 'Publish & Track',
      description: 'Publish to your site and Creaiter automatically tracks performance',
      icon: Globe,
      features: ['One-click publishing', 'Real-time analytics', 'Traffic monitoring', 'Engagement tracking'],
      color: 'from-neon-blue to-neon-pink'
    },
    {
      number: '03',
      title: 'Analyze & Learn',
      description: 'AI analyzes what worked and what didn\'t, identifying success patterns',
      icon: Brain,
      features: ['Performance pattern detection', 'Audience preference analysis', 'Topic success scoring', 'Format optimization'],
      color: 'from-neon-pink to-neon-orange',
      highlight: true
    },
    {
      number: '04',
      title: 'Improve & Repeat',
      description: 'Next content is created with insights from previous performance',
      icon: TrendingUp,
      features: ['Personalized recommendations', 'Quality improvement over time', 'Adaptive content strategy', 'Exponential performance gains'],
      color: 'from-neon-orange to-primary'
    }
  ];

  return (
    <section className="py-12 px-4 relative">
      <Container>
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Content Gets
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> Smarter Every Time</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A self-learning system that turns every post into intelligence for the next one
          </p>
        </div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-neon-blue to-neon-pink opacity-30"></div>
            
            <div className="grid md:grid-cols-4 gap-4 relative">
              {steps.map((step, index) => (
                <Collapsible
                  key={index}
                  open={openStep === index}
                  onOpenChange={() => setOpenStep(openStep === index ? null : index)}
                >
                  <GlassCard className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CollapsibleTrigger className="w-full p-4 text-center cursor-pointer">
                      {/* Step Icon */}
                      <div className="relative mb-3 mx-auto">
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${step.color} p-0.5`}>
                          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                            <step.icon className="h-7 w-7 text-primary" />
                          </div>
                        </div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xs font-bold text-background`}>
                          {step.number}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      
                      {/* Expand indicator */}
                      <ChevronDown className={`h-4 w-4 mx-auto text-muted-foreground transition-transform ${openStep === index ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {step.description}
                      </p>
                      {step.highlight && (
                        <div className="bg-gradient-to-r from-primary/20 to-neon-pink/20 text-primary text-xs font-semibold px-2 py-1 rounded-full inline-block mb-2">
                          ⚡ AI Learning Step
                        </div>
                      )}
                    </CollapsibleContent>

                    {/* Arrow Connector */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-16 -right-2 transform -translate-y-1/2">
                        <ArrowRight className="h-5 w-5 text-primary/60" />
                      </div>
                    )}
                  </GlassCard>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Compact Timeline */}
        <div className="md:hidden space-y-3">
          {steps.map((step, index) => (
            <Collapsible
              key={index}
              open={openStep === index}
              onOpenChange={() => setOpenStep(openStep === index ? null : index)}
            >
              <GlassCard className="overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center gap-3 cursor-pointer">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} p-0.5 flex-shrink-0 relative`}>
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xs font-bold text-background`}>
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold">{step.title}</h3>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${openStep === index ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>

                <CollapsibleContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CollapsibleContent>
              </GlassCard>
            </Collapsible>
          ))}
        </div>
      </Container>
    </section>
  );
};