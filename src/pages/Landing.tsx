import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { LandingHero } from '@/components/landing/LandingHero';
import { ValuePropositions } from '@/components/landing/ValuePropositions';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SocialProof } from '@/components/landing/SocialProof';
import { LandingFooter } from '@/components/landing/LandingFooter';

const Landing = () => {
  return (
    <>
      <Helmet>
        <title>CreAiter - Where Creativity Meets AI Intelligence</title>
        <meta name="description" content="Generate high-ranking, conversion-driven content by integrating real-time SERP data, keyword clusters, and business solutions. Join thousands of creators scaling their content with AI." />
        <meta name="keywords" content="AI content creation, SERP data, keyword research, content strategy, influencer marketing, business content" />
        <meta property="og:title" content="CreAiter - AI-Powered Content Creation Platform" />
        <meta property="og:description" content="Scale your content creation with AI-powered tools, real-time SERP integration, and intelligent keyword research." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://creaiter.com" />
      </Helmet>

      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        
        <main className="relative z-10">
          <LandingHero />
          <ValuePropositions />
          <FeaturesShowcase />
          <HowItWorks />
          <SocialProof />
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default Landing;