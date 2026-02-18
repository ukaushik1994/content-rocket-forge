import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, ArrowRight, Play, Brain, Puzzle, Send, Users, BarChart3,
  PenTool, Image, Video, Search, Target, Mail, Share2, Zap, GitBranch,
  Layers, Activity, TrendingUp, Eye, DollarSign, CheckCircle2, Sparkles
} from 'lucide-react';
import { DemoModal } from '@/components/landing/DemoModal';

const chatActions = [
  { label: 'Write a blog post', color: 'bg-primary/10 text-primary border-primary/20' },
  { label: 'Launch email campaign', color: 'bg-neon-pink/10 text-neon-pink border-neon-pink/20' },
  { label: 'Generate product images', color: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20' },
  { label: 'Show weekly analytics', color: 'bg-neon-orange/10 text-neon-orange border-neon-orange/20' },
];

const categories = [
  {
    title: 'Content',
    icon: Puzzle,
    color: 'primary',
    borderHover: 'hover:border-primary/30',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    checkColor: 'text-primary/70',
    features: ['AI Writer + SERP Research', 'Image & Video Generation', 'Content Strategy & Repository'],
    tools: '8 tools',
  },
  {
    title: 'Marketing',
    icon: Send,
    color: 'neon-pink',
    borderHover: 'hover:border-neon-pink/30',
    iconBg: 'bg-neon-pink/10',
    iconColor: 'text-neon-pink',
    checkColor: 'text-neon-pink/70',
    features: ['Email Campaigns', 'Social Publishing', 'Automations & Journeys'],
    tools: '6 tools',
  },
  {
    title: 'Audience',
    icon: Users,
    color: 'neon-blue',
    borderHover: 'hover:border-neon-blue/30',
    iconBg: 'bg-neon-blue/10',
    iconColor: 'text-neon-blue',
    checkColor: 'text-neon-blue/70',
    features: ['Contact Management', 'Smart Segments', 'Activity Feed'],
    tools: '4 tools',
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    color: 'neon-orange',
    borderHover: 'hover:border-neon-orange/30',
    iconBg: 'bg-neon-orange/10',
    iconColor: 'text-neon-orange',
    checkColor: 'text-neon-orange/70',
    features: ['Performance Dashboards', 'Content ROI Tracking', 'AI-Powered Insights'],
    tools: '5 tools',
  },
];

export const LandingHero = () => {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  return (
    <section className="min-h-screen flex items-center px-4 pt-24 pb-16">
      <div className="container max-w-7xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Brain className="h-4 w-4" />
            AI-Powered Content Operating System
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-4xl mx-auto mb-6"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            One Conversation.
            <br />
            <span className="bg-gradient-to-r from-primary via-neon-blue to-neon-pink bg-300% bg-clip-text text-transparent animate-gradient-shift">
              Every Content Operation.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
        >
          Create content, run campaigns, manage audiences, and track performance — all from a single AI conversation. Or take manual control anytime.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=signup')}
            className="bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 text-lg px-8 py-4 shadow-xl hover:shadow-neon-strong transition-all duration-300 group"
          >
            Start Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsDemoOpen(true)}
            className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 text-lg px-8 py-4 backdrop-blur-sm"
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </motion.div>

        {/* AI Chat Command Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative max-w-5xl mx-auto mb-16"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/15 via-neon-blue/10 to-neon-pink/15 blur-3xl rounded-3xl" />
          
          <div className="relative rounded-2xl border border-primary/20 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-neon-blue">
                    <MessageSquare className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">AI Chat — Your Command Center</h3>
                    <p className="text-sm text-muted-foreground">One conversation runs your entire content operation</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Create content, launch campaigns, analyze performance, manage your audience — all from one intelligent conversation that understands your brand.
                </p>
              </div>

              {/* Right — Action chips */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[280px]">
                {chatActions.map((action, i) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`px-4 py-3 rounded-xl border backdrop-blur-md text-sm font-medium cursor-default ${action.color}`}
                  >
                    <Sparkles className="h-3 w-3 mb-1 opacity-60" />
                    {action.label}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md p-6 hover:-translate-y-1 transition-all duration-300 ${cat.borderHover}`}
            >
              <div className={`${cat.iconBg} rounded-xl p-3 w-fit mb-4`}>
                <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{cat.title}</h3>
              <ul className="space-y-2 mb-4">
                {cat.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${cat.checkColor} flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>
              <span className={`text-xs ${cat.iconColor} opacity-60`}>{cat.tools}</span>
            </motion.div>
          ))}
        </div>

        {/* Trust Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Self-learning AI engine</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-blue" />
            <span>Full CRM built-in</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-neon-pink" />
            <span>Learns from every post</span>
          </div>
        </motion.div>

        <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      </div>
    </section>
  );
};
