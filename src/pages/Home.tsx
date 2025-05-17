
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Home | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
            Welcome to the SEO Content Platform
          </h1>
          <p className="text-xl max-w-2xl text-muted-foreground">
            Create, optimize, and manage your content with powerful AI-assisted tools
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/dashboard" className="px-6 py-3 rounded-md bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-white font-medium">
              Go to Dashboard
            </a>
            <a href="/content-builder" className="px-6 py-3 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium">
              Build New Content
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
