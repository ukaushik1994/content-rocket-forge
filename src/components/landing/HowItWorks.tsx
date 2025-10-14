import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, TrendingUp, ArrowRight, Globe, Brain, Users, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HowItWorks = () => {
  const navigate = useNavigate();
  
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
      description: 'Publish to your site and CreAiter automatically tracks performance',
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
    <section className="py-16 px-4 relative">
      <Container>
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Content Gets
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> Smarter Every Time You Hit Publish</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A self-learning system that turns every post into intelligence for the next one
          </p>
        </div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-neon-blue to-neon-pink opacity-30 transform -translate-y-1/2"></div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <GlassCard className="p-8 text-center hover:shadow-neon transition-all duration-300 group relative overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* AI Learning Badge */}
                  {step.highlight && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-primary to-neon-pink text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        ⚡ AI LEARNING
                      </div>
                    </div>
                  )}
                  
                  {/* Step Number */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${step.color} p-0.5`}>
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <step.icon className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xs font-bold text-background`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color}`}></div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Arrow Connector (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-primary/60" />
                    </div>
                  )}
                </GlassCard>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="text-center mt-16 mb-16 animate-fade-in [animation-delay:600ms]">
          <h3 className="text-2xl font-bold mb-8">Results from the Learning Loop</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <GlassCard className="p-6 text-center border-primary/30">
              <div className="text-3xl font-bold text-primary mb-2">67%</div>
              <p className="text-sm text-muted-foreground">Average improvement after 10 posts</p>
            </GlassCard>
            <GlassCard className="p-6 text-center border-primary/30">
              <div className="text-3xl font-bold text-primary mb-2">3x</div>
              <p className="text-sm text-muted-foreground">Better ranking after 20 pieces</p>
            </GlassCard>
            <GlassCard className="p-6 text-center border-primary/30">
              <div className="text-3xl font-bold text-primary mb-2">30 days</div>
              <p className="text-sm text-muted-foreground">For AI to learn your audience</p>
            </GlassCard>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in [animation-delay:800ms]">
          <GlassCard className="p-8 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Start Your Self-Learning Content Engine Today</h3>
            <p className="text-xl text-muted-foreground mb-2">
              Your first post teaches the AI. Your 100th post will be exponentially better.
            </p>
            <p className="text-sm text-primary mb-8">
              Free forever plan • No credit card required • The sooner you start, the smarter your AI becomes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-6 shadow-xl hover:shadow-neon-strong"
              >
                Start Free - Watch It Learn
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/contact')}
                className="text-lg px-8 py-6 border-2 border-primary/30"
              >
                See The Learning Loop
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>500M+ Words Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Floating Elements */}
      </Container>
    </section>
  );
};