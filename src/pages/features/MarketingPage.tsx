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
  Send, Mail, Share2, Zap, GitBranch, Clock, Sparkles,
  BarChart3, MousePointerClick, Users, Eye, CheckCircle2
} from 'lucide-react';

/* ── Mock UIs ── */
const EmailMockUI = () => (
  <div className="space-y-4">
    {/* Subject line */}
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-neon-pink" />
        <span className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">Email Campaign</span>
      </div>
      <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground font-medium">🌿 5 Sustainable Brands You Need to Know</span>
          <span className="px-2 py-0.5 rounded-full bg-neon-pink/10 border border-neon-pink/20 text-[10px] font-semibold text-neon-pink">AI Suggested</span>
        </div>
      </div>
    </div>
    {/* Email preview blocks */}
    <div className="space-y-2 px-3">
      <div className="h-20 rounded-lg bg-gradient-to-r from-neon-pink/15 to-primary/10 border border-white/[0.06]" />
      <div className="h-3 rounded-full bg-foreground/8 w-full" />
      <div className="h-3 rounded-full bg-foreground/6 w-4/5" />
      <div className="h-10 rounded-lg bg-neon-pink/20 border border-neon-pink/30 flex items-center justify-center">
        <span className="text-xs font-semibold text-neon-pink">Shop Now →</span>
      </div>
    </div>
    {/* Metrics */}
    <div className="flex items-center gap-3 pt-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
        <Eye className="h-3 w-3 text-green-400" />
        <span className="text-[10px] font-semibold text-green-400">42% open rate</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
        <MousePointerClick className="h-3 w-3 text-neon-blue" />
        <span className="text-[10px] font-semibold text-neon-blue">8.3% CTR</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-orange/10 border border-neon-orange/20">
        <Clock className="h-3 w-3 text-neon-orange" />
        <span className="text-[10px] font-semibold text-neon-orange">Best: 9am Tue</span>
      </div>
    </div>
  </div>
);

const SocialMockUI = () => (
  <div className="space-y-4">
    {/* Platform tabs */}
    <div className="flex gap-2">
      {[
        { name: 'Twitter/X', active: true },
        { name: 'LinkedIn', active: false },
        { name: 'Instagram', active: false },
      ].map((p) => (
        <span
          key={p.name}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            p.active ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground'
          }`}
        >
          {p.name}
        </span>
      ))}
    </div>
    {/* Post preview */}
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-blue to-primary" />
        <div>
          <div className="text-xs font-semibold text-foreground">@creaiter</div>
          <div className="text-[10px] text-muted-foreground">Scheduled · Tomorrow 2pm</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Sustainable fashion isn't a trend — it's the future. 🌿 Here's how 5 brands are leading the charge...
      </p>
      <div className="h-32 rounded-lg bg-gradient-to-br from-neon-blue/20 to-primary/10 border border-white/[0.06]" />
    </div>
    {/* Schedule grid hint */}
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`h-6 rounded ${i === 1 || i === 4 ? 'bg-neon-pink/20 border border-neon-pink/30' : 'bg-white/[0.03] border border-white/[0.04]'}`} />
      ))}
    </div>
  </div>
);

const AutomationMockUI = () => (
  <div className="space-y-4">
    {/* Workflow nodes */}
    <div className="flex flex-col items-center gap-0">
      {/* Trigger */}
      <div className="w-full max-w-xs px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">New Subscriber</span>
        </div>
      </div>
      <div className="w-0.5 h-8 bg-white/10" />

      {/* Wait */}
      <div className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-neon-orange/10 border border-neon-orange/20 text-center">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-3.5 w-3.5 text-neon-orange" />
          <span className="text-xs font-medium text-neon-orange">Wait 2 days</span>
        </div>
      </div>
      <div className="w-0.5 h-8 bg-white/10" />

      {/* Split */}
      <div className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center">
        <div className="flex items-center justify-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">A/B Split: 50/50</span>
        </div>
      </div>

      {/* Branches */}
      <div className="flex gap-6 mt-3 w-full max-w-sm">
        <div className="flex-1 text-center">
          <div className="w-0.5 h-6 bg-white/10 mx-auto" />
          <div className="px-3 py-2 rounded-lg bg-neon-pink/10 border border-neon-pink/20">
            <Mail className="h-3.5 w-3.5 text-neon-pink mx-auto mb-1" />
            <span className="text-[10px] text-neon-pink">Welcome A</span>
          </div>
        </div>
        <div className="flex-1 text-center">
          <div className="w-0.5 h-6 bg-white/10 mx-auto" />
          <div className="px-3 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
            <Mail className="h-3.5 w-3.5 text-neon-blue mx-auto mb-1" />
            <span className="text-[10px] text-neon-blue">Welcome B</span>
          </div>
        </div>
      </div>
    </div>
    {/* Stats */}
    <div className="flex items-center justify-center gap-4 pt-2">
      <span className="text-xs text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-green-400 inline mr-1" />
        1,247 subscribers processed
      </span>
      <span className="text-xs text-muted-foreground">
        <BarChart3 className="h-3 w-3 text-neon-blue inline mr-1" />
        68% conversion
      </span>
    </div>
  </div>
);

const MarketingPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Marketing — Creaiter</title>
        <meta name="description" content="AI-powered email campaigns, social publishing, automations, and customer journeys — marketing that runs itself." />
        <link rel="canonical" href="https://creaiter.lovable.app/features/marketing" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />

        <main className="relative z-10">
          <FeaturePageHero
            badge="Marketing Suite"
            badgeIcon={<Send className="h-4 w-4" />}
            headline="Marketing that runs"
            highlightedText="while you sleep."
            subtitle="Email campaigns, social publishing, and automations — all powered by AI that learns what converts."
            gradientFrom="#D946EF"
            gradientTo="#F97316"
            orbColorA="#D946EF"
            orbColorB="#F97316"
            secondaryCTA="Explore marketing tools"
            secondaryRoute="/auth?mode=signup"
          />

          <FeatureSection
            headline="Emails that write themselves and send at the perfect time."
            description="AI crafts subject lines, builds visual emails, and optimizes send times — every campaign learns from the last."
            features={['AI Subject Lines', 'Visual Builder', 'Send Time AI', 'A/B Testing', 'Smart Segmentation']}
            mockUI={<EmailMockUI />}
            direction="left"
            accentColor="#D946EF"
          />

          <FeatureSection
            headline="One dashboard. Every platform. AI captions included."
            description="Compose once, publish everywhere. AI writes platform-optimized captions and picks the best times to post."
            features={['Multi-Platform', 'AI Captions', 'Smart Scheduling', 'Visual Calendar', 'Analytics']}
            mockUI={<SocialMockUI />}
            direction="right"
            accentColor="#33C3F0"
          />

          <FeatureSection
            headline="Workflows that run your marketing on autopilot."
            description="Visual automation builder with smart triggers, A/B paths, and conversion tracking. Set it once, let it run forever."
            features={['Visual Builder', 'Smart Triggers', 'A/B Paths', 'Conversion Tracking', 'Journey Mapping']}
            mockUI={<AutomationMockUI />}
            direction="left"
            accentColor="#F97316"
          />

          <AIChatCTA
            chatPrompt="Launch a welcome email sequence for new subscribers with A/B testing on subject lines..."
            secondaryLabel="Explore marketing tools"
            accentColor="#D946EF"
          />
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default MarketingPage;
