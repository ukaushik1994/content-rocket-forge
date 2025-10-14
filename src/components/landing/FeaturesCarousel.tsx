import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { 
  Brain, Search, MessageSquare, Archive, 
  CheckCircle, ArrowRight
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';

export const FeaturesCarousel = () => {
  const navigate = useNavigate();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const features = [
    {
      id: 'self-learning',
      title: 'Self-Learning Intelligence Engine',
      description: 'Creates content, tracks performance, analyzes results, and feeds insights back into future content generation',
      icon: Brain,
      benefits: ['Learns from YOUR performance', 'Adapts to YOUR audience', 'Improves quality over time', 'Personalized strategy'],
      preview: 'Every piece of content you publish teaches the AI what works for YOUR audience. Your 100th post will be exponentially better than your 1st because CreAiter learns from every result.',
      gradient: 'from-primary to-neon-pink',
      badge: '⭐ CORE DIFFERENTIATOR'
    },
    {
      id: 'ai-strategy',
      title: 'AI Strategy Coach',
      description: '24/7 business intelligence AI with interactive charts and tables',
      icon: MessageSquare,
      benefits: ['Interactive charts & tables', 'Multi-perspective analysis', 'Contextual recommendations', 'Performance predictions'],
      preview: 'Unlike text-only AI, CreAiter\'s Strategy Coach shows you data visually. See what\'s working, what\'s not, and exactly what to do next - with charts, tables, and actionable insights.',
      gradient: 'from-neon-blue to-neon-pink',
      badge: null
    },
    {
      id: 'serp-research',
      title: 'SERP-Powered Research',
      description: 'Real-time competitive intelligence from live search results',
      icon: Search,
      benefits: ['Live SERP analysis', 'Content gap detection', 'Question mining (PAA)', 'Keyword intelligence'],
      preview: 'Know exactly what will rank before you write. CreAiter analyzes live search results to find gaps, questions, and opportunities that your competitors miss.',
      gradient: 'from-neon-pink to-neon-orange',
      badge: null
    },
    {
      id: 'content-hub',
      title: 'Smart Content Hub',
      description: 'Intelligent repository with performance tracking and repurposing',
      icon: Archive,
      benefits: ['Performance analytics', 'Content repurposing (1→20+)', 'Version control', 'Team collaboration'],
      preview: 'Never lose track of content. Every piece is tracked, analyzed, and can be repurposed into 20+ formats with one click. See what performs best and do more of it.',
      gradient: 'from-neon-orange to-primary',
      badge: null
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [api]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-8 px-4 relative overflow-hidden">
      
      <Container className="relative z-10 backdrop-blur-[2px]">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            The Only Content Platform
            <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent"> That Learns From Your Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Not just another AI tool. CreAiter creates a personalized content strategy that gets smarter every time you publish.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {features.map((feature, index) => (
                <CarouselItem key={feature.id}>
                  <GlassCard className="p-8 md:p-12 relative overflow-hidden">
                    {/* Background gradient */}
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-r ${feature.gradient} opacity-10 rounded-full blur-3xl`} />
                    
                    {/* Badge */}
                    {feature.badge && (
                      <div className="absolute top-6 right-6">
                        <div className={`bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold px-4 py-2 rounded-full animate-pulse`}>
                          {feature.badge}
                        </div>
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.gradient} p-0.5 mb-6`}>
                        <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                          <feature.icon className="h-10 w-10 text-primary" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-3xl md:text-4xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                      <p className="text-muted-foreground mb-8 leading-relaxed">
                        {feature.preview}
                      </p>

                      {/* Benefits Grid */}
                      <div className="grid md:grid-cols-2 gap-3 mb-8">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-3">
                            <CheckCircle className={`h-5 w-5 text-primary flex-shrink-0`} />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button 
                        onClick={() => navigate('/auth?mode=signup')}
                        className={`bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-lg px-8`}
                      >
                        Try This Feature
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </GlassCard>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0" />
              
              {/* Progress dots */}
              <div className="flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all ${
                      current === index 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-primary/30'
                    }`}
                  />
                ))}
              </div>
              
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </Container>
    </section>
  );
};
