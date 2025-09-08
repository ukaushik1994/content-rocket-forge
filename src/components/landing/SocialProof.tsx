import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Star, Quote, TrendingUp, Users, Award, Zap } from 'lucide-react';

export const SocialProof = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: '@sarahcreates',
      image: '👩‍💻',
      rating: 5,
      quote: 'CreAiter transformed my content strategy. I went from struggling with writer\'s block to publishing daily content that actually ranks. The SERP integration is a game-changer.',
      metric: '300% increase in organic reach'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Marketing Director',
      company: 'TechFlow Inc.',
      image: '👨‍💼',
      rating: 5,
      quote: 'The ROI we\'ve seen from CreAiter is incredible. Our team is now producing 10x more content while maintaining quality. The analytics help us double down on what works.',
      metric: '450% improvement in content ROI'
    },
    {
      name: 'Emma Thompson',
      role: 'Influencer',
      company: '2.5M followers',
      image: '🌟',
      rating: 5,
      quote: 'I wish I found CreAiter sooner. The content repurposing feature alone has saved me 20+ hours per week. Now I can focus on engaging with my audience instead of creating from scratch.',
      metric: '50% reduction in content creation time'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Creators' },
    { icon: TrendingUp, value: '300%', label: 'Average ROI Increase' },
    { icon: Zap, value: '100M+', label: 'Words Generated' },
    { icon: Award, value: '4.9/5', label: 'User Rating' }
  ];

  const brands = [
    '🚀 TechStart',
    '📱 AppFlow',
    '🎨 DesignCo',
    '📊 DataCorp',
    '🌟 BrandStudio',
    '💡 InnovateHQ'
  ];

  return (
    <section className="py-24 px-4">
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Loved by Creators Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful creators, influencers, and businesses who trust CreAiter 
            to power their content strategy and drive real results.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center hover:shadow-neon transition-all duration-300">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full hover:shadow-neon transition-all duration-300 card-3d">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.company}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative mb-4">
                  <Quote className="h-6 w-6 text-primary/20 absolute -top-2 -left-2" />
                  <p className="text-muted-foreground italic leading-relaxed pl-4">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Metric */}
                <div className="bg-gradient-to-r from-primary/10 to-neon-blue/10 rounded-lg p-3 border border-primary/20">
                  <div className="text-sm font-semibold text-primary">{testimonial.metric}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Brand Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-8">Trusted by leading brands and creators</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {brands.map((brand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card px-6 py-3 rounded-full"
              >
                <span className="text-lg font-semibold text-muted-foreground">{brand}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <GlassCard className="p-8 max-w-3xl mx-auto">
            <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
            <p className="text-xl font-medium mb-4 leading-relaxed">
              "CreAiter isn't just a tool, it's a complete content strategy partner. 
              It's like having a team of expert copywriters, SEO specialists, and data analysts 
              working around the clock for your success."
            </p>
            <div className="text-primary font-semibold">Alex Johnson, CEO of ContentScale</div>
            <div className="text-sm text-muted-foreground">Scaled from $0 to $1M ARR using CreAiter</div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
};