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

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {audiences.map((audience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full hover:shadow-lg transition-all duration-300 group">
                {/* Compact Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${audience.gradient} p-0.5 mb-4`}>
                  <div className="w-full h-full rounded-lg bg-card flex items-center justify-center">
                    <audience.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                {/* Title only */}
                <h3 className="text-xl font-bold mb-3">{audience.title}</h3>
                
                {/* Reduced benefits - only 2 */}
                <ul className="space-y-2">
                  {audience.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                    <li 
                      key={benefitIndex} 
                      className="flex items-start gap-2"
                    >
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
};