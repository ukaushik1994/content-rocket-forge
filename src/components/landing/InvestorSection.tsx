import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Rocket, Brain, Users, Zap, Globe, 
  Target, BarChart3, Calendar, ArrowRight, Download, Sparkles
} from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import { FloatingElements } from './FloatingElements';

export const InvestorSection = () => {
  const floatingElements = [
    { icon: <Sparkles className="h-6 w-6" />, position: { top: '10%', left: '5%' }, delay: 0, duration: 6 },
    { icon: <Zap className="h-5 w-5" />, position: { top: '20%', right: '10%' }, delay: 1, duration: 7 },
    { icon: <Target className="h-6 w-6" />, position: { top: '70%', left: '8%' }, delay: 2, duration: 8 },
    { icon: <Brain className="h-5 w-5" />, position: { top: '80%', right: '15%' }, delay: 1.5, duration: 6.5 },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <FloatingElements elements={floatingElements} />
      
      <Container>
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              Open for Strategic Investment
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Building the Future of
              <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent"> Content Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're seeking strategic partners who share our vision of revolutionizing how 10M+ creators worldwide approach content creation.
            </p>
          </motion.div>

          {/* Three Column Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* The Opportunity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-8 h-full hover:shadow-neon transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-primary to-neon-blue p-0.5 mb-6">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <TrendingUp className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">The Opportunity</h3>
                  <div className="text-3xl font-bold text-primary mb-2">$12.4B</div>
                  <p className="text-sm text-muted-foreground mb-6">Content Marketing Software Market</p>
                  
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Growing at 16.4% CAGR through 2030
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      74% of marketers prioritize content
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Only 29% have content intelligence
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      At the intersection of AI, content & analytics
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </motion.div>

            {/* Our Traction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-8 h-full border-primary/30 hover:shadow-neon transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-neon-blue to-neon-pink p-0.5 mb-6">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <Rocket className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Traction</h3>
                  <p className="text-sm text-primary mb-6">Early Momentum & Product-Market Fit</p>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-3 border border-primary/20">
                      <div className="text-2xl font-bold text-primary">
                        <AnimatedCounter value={10000} suffix="+" />
                      </div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-3 border border-primary/20">
                      <div className="text-2xl font-bold text-primary">
                        <AnimatedCounter value={500} suffix="M+" />
                      </div>
                      <div className="text-xs text-muted-foreground">Words Generated</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-3 border border-primary/20">
                        <div className="text-xl font-bold text-primary">
                          <AnimatedCounter value={67} suffix="%" />
                        </div>
                        <div className="text-xs text-muted-foreground">Time Saved</div>
                      </div>
                      <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-3 border border-primary/20">
                        <div className="text-xl font-bold text-primary">
                          <AnimatedCounter value={40} suffix="%" />
                        </div>
                        <div className="text-xs text-muted-foreground">MoM Growth</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* The Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-8 h-full hover:shadow-neon transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-neon-pink to-neon-orange p-0.5 mb-6">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center">
                      <Brain className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">The Vision</h3>
                  <p className="text-sm text-primary mb-6">Beyond Content Creation</p>
                  
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      World's first self-learning content OS
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Predictive content performance AI
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Standard for content intelligence
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      Democratizing enterprise-grade tools
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Roadmap Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">What We're Building</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Now */}
              <GlassCard className="p-6 border-primary/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h4 className="font-bold text-primary">Now (Q1 2025)</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Self-learning content engine
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    AI Strategy Coach with analytics
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    SERP-powered research
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Smart content hub
                  </li>
                </ul>
              </GlassCard>

              {/* Next */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-neon-blue" />
                  <h4 className="font-bold text-neon-blue">Next (Q2-Q3 2025)</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                    Predictive performance scoring
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                    Multi-language support
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                    Team collaboration suite
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-blue mt-2 flex-shrink-0" />
                    Advanced analytics dashboard
                  </li>
                </ul>
              </GlassCard>

              {/* Future */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-neon-pink" />
                  <h4 className="font-bold text-neon-pink">Future (Q4 2025+)</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    API for third-party integrations
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    White-label solutions
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Enterprise features
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Global expansion
                  </li>
                </ul>
              </GlassCard>
            </div>
          </motion.div>

          {/* Why Now */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">Why Now?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Brain, title: 'AI Revolution', description: 'ChatGPT proved AI content works. We make it intelligent.' },
                { icon: BarChart3, title: 'Data-Driven', description: 'Content without analytics is guesswork. We close the loop.' },
                { icon: Target, title: 'Consolidation', description: 'Creators spend $200-500/mo on 5-10 tools. We\'re all-in-one.' },
                { icon: Globe, title: 'Global Opportunity', description: 'English-first, but 7.5B people create content worldwide.' }
              ].map((item, index) => (
                <GlassCard key={index} className="p-6 text-center hover:shadow-neon transition-all duration-300">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          {/* Investment Use */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8">Investment Allocation</h3>
            <GlassCard className="p-8 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { percentage: 40, label: 'Product Development', sublabel: 'AI/ML team expansion', color: 'from-primary to-neon-blue' },
                  { percentage: 25, label: 'Marketing & Acquisition', sublabel: 'User growth & brand', color: 'from-neon-blue to-neon-pink' },
                  { percentage: 20, label: 'Infrastructure', sublabel: 'Scaling & performance', color: 'from-neon-pink to-neon-orange' },
                  { percentage: 15, label: 'Partnerships', sublabel: 'Strategic integrations', color: 'from-neon-orange to-primary' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">{item.label}</span>
                        <span className="text-sm text-primary font-bold">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{item.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground mt-8">
                Every dollar invested accelerates our mission to empower creators worldwide with AI that truly understands them.
              </p>
            </GlassCard>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
          >
            <GlassCard className="p-8 max-w-3xl mx-auto text-center border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-blue/5 to-neon-pink/5" />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Let's Build the Future Together</h3>
                <p className="text-lg text-muted-foreground mb-8">
                  We're in conversations with strategic investors who understand the content creation space. Let's explore if we're a mutual fit.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-6 shadow-xl hover:shadow-neon-strong"
                    onClick={() => window.location.href = 'mailto:investors@creaiter.com'}
                  >
                    Schedule Investment Discussion
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-primary/30"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Deck
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>25+ years combined experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Proven traction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Clear vision</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};
