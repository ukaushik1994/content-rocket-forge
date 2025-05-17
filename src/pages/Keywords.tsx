
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';

const KeywordResearchPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Keyword Research | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Keyword Research</h1>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <p className="text-lg text-white/70">
            This page would contain keyword research functionality.
          </p>
        </div>
      </main>
    </div>
  );
};

export default KeywordResearchPage;
