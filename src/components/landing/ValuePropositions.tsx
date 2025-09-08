import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, TrendingUp, Target, Users, BarChart3, Zap } from 'lucide-react';

export const ValuePropositions = () => {
  const navigate = useNavigate();

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
    <section className="py-16 px-4">
      <Container>
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
              <GlassCard className="p-8 h-full hover:shadow-neon transition-all duration-300 card-3d group">
                {/* Icon and Header */}
                <div className="mb-6">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${audience.gradient} p-0.5 mb-4`}>
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <audience.icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${audience.gradient} opacity-60 animate-pulse`}></div>
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
                      <li key={benefitIndex} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${audience.gradient} mt-2 flex-shrink-0`}></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/auth?mode=signup')}
                  className={`w-full bg-gradient-to-r ${audience.gradient} hover:opacity-90 transition-all duration-300 group-hover:shadow-lg`}
                >
                  {audience.ctaText}
                </Button>
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