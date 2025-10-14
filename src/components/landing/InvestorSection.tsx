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
    <section className="py-8 px-4 relative overflow-hidden">
      {/* Floating Elements Only - Background inherited from AnimatedBackground */}
      <FloatingElements elements={floatingElements} />
      
      <Container className="backdrop-blur-[2px]">
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
              Seeking Seed Investment
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Building the Future of
              <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent"> Content Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've built a complete AI-powered content platform in 60 days. Now we're seeking seed investment to launch, scale, and revolutionize how creators worldwide approach content creation.
            </p>
          </motion.div>

          {/* Two Column Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
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

            {/* The Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
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
              {/* Built */}
              <GlassCard className="p-6 border-primary/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h4 className="font-bold text-primary">Built (Sept-Oct 2025)</h4>
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
                    SERP-powered research platform
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Smart content hub & workflows
                  </li>
                </ul>
              </GlassCard>

              {/* Current Phase */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h4 className="font-bold text-primary">Current Phase (Oct-Nov 2025)</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Intensive beta testing program
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Performance optimization & bug fixes
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    User feedback integration
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                    Security & compliance validation
                  </li>
                </ul>
              </GlassCard>

              {/* Launch & Scale */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-neon-pink" />
                  <h4 className="font-bold text-neon-pink">Launch & Scale (Dec 2025+)</h4>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Public platform launch
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Marketing & user acquisition
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Partnership & integration rollout
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-neon-pink mt-2 flex-shrink-0" />
                    Infrastructure scaling for growth
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
                { icon: Brain, title: 'AI Revolution', description: 'ChatGPT proved AI content works. We\'ll make it intelligent.' },
                { icon: BarChart3, title: 'Data-Driven', description: 'Content without analytics is guesswork. We\'ll close the loop.' },
                { icon: Target, title: 'Consolidation', description: 'Creators need 5-10 tools. We\'ll be the all-in-one solution.' },
                { icon: Globe, title: 'Global Opportunity', description: '7.5B people create content worldwide. Massive potential.' }
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
                  { percentage: 35, label: 'Marketing & Go-to-Market', sublabel: 'Launch campaign & user acquisition', color: 'from-primary to-neon-blue' },
                  { percentage: 30, label: 'Operations & Team', sublabel: 'Testing support & customer success', color: 'from-neon-blue to-neon-pink' },
                  { percentage: 20, label: 'Infrastructure & Scaling', sublabel: 'Cloud infrastructure & performance', color: 'from-neon-pink to-neon-orange' },
                  { percentage: 15, label: 'Partnerships & Integrations', sublabel: 'Strategic partnerships & API partners', color: 'from-neon-orange to-primary' }
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
                <h3 className="text-3xl font-bold mb-4">Join Us in Launching the Future</h3>
                <p className="text-lg text-muted-foreground mb-8">
                  The platform is built and in testing. We're seeking our first strategic investors to fund the launch and scale this vision globally. Be a founding investor and help us revolutionize content creation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-6 shadow-xl hover:shadow-neon-strong"
                    onClick={() => window.location.href = 'mailto:investors@creaiter.com'}
                  >
                    Schedule Discussion
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
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Innovative technology</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Massive market</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Clear roadmap</span>
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
