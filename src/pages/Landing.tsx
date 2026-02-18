import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { CategoryTeaser } from '@/components/landing/CategoryTeaser';
import { AIIntelligenceShowcase } from '@/components/landing/AIIntelligenceShowcase';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { InvestorSection } from '@/components/landing/InvestorSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  PenTool, Send, Users, BarChart3,
  FileText, TrendingUp, Brain, Image, Sparkles,
  Mail, Eye, MousePointerClick, Clock,
  Tag, Star, Activity,
  ArrowUpRight, DollarSign
} from 'lucide-react';

/* ── Mini mock UIs for teasers ── */
const ContentTeaserMock = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-1">
      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
      <span className="text-xs text-primary/70 font-mono">AI writing...</span>
    </div>
    <div className="space-y-2">
      <div className="h-2.5 rounded-full bg-foreground/10 w-full" />
      <div className="h-2.5 rounded-full bg-foreground/8 w-10/12" />
      <div className="h-2.5 rounded-full bg-foreground/6 w-8/12" />
    </div>
    <div className="grid grid-cols-2 gap-2 pt-2">
      <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-neon-pink/10 border border-white/[0.06] flex items-center justify-center">
        <Image className="h-5 w-5 text-foreground/20" />
      </div>
      <div className="aspect-square rounded-lg bg-gradient-to-br from-neon-blue/20 to-primary/10 border border-white/[0.06] flex items-center justify-center">
        <Image className="h-5 w-5 text-foreground/20" />
      </div>
    </div>
    <div className="flex gap-2">
      <span className="px-2 py-1 rounded-full text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">SEO 94</span>
      <span className="px-2 py-1 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">2.8K words</span>
    </div>
  </div>
);

const MarketingTeaserMock = () => (
  <div className="space-y-3">
    <div className="px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
      <div className="text-xs font-medium text-foreground mb-1">🌿 Spring Collection Launch</div>
      <div className="text-[10px] text-muted-foreground">AI-optimized · Sends Tue 9am</div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 px-2 py-1.5 rounded text-center bg-neon-pink/10 border border-neon-pink/20">
        <Eye className="h-3 w-3 text-neon-pink mx-auto mb-0.5" />
        <span className="text-[9px] text-neon-pink">42% open</span>
      </div>
      <div className="flex-1 px-2 py-1.5 rounded text-center bg-neon-blue/10 border border-neon-blue/20">
        <MousePointerClick className="h-3 w-3 text-neon-blue mx-auto mb-0.5" />
        <span className="text-[9px] text-neon-blue">8.3% CTR</span>
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`h-5 rounded ${i === 1 || i === 4 ? 'bg-neon-pink/20 border border-neon-pink/30' : 'bg-white/[0.03] border border-white/[0.04]'}`} />
      ))}
    </div>
  </div>
);

const AudienceTeaserMock = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center text-sm font-bold text-primary-foreground">SK</div>
      <div>
        <div className="text-xs font-semibold text-foreground">Sarah Kim</div>
        <div className="text-[10px] text-muted-foreground">Engagement: 87</div>
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {['VIP', 'Newsletter', 'Eco'].map(t => (
        <span key={t} className="px-2 py-0.5 rounded-full text-[9px] bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">{t}</span>
      ))}
    </div>
    <div className="space-y-1.5">
      {[
        { text: 'Opened email', color: 'text-neon-pink', time: '2h' },
        { text: 'Clicked link', color: 'text-neon-orange', time: '2h' },
        { text: 'Viewed page', color: 'text-neon-blue', time: '1d' },
      ].map((e, i) => (
        <div key={i} className="flex items-center justify-between text-[10px]">
          <span className={`${e.color}`}>● {e.text}</span>
          <span className="text-muted-foreground/50">{e.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsTeaserMock = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Views', value: '124K', color: 'text-neon-blue' },
        { label: 'Conv.', value: '3.8K', color: 'text-green-400' },
        { label: 'Revenue', value: '$48K', color: 'text-neon-orange' },
      ].map(s => (
        <div key={s.label} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
          <div className="text-[9px] text-muted-foreground">{s.label}</div>
          <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
        </div>
      ))}
    </div>
    <div className="flex items-end gap-1 h-16">
      {[35, 42, 55, 48, 62, 70, 58, 75, 82, 88, 92, 98].map((h, i) => (
        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-neon-orange/40 to-neon-pink/20" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/15">
      <span className="text-[10px] text-foreground">ROI</span>
      <span className="text-sm font-bold text-green-400">412%</span>
    </div>
  </div>
);

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>Creaiter - One AI Conversation. Every Content Operation.</title>
        <meta name="description" content="Create content, run campaigns, manage audiences, and track performance — all from a single AI-powered conversation. Or take manual control anytime." />
        <meta property="og:title" content="Creaiter - AI-Powered Content Operating System" />
        <meta property="og:description" content="One AI conversation runs your entire content operation — writing, marketing, audience management, and analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creaiter.lovable.app" />
        <meta property="og:image" content="https://creaiter.lovable.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://creaiter.lovable.app" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />
        
        <main className="relative z-10" id="main-content">
          <section id="hero" className="scroll-mt-16">
            <LandingHero />
          </section>
          
          {/* Category Teasers — Apple-style alternating sections */}
          <CategoryTeaser
            title="Content"
            headline="Create anything. Text. Images. Video."
            description="AI-powered writing, image generation, and video creation — all learning your brand voice with every piece."
            icon={<PenTool className="h-4 w-4" />}
            route="/features/content"
            accentColor="#9b87f5"
            direction="left"
            index={0}
            mockUI={<ContentTeaserMock />}
          />
          
          <CategoryTeaser
            title="Marketing"
            headline="Marketing that runs while you sleep."
            description="Email campaigns, social publishing, and automations — powered by AI that learns what converts."
            icon={<Send className="h-4 w-4" />}
            route="/features/marketing"
            accentColor="#D946EF"
            direction="right"
            index={1}
            mockUI={<MarketingTeaserMock />}
          />
          
          <CategoryTeaser
            title="Audience"
            headline="Know every contact. Reach the right ones."
            description="Unified profiles, AI-powered segments, and real-time activity — your audience, completely understood."
            icon={<Users className="h-4 w-4" />}
            route="/features/audience"
            accentColor="#33C3F0"
            direction="left"
            index={2}
            mockUI={<AudienceTeaserMock />}
          />
          
          <CategoryTeaser
            title="Analytics"
            headline="Data-driven decisions. Not guesswork."
            description="Performance dashboards, AI insights, and ROI tracking that connect content to revenue."
            icon={<BarChart3 className="h-4 w-4" />}
            route="/features/analytics"
            accentColor="#F97316"
            direction="right"
            index={3}
            mockUI={<AnalyticsTeaserMock />}
          />
          
          <section id="ai-showcase" className="scroll-mt-16">
            <AIIntelligenceShowcase />
          </section>
          
          <section id="comparison" className="scroll-mt-16">
            <ComparisonTable />
          </section>
          
          <section id="investors" className="scroll-mt-16">
            <InvestorSection />
          </section>
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default Landing;
