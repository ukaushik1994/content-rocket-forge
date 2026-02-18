import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { ContentShowcase } from '@/components/landing/ContentShowcase';
import { MarketingShowcase } from '@/components/landing/MarketingShowcase';
import { AudienceShowcase } from '@/components/landing/AudienceShowcase';
import { AnalyticsShowcase } from '@/components/landing/AnalyticsShowcase';
import { AIIntelligenceShowcase } from '@/components/landing/AIIntelligenceShowcase';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { InvestorSection } from '@/components/landing/InvestorSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>Creaiter - One AI Conversation. Every Content Operation.</title>
        <meta name="description" content="Create content, run campaigns, manage audiences, and track performance — all from a single AI-powered conversation. Or take manual control anytime." />
        <meta name="keywords" content="AI content creation, AI chat, content marketing, email campaigns, audience CRM, analytics, image generation, video generation" />
        <meta property="og:title" content="Creaiter - AI-Powered Content Operating System" />
        <meta property="og:description" content="One AI conversation runs your entire content operation — writing, marketing, audience management, and analytics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creaiter.lovable.app" />
        <meta property="og:image" content="https://creaiter.lovable.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://creaiter.lovable.app/og-image.png" />
        <link rel="canonical" href="https://creaiter.lovable.app" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />
        
        <main className="relative z-10" id="main-content">
          <section id="hero" className="scroll-mt-16">
            <LandingHero />
          </section>
          
          <section id="content" className="scroll-mt-16">
            <ContentShowcase />
          </section>
          
          <section id="marketing" className="scroll-mt-16">
            <MarketingShowcase />
          </section>
          
          <section id="audience" className="scroll-mt-16">
            <AudienceShowcase />
          </section>
          
          <section id="analytics" className="scroll-mt-16">
            <AnalyticsShowcase />
          </section>
          
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
