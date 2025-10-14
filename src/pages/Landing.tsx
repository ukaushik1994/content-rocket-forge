import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { ProblemSolution } from '@/components/landing/ProblemSolution';
import { ValuePropositions } from '@/components/landing/ValuePropositions';
import { FeaturesCarousel } from '@/components/landing/FeaturesCarousel';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { InvestorSection } from '@/components/landing/InvestorSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { SectionSeparator } from '@/components/ui/SectionSeparator';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>CreAiter - The Self-Learning Content Engine That Gets Smarter With Every Post</title>
        <meta name="description" content="Not just AI content creation. CreAiter learns from YOUR results, adapts to YOUR audience, and creates content that gets exponentially better over time. Be among the first creators with personalized AI engines." />
        <meta name="keywords" content="AI content creation, SERP data, keyword research, content strategy, self-learning AI, business content" />
        <meta property="og:title" content="CreAiter - AI-Powered Content Creation Platform" />
        <meta property="og:description" content="Scale your content creation with AI-powered tools, real-time SERP integration, and intelligent keyword research." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://creaiter.com" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <LandingNavbar />
        
        <main className="relative z-10" id="main-content">
          <section id="hero" className="scroll-mt-16">
            <LandingHero />
          </section>
          
          <SectionSeparator />
          
          <section className="scroll-mt-16">
            <ProblemSolution />
          </section>
          
          <SectionSeparator />
          
          <section id="features" className="py-8 scroll-mt-16">
            <FeaturesCarousel />
          </section>
          
          <SectionSeparator />
          
          <section id="how-it-works" className="py-8 scroll-mt-16">
            <HowItWorks />
          </section>
          
          <SectionSeparator />
          
          <section className="py-8 scroll-mt-16">
            <ComparisonTable />
          </section>
          
          <SectionSeparator />
          
          <section className="py-8 scroll-mt-16">
            <ValuePropositions />
          </section>
          
          <SectionSeparator />
          
          <section id="investors" className="py-8 scroll-mt-16">
            <InvestorSection />
          </section>
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default Landing;