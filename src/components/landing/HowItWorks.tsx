import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Research & Analyze',
      description: 'Our AI analyzes real-time SERP data, identifies trending keywords, and uncovers content gaps your competitors are missing.',
      icon: Search,
      features: ['Real-time SERP analysis', 'Keyword intelligence', 'Competitor research', 'Trend identification'],
      color: 'from-primary to-neon-blue'
    },
    {
      number: '02',
      title: 'Create & Optimize',
      description: 'Generate high-quality, SEO-optimized content across multiple formats with our AI writing assistant that understands your brand voice.',
      icon: Sparkles,
      features: ['AI content generation', 'Multi-format creation', 'Brand voice consistency', 'SEO optimization'],
      color: 'from-neon-blue to-neon-pink'
    },
    {
      number: '03',
      title: 'Track & Scale',
      description: 'Monitor performance with detailed analytics, repurpose content across platforms, and scale your strategy based on data-driven insights.',
      icon: TrendingUp,
      features: ['Performance analytics', 'Content repurposing', 'Cross-platform publishing', 'Strategy scaling'],
      color: 'from-neon-pink to-neon-orange'
    }
  ];

  return (
    <section className="py-24 px-4 relative">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            How CreAiter Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From research to results in three simple steps. Our AI-powered platform 
            handles the complexity so you can focus on what matters most - creating amazing content.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-neon-blue to-neon-pink opacity-30 transform -translate-y-1/2"></div>
          
          <div className="grid lg:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <GlassCard className="p-8 text-center hover:shadow-neon transition-all duration-300 card-3d group relative overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
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
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <GlassCard className="p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Content Strategy?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators who are already using CreAiter to scale their content and grow their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 neon-glow"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60 hidden xl:block"></div>
        <div className="absolute bottom-20 right-16 w-1 h-1 bg-neon-blue rounded-full animate-pulse opacity-80 hidden xl:block" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-8 w-1.5 h-1.5 bg-neon-pink rounded-full animate-pulse opacity-70 hidden xl:block" style={{ animationDelay: '2s' }}></div>
      </Container>
    </section>
  );
};