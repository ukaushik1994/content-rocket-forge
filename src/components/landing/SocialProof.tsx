import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Star, Quote, TrendingUp, Users, Award, Zap } from 'lucide-react';

export const SocialProof = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Content Creator & Blogger',
      company: 'Blogger',
      image: '👩‍💻',
      rating: 5,
      quote: 'My first 5 blog posts got 200 views total. After 3 months with CreAiter, my posts now average 2,000+ views because the AI learned exactly what my audience wants. The difference is night and day.',
      metric: '10x traffic growth in 3 months',
      useCase: 'Blogger'
    },
    {
      name: 'Marcus Chen',
      role: 'Agency Owner',
      company: 'Digital Agency',
      image: '👨‍💼',
      rating: 5,
      quote: 'We manage 50 clients. CreAiter learns each client\'s unique audience. Client A\'s AI knows different strategies than Client B\'s. It\'s like having 50 specialized content strategists working 24/7.',
      metric: '50 personalized AI strategies',
      useCase: 'Agency'
    },
    {
      name: 'Jessica Rodriguez',
      role: 'Social Media Influencer',
      company: '2.5M followers',
      image: '🌟',
      rating: 5,
      quote: 'I posted 20 times before CreAiter really understood my audience. Now? Every post hits. The AI knows my voice, my audience\'s preferences, and what time to post. It\'s crazy accurate.',
      metric: '300% engagement increase',
      useCase: 'Influencer'
    },
    {
      name: 'David Park',
      role: 'Marketing Manager',
      company: 'TechFlow Inc.',
      image: '💼',
      rating: 5,
      quote: 'Traditional AI gives everyone the same generic content. CreAiter learned our B2B audience prefers case studies over listicles, long-form over short. That insight came from analyzing our published content performance.',
      metric: '2x conversion rate improvement',
      useCase: 'Business'
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
    <section className="py-16 px-4">
      <Container>
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See How CreAiter Gets
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> Smarter For Real Users</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from creators whose content improves exponentially over time
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-16 animate-fade-in [animation-delay:200ms]">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-6 text-center hover:shadow-neon transition-all duration-300">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${400 + index * 200}ms` }}
            >
              <GlassCard className="p-6 h-full hover:shadow-neon transition-all duration-300 relative">
                {/* Use Case Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/30">
                    {testimonial.useCase}
                  </div>
                </div>
                
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
            </div>
          ))}
        </div>

        {/* Brand Logos */}
        <div className="text-center animate-fade-in [animation-delay:1000ms]">
          <p className="text-sm text-muted-foreground mb-8">Trusted by leading brands and creators</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {brands.map((brand, index) => (
              <div
                key={index}
                className="glass-card px-6 py-3 rounded-full animate-fade-in"
                style={{ animationDelay: `${1200 + index * 100}ms` }}
              >
                <span className="text-lg font-semibold text-muted-foreground">{brand}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="text-center mt-16 animate-fade-in [animation-delay:1800ms]">
          <GlassCard className="p-8 max-w-3xl mx-auto">
            <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
            <p className="text-xl font-medium mb-4 leading-relaxed">
              "CreAiter isn't just a tool, it's a self-learning content partner. 
              It's like having an AI that actually gets smarter the more you use it. 
              My content strategy today is 10x better than when I started - and it happened automatically."
            </p>
            <div className="text-primary font-semibold">Alex Johnson, CEO of ContentScale</div>
            <div className="text-sm text-muted-foreground">Scaled from 0 to 10M monthly views with CreAiter</div>
          </GlassCard>
        </div>
      </Container>
    </section>
  );
};