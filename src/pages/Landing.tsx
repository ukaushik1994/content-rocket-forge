import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { ConversationPanel } from '@/components/landing/ConversationPanel';
import { ManualToolsStrip } from '@/components/landing/ManualToolsStrip';
import { InvestorSection } from '@/components/landing/InvestorSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
  Sparkles, Image, Eye, MousePointerClick, Zap,
  ArrowUpRight
} from 'lucide-react';

/* ── Conversation Mock UIs ── */

const ContentConversationMock = () => (
  <div className="space-y-4">
    {/* User prompt */}
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary/15 border border-primary/20 px-4 py-3 text-sm text-foreground">
        Write me a product launch post
      </div>
    </div>
    {/* AI response */}
    <div className="flex gap-3 justify-start">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-neon-blue shrink-0 h-fit">
        <Sparkles className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 space-y-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-foreground">Product Launch: EcoWear SS25</div>
          <div className="h-2 rounded-full bg-foreground/10 w-full" />
          <div className="h-2 rounded-full bg-foreground/8 w-10/12" />
          <div className="h-2 rounded-full bg-foreground/6 w-8/12" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-neon-pink/10 border border-white/[0.06] flex items-center justify-center">
            <Image className="h-4 w-4 text-foreground/20" />
          </div>
          <div className="aspect-video rounded-lg bg-gradient-to-br from-neon-blue/20 to-primary/10 border border-white/[0.06] flex items-center justify-center">
            <Image className="h-4 w-4 text-foreground/20" />
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-full text-[10px] bg-green-500/10 text-green-400 border border-green-500/20">SEO 94</span>
          <span className="px-2 py-1 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">2.8K words</span>
        </div>
      </div>
    </div>
  </div>
);

const MarketingConversationMock = () => (
  <div className="space-y-4">
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neon-pink/15 border border-neon-pink/20 px-4 py-3 text-sm text-foreground">
        Launch my spring campaign
      </div>
    </div>
    <div className="flex gap-3 justify-start">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-neon-pink to-neon-orange shrink-0 h-fit">
        <Sparkles className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 space-y-3">
        <div className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
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
        {/* Automation hint */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-orange/5 border border-neon-orange/10">
          <Zap className="h-3 w-3 text-neon-orange" />
          <span className="text-[10px] text-neon-orange">3 automations activated</span>
        </div>
      </div>
    </div>
  </div>
);

const AudienceConversationMock = () => (
  <div className="space-y-4">
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neon-blue/15 border border-neon-blue/20 px-4 py-3 text-sm text-foreground">
        Who are my most engaged contacts?
      </div>
    </div>
    <div className="flex gap-3 justify-start">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-neon-blue to-primary shrink-0 h-fit">
        <Sparkles className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue to-primary flex items-center justify-center text-xs font-bold text-primary-foreground">SK</div>
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
        <div className="text-[10px] text-muted-foreground">
          <span className="text-neon-blue font-medium">2,847 contacts</span> match "high engagement" segment
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsConversationMock = () => (
  <div className="space-y-4">
    <div className="flex gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neon-orange/15 border border-neon-orange/20 px-4 py-3 text-sm text-foreground">
        How did last month perform?
      </div>
    </div>
    <div className="flex gap-3 justify-start">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-neon-orange to-neon-pink shrink-0 h-fit">
        <Sparkles className="h-3 w-3 text-primary-foreground" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 space-y-3">
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
        <div className="flex items-end gap-0.5 h-10">
          {[35, 42, 55, 48, 62, 70, 58, 75, 82, 88, 92, 98].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-neon-orange/40 to-neon-pink/20" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-green-500/5 border border-green-500/15">
          <ArrowUpRight className="h-3 w-3 text-green-400" />
          <span className="text-[10px] text-green-400 font-medium">ROI 412% — up 23% from last month</span>
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>Creaiter — Just Tell Your AI. It Handles Everything.</title>
        <meta name="description" content="Create content, run campaigns, manage audiences, and track performance — all from a single AI-powered conversation. Or take manual control anytime." />
        <meta property="og:title" content="Creaiter — AI-Powered Content Operating System" />
        <meta property="og:description" content="One AI conversation runs your entire content operation — writing, marketing, audience management, and analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creaiter.lovable.app" />
        <link rel="canonical" href="https://creaiter.lovable.app" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />
        
        <main className="relative z-10" id="main-content">
          <section id="hero" className="scroll-mt-16">
            <LandingHero />
          </section>
          
          {/* Cinematic Conversation Panels */}
          <ConversationPanel
            headline="Write. Design. Produce."
            description="AI-powered writing, image generation, and video creation — all learning your brand voice with every piece."
            mockUI={<ContentConversationMock />}
            accentColor="#9b87f5"
            direction="left"
            learnMoreRoute="/features/content"
            learnMoreLabel="Explore Content"
            index={0}
          />

          <ConversationPanel
            headline="Send. Publish. Automate."
            description="Email campaigns, social publishing, and automations — powered by AI that learns what converts."
            mockUI={<MarketingConversationMock />}
            accentColor="#D946EF"
            direction="right"
            learnMoreRoute="/features/marketing"
            learnMoreLabel="Explore Marketing"
            index={1}
          />

          <ConversationPanel
            headline="Know. Segment. Engage."
            description="Unified profiles, AI-powered segments, and real-time activity — your audience, completely understood."
            mockUI={<AudienceConversationMock />}
            accentColor="#33C3F0"
            direction="left"
            learnMoreRoute="/features/audience"
            learnMoreLabel="Explore Audience"
            index={2}
          />

          <ConversationPanel
            headline="Track. Learn. Grow."
            description="Performance dashboards, AI insights, and ROI tracking that connect content to revenue."
            mockUI={<AnalyticsConversationMock />}
            accentColor="#F97316"
            direction="right"
            learnMoreRoute="/features/analytics"
            learnMoreLabel="Explore Analytics"
            index={3}
          />

          {/* Manual Tools Strip */}
          <ManualToolsStrip />

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
