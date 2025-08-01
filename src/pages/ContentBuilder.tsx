
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { ContentBuilder } from '@/components/content-builder/ContentBuilder';
import { ContentBuilderProvider } from '@/contexts/content-builder/ContentBuilderContext';
import { Helmet } from 'react-helmet-async';

const ContentBuilderPage = () => {
  const location = useLocation();
  const preloadData = location.state;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Content Builder | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <ContentBuilderProvider>
          <ContentBuilder 
            initialKeyword={preloadData?.mainKeyword}
            selectedKeywords={preloadData?.selectedKeywords}
            location={preloadData?.location}
            serpData={preloadData?.serpData}
            initialStep={preloadData?.step}
          />
        </ContentBuilderProvider>
      </main>
    </div>
  );
};

export default ContentBuilderPage;
