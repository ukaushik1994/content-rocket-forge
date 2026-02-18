import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { FeaturePageHero } from '@/components/landing/shared/FeaturePageHero';
import { FeatureSection } from '@/components/landing/shared/FeatureSection';
import { AIChatCTA } from '@/components/landing/shared/AIChatCTA';
import {
  Users, UserCircle, Layers, Activity, Tag, Star,
  Mail, MousePointerClick, Eye, Brain, Filter, Sparkles
} from 'lucide-react';

/* ── Mock UIs ── */
const ContactCRMMockUI = () => (
  <div className="space-y-4">
    {/* Contact header */}
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
        SK
      </div>
      <div>
        <div className="text-base font-semibold text-foreground">Sarah Kim</div>
        <div className="text-xs text-muted-foreground">sarah@example.com · San Francisco</div>
      </div>
      <div className="ml-auto">
        {/* Engagement score ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/10" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-neon-blue" strokeDasharray="126" strokeDashoffset="32" strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-neon-blue">87</span>
        </div>
      </div>
    </div>
    {/* Tags */}
    <div className="flex flex-wrap gap-2">
      {['VIP', 'Newsletter', 'Eco-Conscious', 'Repeat Buyer'].map((tag) => (
        <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
          {tag}
        </span>
      ))}
    </div>
    {/* Activity timeline */}
    <div className="space-y-2.5 pt-2">
      {[
        { icon: Mail, text: 'Opened "Spring Collection" email', time: '2h ago', color: 'text-neon-pink' },
        { icon: MousePointerClick, text: 'Clicked "Shop Sustainable" link', time: '2h ago', color: 'text-neon-orange' },
        { icon: Eye, text: 'Viewed product page 3x', time: '1d ago', color: 'text-neon-blue' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          <item.icon className={`h-3.5 w-3.5 ${item.color} shrink-0`} />
          <span className="text-xs text-muted-foreground flex-1">{item.text}</span>
          <span className="text-[10px] text-muted-foreground/50">{item.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const SegmentsMockUI = () => (
  <div className="space-y-4">
    {/* Segment builder */}
    <div className="flex items-center gap-2 mb-2">
      <Filter className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold text-foreground">Smart Segment Builder</span>
    </div>
    {/* Rules */}
    <div className="space-y-2">
      {[
        { field: 'Engagement Score', op: 'greater than', value: '70' },
        { field: 'Last Activity', op: 'within', value: '7 days' },
        { field: 'Tags', op: 'contains', value: 'Newsletter' },
      ].map((rule, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <span className="text-xs text-neon-blue font-medium">{rule.field}</span>
          <span className="text-xs text-muted-foreground/50">{rule.op}</span>
          <span className="text-xs text-foreground font-medium">{rule.value}</span>
          {i < 2 && <span className="ml-auto text-[10px] text-primary font-semibold">AND</span>}
        </div>
      ))}
    </div>
    {/* Result */}
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">2,847 contacts</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-primary" />
        <span className="text-[10px] text-primary font-medium">AI Optimized</span>
      </div>
    </div>
  </div>
);

const ActivityFeedMockUI = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="h-4 w-4 text-green-400" />
      <span className="text-sm font-semibold text-foreground">Live Activity Feed</span>
      <span className="ml-auto flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[10px] text-green-400">Live</span>
      </span>
    </div>
    {[
      { name: 'Alex M.', action: 'opened email', detail: '"Spring Collection"', time: 'Just now', icon: Mail, color: 'text-neon-pink' },
      { name: 'Jordan L.', action: 'clicked link', detail: '"View Products"', time: '2m ago', icon: MousePointerClick, color: 'text-neon-orange' },
      { name: 'Taylor R.', action: 'visited page', detail: '/pricing', time: '5m ago', icon: Eye, color: 'text-neon-blue' },
      { name: 'Morgan K.', action: 'subscribed to', detail: 'Newsletter', time: '8m ago', icon: Star, color: 'text-primary' },
      { name: 'Casey D.', action: 'completed form', detail: '"Contact Us"', time: '12m ago', icon: UserCircle, color: 'text-green-400' },
    ].map((event, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
      >
        <event.icon className={`h-3.5 w-3.5 ${event.color} shrink-0`} />
        <div className="flex-1 min-w-0">
          <span className="text-xs text-foreground font-medium">{event.name}</span>
          <span className="text-xs text-muted-foreground"> {event.action} </span>
          <span className="text-xs text-foreground">{event.detail}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/50 shrink-0">{event.time}</span>
      </motion.div>
    ))}
  </div>
);

const AudiencePage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Audience Management — Creaiter</title>
        <meta name="description" content="AI-powered CRM: unified contact profiles, smart segments that build themselves, and real-time activity tracking." />
        <link rel="canonical" href="https://creaiter.lovable.app/features/audience" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />

        <main className="relative z-10">
          <FeaturePageHero
            badge="Audience Suite"
            badgeIcon={<Users className="h-4 w-4" />}
            headline="Know every contact."
            highlightedText="Reach the right ones."
            subtitle="Unified profiles, AI-powered segments, and real-time activity — your audience, completely understood."
            gradientFrom="#33C3F0"
            gradientTo="#9b87f5"
            orbColorA="#33C3F0"
            orbColorB="#9b87f5"
            secondaryCTA="Explore audience tools"
            secondaryRoute="/auth?mode=signup"
          />

          <FeatureSection
            headline="Every interaction, one unified profile."
            description="Engagement scores, activity timelines, custom tags, and behavioral data — see the complete picture of every contact."
            features={['Engagement Scoring', 'Activity Timeline', 'Custom Tags', 'Unified Profile', 'Behavioral Data']}
            mockUI={<ContactCRMMockUI />}
            direction="left"
            accentColor="#33C3F0"
          />

          <FeatureSection
            headline="Segments that build themselves with AI."
            description="Define rules once. AI continuously optimizes your segments based on behavior, engagement, and predicted actions."
            features={['Rule Builder', 'AI Optimization', 'Dynamic Updates', 'Predictive Scoring', 'Multi-condition']}
            mockUI={<SegmentsMockUI />}
            direction="right"
            accentColor="#9b87f5"
          />

          <FeatureSection
            headline="See what your audience does, in real time."
            description="Every email open, link click, page visit, and form submission — streaming live as it happens."
            features={['Real-time Events', 'Email Tracking', 'Page Visits', 'Form Submissions', 'Custom Events']}
            mockUI={<ActivityFeedMockUI />}
            direction="left"
            accentColor="#22c55e"
          />

          <AIChatCTA
            chatPrompt="Show me all contacts who opened my last 3 emails but haven't purchased yet, and create a re-engagement segment..."
            secondaryLabel="Explore audience tools"
            accentColor="#33C3F0"
          />
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default AudiencePage;
