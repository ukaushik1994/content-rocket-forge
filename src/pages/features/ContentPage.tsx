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
  PenTool, Image, Video, Search, Brain, Target, FileText,
  Sparkles, TrendingUp, Layers, CheckCircle2, BarChart3, Calendar
} from 'lucide-react';

/* ── Mock UIs ── */
const WriterMockUI = () => (
  <div className="space-y-4">
    {/* Title */}
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground/50 font-mono uppercase tracking-wider">Blog Post</div>
      <div className="text-xl font-bold text-foreground">10 Sustainable Fashion Trends Reshaping 2025</div>
    </div>
    {/* Editor lines */}
    <div className="space-y-2.5">
      <div className="h-3 rounded-full bg-foreground/10 w-full" />
      <div className="h-3 rounded-full bg-foreground/10 w-11/12" />
      <div className="h-3 rounded-full bg-foreground/8 w-9/12" />
      <div className="h-3 rounded-full bg-foreground/6 w-10/12" />
    </div>
    {/* SERP Score */}
    <div className="flex items-center gap-4 pt-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
        <TrendingUp className="h-3.5 w-3.5 text-green-400" />
        <span className="text-xs font-semibold text-green-400">SEO 94/100</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">2,847 words</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
        <Brain className="h-3.5 w-3.5 text-neon-blue" />
        <span className="text-xs font-semibold text-neon-blue">AI Optimized</span>
      </div>
    </div>
    {/* Typing cursor animation */}
    <div className="flex items-center gap-1 pt-1">
      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
      <span className="text-xs text-primary/70">AI writing...</span>
      <div className="w-0.5 h-4 bg-primary animate-pulse" />
    </div>
  </div>
);

const ImageGenMockUI = () => (
  <div className="space-y-4">
    {/* Prompt bar */}
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <Sparkles className="h-4 w-4 text-neon-pink shrink-0" />
      <span className="text-sm text-muted-foreground">"A minimalist product photo of eco-friendly sneakers..."</span>
    </div>
    {/* Image grid */}
    <div className="grid grid-cols-2 gap-3">
      {['from-primary/30 to-neon-pink/20', 'from-neon-blue/30 to-primary/20', 'from-neon-pink/30 to-neon-orange/20', 'from-neon-orange/20 to-neon-blue/30'].map((gradient, i) => (
        <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center border border-white/[0.06]`}>
          <Image className="h-8 w-8 text-foreground/20" />
        </div>
      ))}
    </div>
    {/* Style selector */}
    <div className="flex gap-2">
      {['Photorealistic', 'Illustration', 'Minimal'].map((style, i) => (
        <span
          key={style}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
            i === 0 ? 'bg-neon-pink/15 border-neon-pink/30 text-neon-pink' : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground'
          }`}
        >
          {style}
        </span>
      ))}
    </div>
  </div>
);

const VideoGenMockUI = () => (
  <div className="space-y-4">
    {/* Video preview */}
    <div className="relative aspect-video rounded-xl bg-gradient-to-br from-neon-orange/20 via-neon-pink/15 to-primary/20 border border-white/[0.06] flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
        >
          <Video className="h-7 w-7 text-foreground" />
        </motion.div>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-3 left-3 right-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          animate={{ width: ['0%', '65%'] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="h-full rounded-full bg-gradient-to-r from-neon-orange to-neon-pink"
        />
      </div>
    </div>
    {/* Meta */}
    <div className="flex items-center gap-3">
      <span className="px-3 py-1.5 rounded-lg bg-neon-orange/10 border border-neon-orange/20 text-xs font-semibold text-neon-orange">4K</span>
      <span className="px-3 py-1.5 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-xs font-semibold text-neon-pink">00:45</span>
      <span className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">AI Generated</span>
    </div>
  </div>
);

const StrategyMockUI = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Keyword Research */}
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Keyword Research</span>
      </div>
      {[
        { kw: 'sustainable fashion', vol: '12.4K', diff: 34 },
        { kw: 'eco clothing brands', vol: '8.2K', diff: 28 },
        { kw: 'ethical fashion 2025', vol: '5.1K', diff: 19 },
      ].map((row) => (
        <div key={row.kw} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-muted-foreground">{row.kw}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neon-blue font-medium">{row.vol}</span>
            <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-green-400" style={{ width: `${row.diff}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Content Calendar */}
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-neon-pink" />
        <span className="text-sm font-semibold text-foreground">Content Pipeline</span>
      </div>
      {[
        { title: 'Sustainable Fashion Guide', status: 'Writing', color: 'text-primary bg-primary/10' },
        { title: 'Eco Brand Comparison', status: 'Review', color: 'text-neon-orange bg-neon-orange/10' },
        { title: 'Interview: Green Designer', status: 'Scheduled', color: 'text-green-400 bg-green-400/10' },
      ].map((item) => (
        <div key={item.title} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-muted-foreground">{item.title}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
        </div>
      ))}
    </div>
  </div>
);

const ContentPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <>
      <Helmet>
        <title>Content Creation — Creaiter</title>
        <meta name="description" content="AI-powered content creation: write blog posts, generate images & videos, research keywords, and plan strategy — all from one conversation." />
        <link rel="canonical" href="https://creaiter.lovable.app/features/content" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />

        <main className="relative z-10">
          <FeaturePageHero
            badge="Content Suite"
            badgeIcon={<PenTool className="h-4 w-4" />}
            headline="Create Anything."
            highlightedText="Text. Images. Video."
            subtitle="Your AI writes, designs, and produces — learning your brand voice with every piece it creates."
            gradientFrom="#9b87f5"
            gradientTo="#D946EF"
            orbColorA="#9b87f5"
            orbColorB="#D946EF"
            secondaryCTA="Explore content tools"
            secondaryRoute="/auth?mode=signup"
          />

          <FeatureSection
            headline="Writing that outranks. Automatically."
            description="SERP-powered AI writing that analyzes top-ranking content, learns your tone, and produces optimized articles that climb search results."
            features={['SERP Analysis', 'Competitor Research', 'Tone Matching', 'Auto-Optimization', 'Multi-format']}
            mockUI={<WriterMockUI />}
            direction="left"
            accentColor="#9b87f5"
          />

          <FeatureSection
            headline="From prompt to production-ready visuals."
            description="Generate stunning images with AI. Multiple styles, instant variations, upscaling, and inpainting — no design skills required."
            features={['Text-to-Image', 'Style Transfer', 'Inpainting', 'Upscaling', 'Brand Consistency']}
            mockUI={<ImageGenMockUI />}
            direction="right"
            accentColor="#D946EF"
          />

          <FeatureSection
            headline="Video content, without the production team."
            description="Transform text into professional videos. AI handles scripting, visuals, and editing — you just describe what you need."
            features={['Text-to-Video', '4K Resolution', 'AI Editing', 'Multiple Formats', 'Auto-Captions']}
            mockUI={<VideoGenMockUI />}
            direction="left"
            accentColor="#F97316"
          />

          {/* Full-width Strategy section */}
          <section className="py-24 md:py-32 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                  Strategy that drives
                  <br />
                  <span className="bg-gradient-to-r from-primary to-neon-blue bg-clip-text text-transparent">every piece of content.</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  AI-powered keyword research, content calendars, and competitive analysis — all working together.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-15 bg-gradient-to-r from-primary to-neon-blue pointer-events-none" />
                <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8">
                  <StrategyMockUI />
                </div>
              </motion.div>

              {/* AI Strategy Coach */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex justify-center mt-10"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">AI Strategy Coach — analyzes your market and recommends what to create next</span>
                </div>
              </motion.div>
            </div>
          </section>

          <AIChatCTA
            chatPrompt="Write me a 2,000-word blog post about sustainable fashion trends, optimize it for SEO, and generate a hero image..."
            secondaryLabel="Explore content tools"
            accentColor="#9b87f5"
          />
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default ContentPage;
