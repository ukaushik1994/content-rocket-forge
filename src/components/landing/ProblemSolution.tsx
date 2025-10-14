import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { X, ArrowRight, Check, RefreshCw, Sparkles, Zap, Target } from 'lucide-react';
import { FloatingElements } from './FloatingElements';

export const ProblemSolution = () => {
  const floatingElements = [
    { icon: <Sparkles className="h-5 w-5" />, position: { top: '15%', left: '5%' }, delay: 0, duration: 7 },
    { icon: <Zap className="h-4 w-4" />, position: { top: '60%', right: '8%' }, delay: 1.5, duration: 6 },
    { icon: <Target className="h-5 w-5" />, position: { top: '80%', left: '10%' }, delay: 2, duration: 8 },
  ];

  const painPoints = [
    'SEMrush for keywords → Export to Excel',
    'ChatGPT for writing → Copy/paste chaos',
    'Google Analytics → Manual reporting',
    'Trello for management → Lost updates',
    'Figuring out "what next?" → Hours wasted'
  ];

  const solutions = [
    'SERP-powered research in one click',
    'AI writing with context built-in',
    'Real-time analytics dashboard',
    'Smart content repository',
    'AI Strategy Coach tells you exactly what to do'
  ];

  return (
    <section className="py-8 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <FloatingElements elements={floatingElements} />
      
      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Stop Juggling
            <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent"> 10 Different Tools</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Content creation shouldn't feel like managing a startup. CreAiter brings everything into one intelligent system that learns from your results.
          </motion.p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* BEFORE - The Chaos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-8 h-full border-destructive/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">The Old Way</h3>
                  <p className="text-sm text-muted-foreground">Tool chaos & wasted time</p>
                </div>
              </div>

              <div className="space-y-3">
                {painPoints.map((pain, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                  >
                    <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{pain}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm font-semibold text-destructive">
                  Result: Scattered workflow, lost data, 20+ hours/week wasted
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* AFTER - The Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-8 h-full border-primary/30 relative overflow-hidden group hover:shadow-neon transition-all duration-500">
              {/* Enhanced Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl group-hover:bg-neon-blue/20 transition-all duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-neon-blue flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">The CreAiter Way</h3>
                    <p className="text-sm text-primary">All-in-one content OS</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {solutions.map((solution, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                    >
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{solution}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg border border-primary/20">
                  <p className="text-sm font-semibold text-primary">
                    Result: Streamlined workflow, unified data, 67% time saved
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Arrow Between */}
        <motion.div 
          className="flex justify-center my-8 lg:hidden"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <ArrowRight className="h-8 w-8 text-primary" />
        </motion.div>

        {/* Enhanced Intelligence Loop Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold mb-4 text-center">
            The Intelligence Loop
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> That Changes Everything</span>
          </h3>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            A continuous cycle where every piece of content makes the next one exponentially better
          </p>
          
          <GlassCard className="p-8 max-w-5xl mx-auto relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-blue/5 to-neon-pink/5" />
            
            <div className="relative z-10">
              {/* Circular flow */}
              <div className="flex flex-wrap justify-center items-center gap-3 mb-8">
                {['Create Content', 'Publish & Track', 'Analyze Results', 'AI Learns', 'Improve'].map((step, index) => (
                  <React.Fragment key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="relative"
                    >
                      <div className={`px-5 py-3 rounded-full bg-gradient-to-r ${
                        index === 3 
                          ? 'from-neon-pink to-neon-orange border-2 border-neon-pink shadow-neon' 
                          : 'from-primary/10 to-neon-blue/10 border border-primary/30'
                      } hover:shadow-neon transition-all duration-300`}>
                        <div className="flex items-center gap-2">
                          <RefreshCw className={`h-5 w-5 ${
                            index === 3 ? 'text-neon-pink animate-spin' : 'text-primary'
                          }`} />
                          <span className={`text-sm font-semibold ${
                            index === 3 ? 'text-neon-pink' : ''
                          }`}>{step}</span>
                        </div>
                      </div>
                      {index === 3 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-neon-pink to-neon-orange text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
                            ⚡ The Magic Happens Here
                          </div>
                        </div>
                      )}
                    </motion.div>
                    {index < 4 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 + index * 0.1 + 0.05 }}
                      >
                        <ArrowRight className="h-6 w-6 text-primary hidden sm:block" />
                      </motion.div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-4 border border-primary/20 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">300%</div>
                  <p className="text-sm text-muted-foreground">Quality improvement by post 100</p>
                </div>
                <div className="bg-gradient-to-r from-neon-blue/10 to-neon-pink/10 rounded-lg p-4 border border-neon-blue/20 text-center">
                  <div className="text-3xl font-bold text-neon-blue mb-1">67%</div>
                  <p className="text-sm text-muted-foreground">Time saved on content creation</p>
                </div>
                <div className="bg-gradient-to-r from-neon-pink/10 to-primary/10 rounded-lg p-4 border border-neon-pink/20 text-center">
                  <div className="text-3xl font-bold text-neon-pink mb-1">24/7</div>
                  <p className="text-sm text-muted-foreground">AI learning from your data</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
};
