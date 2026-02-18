import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DemoModal } from '@/components/landing/DemoModal';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Brain, ArrowRight, Play, MessageSquare, Check,
  Puzzle, Send, Users, BarChart3, Star, RefreshCw,
} from 'lucide-react';

const categories = [
  {
    title: 'Content',
    icon: Puzzle,
    features: ['AI Writer', 'Keyword Research', 'Content Strategy'],
    tools: '5 tools',
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    checkText: 'text-primary/70',
    labelText: 'text-primary/60',
    borderHover: 'hover:border-primary/40',
    borderDefault: 'border-primary/20',
  },
  {
    title: 'Marketing',
    icon: Send,
    features: ['Email Campaigns', 'Social Publishing', 'Automations'],
    tools: '6 tools',
    iconBg: 'bg-neon-pink/10',
    iconText: 'text-neon-pink',
    checkText: 'text-neon-pink/70',
    labelText: 'text-neon-pink/60',
    borderHover: 'hover:border-neon-pink/40',
    borderDefault: 'border-neon-pink/20',
  },
  {
    title: 'Audience',
    icon: Users,
    features: ['Contact Management', 'Smart Segments', 'Activity Feed'],
    tools: '4 tools',
    iconBg: 'bg-neon-blue/10',
    iconText: 'text-neon-blue',
    checkText: 'text-neon-blue/70',
    labelText: 'text-neon-blue/60',
    borderHover: 'hover:border-neon-blue/40',
    borderDefault: 'border-neon-blue/20',
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    features: ['Performance Dashboards', 'Content Insights', 'ROI Tracking'],
    tools: '3 tools',
    iconBg: 'bg-neon-orange/10',
    iconText: 'text-neon-orange',
    checkText: 'text-neon-orange/70',
    labelText: 'text-neon-orange/60',
    borderHover: 'hover:border-neon-orange/40',
    borderDefault: 'border-neon-orange/20',
  },
];

const chatChips = ['Write a blog post', 'Launch email campaign', 'Show me analytics'];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="min-h-screen flex items-center px-4 pt-24 pb-16">
      <div className="container max-w-6xl mx-auto">
        {/* ── Top: Badge + Headline + CTAs ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="text-center space-y-6 mb-16"
        >
          <motion.div custom={0} variants={fadeUp} className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Your Content Operating System
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            One Platform.
            <br />
            <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-clip-text text-transparent">
              Every Content Operation.
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Take action from AI Chat, or dive into each module directly.
            Create, market, analyze, and grow — all in one place.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-4 shadow-xl transition-all duration-300 group"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsDemoOpen(true)}
              className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-lg px-8 py-4 backdrop-blur-sm transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        {/* ── AI Chat Command Center Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="relative mb-10"
        >
          {/* Gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-neon-blue/15 blur-3xl rounded-3xl -z-10" />

          <GlassCard className="bg-white/[0.04] backdrop-blur-xl border-white/[0.08] rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Left */}
              <div className="flex items-start gap-4 flex-1">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-neon-blue flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Chat — Your Command Center
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Create content, launch campaigns, analyze performance, and manage your audience — all from a single conversation.
                  </p>
                </div>
              </div>

              {/* Right — capability chips */}
              <div className="flex flex-wrap gap-2">
                {chatChips.map((chip) => (
                  <span
                    key={chip}
                    className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── 4 Category Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.5 }}
            >
              <GlassCard
                className={`bg-white/[0.03] backdrop-blur-md ${cat.borderDefault} ${cat.borderHover} rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`w-11 h-11 rounded-xl ${cat.iconBg} flex items-center justify-center mb-4`}>
                  <cat.icon className={`h-5 w-5 ${cat.iconText}`} />
                </div>
                <h4 className="text-foreground font-semibold text-lg mb-3">{cat.title}</h4>
                <ul className="space-y-2 mb-4">
                  {cat.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className={`h-3.5 w-3.5 ${cat.checkText} shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className={`text-xs ${cat.labelText}`}>{cat.tools}</span>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* ── Trust indicators ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center justify-center gap-8 text-sm text-muted-foreground flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span>Be among the first creators</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-blue" />
            <span>Join the founding members</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-neon-pink" />
            <span>AI learns from every post</span>
          </div>
        </motion.div>

        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};
