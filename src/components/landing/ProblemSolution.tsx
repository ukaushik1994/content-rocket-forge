import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { X, ArrowRight, Check, RefreshCw } from 'lucide-react';

export const ProblemSolution = () => {
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
    <section className="py-20 px-4 relative overflow-hidden">
      <Container>
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
            <GlassCard className="p-8 h-full border-primary/30 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              
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

        {/* Intelligence Loop Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-8">The Intelligence Loop</h3>
          <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
            {['Create Content', 'Publish & Track', 'Analyze Results', 'AI Learns', 'Improve'].map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-neon-blue/10 border border-primary/30">
                  <RefreshCw className={`h-4 w-4 text-primary ${index === 3 ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">{step}</span>
                </div>
                {index < 4 && (
                  <ArrowRight className="h-5 w-5 text-primary hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto">
            Every post makes your AI smarter. Your 100th piece will be 300% better than your 1st.
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
