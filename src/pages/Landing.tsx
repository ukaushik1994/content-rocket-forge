import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { ValuePropositions } from '@/components/landing/ValuePropositions';
import { FeaturesCarousel } from '@/components/landing/FeaturesCarousel';

import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { InvestorSection } from '@/components/landing/InvestorSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { AIIntelligenceShowcase } from '@/components/landing/AIIntelligenceShowcase';
import { IntegrationsHub } from '@/components/landing/IntegrationsHub';
import { PerformanceSection } from '@/components/landing/PerformanceSection';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>Creaiter - The Self-Learning Content Engine That Gets Smarter With Every Post</title>
        <meta name="description" content="Not just AI content creation. Creaiter learns from YOUR results, adapts to YOUR audience, and creates content that gets exponentially better over time. Be among the first creators with personalized AI engines." />
        <meta name="keywords" content="AI content creation, SERP data, keyword research, content strategy, self-learning AI, business content" />
        <meta property="og:title" content="Creaiter - AI-Powered Content Creation Platform" />
        <meta property="og:description" content="The self-learning content engine that gets smarter with every post. AI-powered content creation with team collaboration and enterprise-grade features." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creaiter.lovable.app" />
        <meta property="og:image" content="https://creaiter.lovable.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://creaiter.lovable.app/og-image.png" />
        <link rel="canonical" href="https://creaiter.com" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />
        
        <main className="relative z-10" id="main-content">
          <section id="hero" className="scroll-mt-16">
            <LandingHero />
          </section>
          
          <section id="problem" className="scroll-mt-16">
            <ProblemSolution />
          </section>
          
          <section id="value" className="scroll-mt-16">
            <ValuePropositions />
          </section>
          
          <section id="ai-showcase" className="scroll-mt-16">
            <AIIntelligenceShowcase />
          </section>
          
          <section id="features" className="scroll-mt-16">
            <FeaturesCarousel />
          </section>
          
          <section id="comparison" className="scroll-mt-16">
            <ComparisonTable />
          </section>
          
          <section id="performance" className="scroll-mt-16">
            <PerformanceSection />
          </section>
          
          <section id="integrations" className="scroll-mt-16">
            <IntegrationsHub />
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