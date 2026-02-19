import React from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Check, X, TrendingUp, Minus, Sparkles, Zap, Activity } from 'lucide-react';
import { FloatingElements } from './FloatingElements';
import { AnimatedCounter } from './AnimatedCounter';

export const ComparisonTable = () => {
  const floatingElements = [
  { icon: <Sparkles className="h-5 w-5" />, position: { top: '20%', left: '5%' }, delay: 0, duration: 7 },
  { icon: <Zap className="h-4 w-4" />, position: { top: '60%', right: '8%' }, delay: 1.5, duration: 6 },
  { icon: <Activity className="h-5 w-5" />, position: { top: '80%', left: '10%' }, delay: 2, duration: 8 }];


  const comparisons = [
  { feature: 'Content Quality', generic: 'Same for everyone', creaiter: 'Improves specifically for YOU', highlight: true },
  { feature: 'Learning Capability', generic: 'No learning', creaiter: 'Learns from YOUR results', highlight: true },
  { feature: 'Performance Tracking', generic: 'None built-in', creaiter: 'Real-time analytics dashboard' },
  { feature: 'Audience Understanding', generic: 'Generic prompts', creaiter: 'Personalized to YOUR audience' },
  { feature: 'Strategy Guidance', generic: 'You figure it out', creaiter: 'AI Strategy Coach guides you' },
  { feature: 'SERP Research', generic: 'Manual process', creaiter: 'Automated & integrated' },
  { feature: 'Content Repository', generic: 'Not included', creaiter: 'Smart hub with repurposing' },
  { feature: 'Over Time', generic: 'Stays the same', creaiter: 'Gets exponentially better', highlight: true },
  { feature: 'Your 100th Post', generic: 'Same quality as 1st', creaiter: '300% better than 1st', highlight: true }];


  return (
    <section className="py-8 px-4 relative overflow-hidden">
      {/* Floating Elements Only - Background inherited from AnimatedBackground */}
      <FloatingElements elements={floatingElements} />
      
      























































































































































































    </section>);

};