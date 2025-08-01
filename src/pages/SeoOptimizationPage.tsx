
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoOptimizationProvider } from '@/contexts/SeoOptimizationContext';
import { ContentAnalyzer } from '@/components/seo-tools/ContentAnalyzer';
import { SeoScoreBoard } from '@/components/seo-tools/SeoScoreBoard';
import { RecommendationEngine } from '@/components/seo-tools/RecommendationEngine';
import { Search, TrendingUp } from 'lucide-react';

const SeoOptimizationPage = () => {
  return (
    <>
      <Helmet>
        <title>SEO Optimization Tools - AI Content Assistant</title>
        <meta name="description" content="Analyze and optimize your content for better SEO performance with AI-powered recommendations and real-time scoring." />
      </Helmet>
      
      <SeoOptimizationProvider>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SEO Optimization Tools
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Analyze your content with AI-powered insights and get actionable recommendations to boost your search rankings.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Content Input */}
              <div className="xl:col-span-2">
                <ContentAnalyzer />
                <div className="mt-6">
                  <RecommendationEngine />
                </div>
              </div>
              
              {/* Right Column - Score & Analysis */}
              <div className="xl:col-span-1">
                <SeoScoreBoard />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-card border">
                <TrendingUp className="h-8 w-8 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Real-time Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant SEO scores and recommendations as you type or paste content.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border">
                <Search className="h-8 w-8 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms analyze readability, keyword density, and content structure.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg bg-card border">
                <TrendingUp className="h-8 w-8 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-semibold mb-2">One-Click Fixes</h3>
                <p className="text-sm text-muted-foreground">
                  Apply AI-generated improvements with a single click and see instant results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SeoOptimizationProvider>
    </>
  );
};

export default SeoOptimizationPage;
