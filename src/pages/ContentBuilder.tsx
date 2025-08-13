
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { ContentBuilder } from '@/components/content-builder/ContentBuilder';
import { ContentBuilderProvider } from '@/contexts/content-builder/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';

const ContentBuilderPage = () => {
  const location = useLocation();
  const preloadData = location.state;

  // Support handoff from Strategy Engine via sessionStorage
  let payload: any = null;
  try {
    const payloadStr = typeof window !== 'undefined' ? sessionStorage.getItem('contentBuilderPayload') : null;
    if (payloadStr) {
      payload = JSON.parse(payloadStr);
      // Clear after reading to avoid stale reuse
      sessionStorage.removeItem('contentBuilderPayload');
    }
  } catch {}

  // Derive initial props from payload with safe fallbacks
  const initialKeyword = payload?.primary_keyword || payload?.main_keyword || payload?.keyword || preloadData?.mainKeyword;
  const selectedKeywords = Array.isArray(payload?.keywords)
    ? payload.keywords.map((k: any) => (typeof k === 'string' ? k : k.kw || k.keyword)).filter(Boolean)
    : preloadData?.selectedKeywords;
  const locationPref = payload?.location || preloadData?.location;
  const serpData = payload?.serp_data || null;
  const initialStep = typeof payload?.initial_step === 'number' ? payload.initial_step : preloadData?.step;
  
  // Enhanced strategy context handling
  const strategyContext = payload?.strategy_context || null;
  const metaSuggestions = payload?.meta_suggestions || null;
  const suggestedTitle = payload?.title || null;
  const suggestedOutline = payload?.outline || null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Builder | SEO Platform</title>
        <meta name="description" content={initialKeyword ? `Build content for ${initialKeyword} with SERP-aware outline and SEO.` : 'AI-powered content builder with SERP analysis and SEO optimization.'} />
        <link rel="canonical" href={typeof window !== 'undefined' ? `${window.location.origin}/content-builder` : '/content-builder'} />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 py-8">
        <ContentBuilderProvider>
          <ContentBuilder 
            initialKeyword={initialKeyword}
            selectedKeywords={selectedKeywords}
            location={locationPref}
            serpData={serpData}
            initialStep={initialStep}
            strategyContext={strategyContext}
            metaSuggestions={metaSuggestions}
            suggestedTitle={suggestedTitle}
            suggestedOutline={suggestedOutline}
          />
        </ContentBuilderProvider>
      </main>
    </div>
  );
};

export default ContentBuilderPage;
