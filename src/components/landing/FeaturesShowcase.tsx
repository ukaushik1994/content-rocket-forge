import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { 
  FileText, Search, BarChart3, Archive, Repeat, 
  MessageSquare, Globe, Target, TrendingUp, 
  Users, Zap, Brain, Sparkles, Activity
} from 'lucide-react';
import { FloatingElements } from './FloatingElements';
import { AnimatedCounter } from './AnimatedCounter';

export const FeaturesShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const floatingElements = [
    { icon: <Brain className="h-6 w-6" />, position: { top: '10%', left: '3%' }, delay: 0, duration: 7 },
    { icon: <Sparkles className="h-5 w-5" />, position: { top: '30%', right: '5%' }, delay: 1, duration: 6 },
    { icon: <Activity className="h-5 w-5" />, position: { top: '70%', left: '8%' }, delay: 2, duration: 8 },
  ];

  const features = [
    {
      id: 'self-learning',
      title: 'Self-Learning Intelligence Engine',
      description: 'Creates content, tracks performance, analyzes results, and feeds insights back into future content generation',
      icon: Brain,
      benefits: ['Learns from YOUR performance', 'Adapts to YOUR audience', 'Improves quality over time', 'Personalized strategy'],
      preview: 'Every piece of content you publish teaches the AI what works for YOUR audience. Your 100th post will be exponentially better than your 1st because CreAiter learns from every result.',
      color: 'from-primary to-neon-pink',
      isHero: true
    },
    {
      id: 'ai-strategy',
      title: 'AI Strategy Coach',
      description: '24/7 business intelligence AI with interactive charts and tables',
      icon: MessageSquare,
      benefits: ['Interactive charts & tables', 'Multi-perspective analysis', 'Contextual recommendations', 'Performance predictions'],
      preview: 'Unlike text-only AI, CreAiter\'s Strategy Coach shows you data visually. See what\'s working, what\'s not, and exactly what to do next - with charts, tables, and actionable insights.',
      color: 'from-neon-blue to-neon-pink'
    },
    {
      id: 'serp-research',
      title: 'SERP-Powered Research',
      description: 'Real-time competitive intelligence from live search results',
      icon: Search,
      benefits: ['Live SERP analysis', 'Content gap detection', 'Question mining (PAA)', 'Keyword intelligence'],
      preview: 'Know exactly what will rank before you write. CreAiter analyzes live search results to find gaps, questions, and opportunities that your competitors miss.',
      color: 'from-neon-pink to-neon-orange'
    },
    {
      id: 'content-hub',
      title: 'Smart Content Hub',
      description: 'Intelligent repository with performance tracking and repurposing',
      icon: Archive,
      benefits: ['Performance analytics', 'Content repurposing (1→20+)', 'Version control', 'Team collaboration'],
      preview: 'Never lose track of content. Every piece is tracked, analyzed, and can be repurposed into 20+ formats with one click. See what performs best and do more of it.',
      color: 'from-neon-orange to-primary'
    }
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-neon-blue/5 to-background" />
      <div className="absolute inset-0 futuristic-grid opacity-20" />
      <FloatingElements elements={floatingElements} />
      
      <Container className="relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Only Content Platform
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> That Learns From Your Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Not just another AI tool. CreAiter creates a personalized content strategy that gets smarter every time you publish.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 items-start">
          {/* Feature Tabs */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GlassCard
                  className={`p-6 cursor-pointer transition-all duration-500 relative group ${
                    activeFeature === index 
                      ? 'ring-2 ring-primary shadow-neon scale-105' 
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  {/* Hero Feature Badge */}
                  {feature.isHero && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-primary to-neon-pink text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        ⭐ CORE DIFFERENTIATOR
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-0.5 flex-shrink-0`}>
                      <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
                        {React.createElement(feature.icon, { className: "h-6 w-6 text-primary" })}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`}></div>
                            <span className="text-xs text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* Feature Preview */}
          <div className="lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      {React.createElement(features[activeFeature].icon, { className: "h-8 w-8 text-primary" })}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{features[activeFeature].title}</h3>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {features[activeFeature].preview}
                  </p>
                  
                  {/* Enhanced Interactive Preview */}
                  <div className="relative h-64 rounded-lg bg-gradient-to-br from-background/50 to-background/20 border border-border/50 mb-6 overflow-hidden group">
                    <div className="absolute inset-0 bg-futuristic-grid bg-grid opacity-20"></div>
                    
                    {/* Simulated Dashboard Content */}
                    <div className="absolute inset-0 p-4">
                      {activeFeature === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-32 bg-gradient-to-r from-primary/30 to-neon-pink/30 rounded animate-pulse" />
                            <Brain className="h-6 w-6 text-primary animate-pulse" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded border border-primary/30 animate-pulse" />
                            <div className="h-16 bg-gradient-to-br from-neon-blue/20 to-neon-blue/10 rounded border border-neon-blue/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="h-16 bg-gradient-to-br from-neon-pink/20 to-neon-pink/10 rounded border border-neon-pink/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                          <div className="h-20 bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded border border-primary/30 flex items-center px-3 gap-2">
                            <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2 bg-primary/30 rounded w-3/4 animate-pulse" />
                              <div className="h-2 bg-neon-blue/30 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      {activeFeature !== 0 && (
                        <div className="flex items-center justify-center h-full">
                          {React.createElement(features[activeFeature].icon, { className: "h-16 w-16 text-primary animate-pulse" })}
                        </div>
                      )}
                    </div>
                    
                    {/* Floating particles */}
                    <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="absolute top-8 right-6 w-1 h-1 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className={`bg-gradient-to-r ${features[activeFeature].color} hover:opacity-90`}>
                      Try This Feature
                    </Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">Platform Impact</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Globe, value: 50, suffix: '+', label: 'Content Types' },
              { icon: Target, value: 10, suffix: 'x', label: 'Faster Creation' },
              { icon: TrendingUp, value: 300, suffix: '%', label: 'ROI Increase' },
              { icon: Brain, value: 24, suffix: '/7', label: 'AI Support' },
            ].map((stat, index) => (
              <GlassCard key={index} className="p-6 text-center hover:shadow-neon transition-all duration-300 group">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};