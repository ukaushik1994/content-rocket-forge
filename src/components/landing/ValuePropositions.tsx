import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, TrendingUp, Target, Users, BarChart3, Zap, CheckCircle } from 'lucide-react';
import { FloatingElements } from './FloatingElements';

export const ValuePropositions = () => {
  const navigate = useNavigate();
  
  const floatingElements = [
    { icon: <Sparkles className="h-5 w-5" />, position: { top: '15%', left: '5%' }, delay: 0, duration: 7 },
    { icon: <Zap className="h-4 w-4" />, position: { top: '50%', right: '8%' }, delay: 1.5, duration: 6 },
    { icon: <Target className="h-5 w-5" />, position: { top: '75%', left: '10%' }, delay: 2, duration: 8 },
  ];

  const audiences = [
    {
      title: 'For Creators',
      subtitle: 'Create Smarter, Not Harder',
      description: 'Focus on your creativity while AI handles optimization, research, and content strategy.',
      icon: Sparkles,
      benefits: [
        'AI writing assistant for 10x faster content',
        'Real-time trend analysis and topic suggestions',
        'Multi-format content generation from one idea',
        'SEO optimization without the complexity'
      ],
      ctaText: 'Start Creating',
      gradient: 'from-primary to-neon-blue'
    },
    {
      title: 'For Influencers',
      subtitle: 'Scale Your Content Empire',
      description: 'Build your audience across all platforms with data-driven content that converts.',
      icon: TrendingUp,
      benefits: [
        'Cross-platform content repurposing',
        'Audience growth analytics and insights',
        'Viral content prediction algorithms',
        'Brand collaboration content templates'
      ],
      ctaText: 'Scale Now',
      gradient: 'from-neon-blue to-neon-pink'
    },
    {
      title: 'For Businesses',
      subtitle: 'Drive Results with Data',
      description: 'Increase content ROI by 300% with strategic, conversion-optimized content creation.',
      icon: Target,
      benefits: [
        'Enterprise-grade analytics and reporting',
        'Team collaboration and workflow management',
        'Brand consistency across all content',
        'Competitive analysis and market insights'
      ],
      ctaText: 'Get Started',
      gradient: 'from-neon-pink to-neon-orange'
    }
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-neon-pink/5 to-background" />
      <div className="absolute inset-0 futuristic-grid opacity-20" />
      <FloatingElements elements={floatingElements} />
      
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Built for Every Creator
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a solo creator, growing influencer, or enterprise team, 
            CreAiter adapts to your needs and scales with your ambitions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-8 h-full hover:shadow-neon transition-all duration-500 card-3d group relative overflow-hidden">
                {/* Enhanced Background Glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-r ${audience.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
                <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r ${audience.gradient} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative z-10">
                {/* Icon and Header */}
                <div className="mb-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${audience.gradient} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <audience.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${audience.gradient} opacity-60 animate-pulse`}></div>
                    <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-gradient-to-r ${audience.gradient} opacity-40 animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{audience.title}</h3>
                  <h4 className={`text-lg font-semibold mb-3 bg-gradient-to-r ${audience.gradient} bg-clip-text text-transparent`}>
                    {audience.subtitle}
                  </h4>
                  <p className="text-muted-foreground mb-6">{audience.description}</p>
                </div>

                {/* Benefits */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {audience.benefits.map((benefit, benefitIndex) => (
                      <motion.li 
                        key={benefitIndex} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: benefitIndex * 0.1 }}
                        className="flex items-start gap-3 group/item"
                      >
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 text-primary group-hover/item:scale-110 transition-transform`} />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA */}
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  className={`w-full bg-gradient-to-r ${audience.gradient} hover:opacity-90 transition-all duration-300 group-hover:shadow-neon`}
                >
                  {audience.ctaText}
                </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-6">Trusted by creators worldwide</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {[Users, BarChart3, Zap].map((Icon, index) => (
              <div key={index} className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Enterprise Ready</span>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
};