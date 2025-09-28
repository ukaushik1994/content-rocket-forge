import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Search, FileSearch, Users, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { ResearchHubHero } from '@/components/research/research-hub/ResearchHubHero';
import { SimpleAIServiceIndicator } from '@/components/content-builder/ai/SimpleAIServiceIndicator';
import { SimpleSerpServiceIndicator } from '@/components/content-builder/ai/SimpleSerpServiceIndicator';

// Import tab components (without keyword library)
import { ContentGapsTab } from '@/components/research/content-strategy/tabs/ContentGapsTab';
import { PeopleQuestionsTab } from '@/components/research/research-hub/PeopleQuestionsTab';

const ResearchHub = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/research-hub` 
    : '/research/research-hub';

  const [searchMode, setSearchMode] = useState('keywords');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setHasSearched(true);
  };

  return (
    <ContentStrategyProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Helmet>
          <title>Research Hub — Unified Content Intelligence Platform</title>
          <meta name="description" content="Comprehensive research workspace with keyword intelligence, content gaps analysis, people questions, and content pipeline management." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        
        <Navbar />
        
        {/* Service Status Indicators */}
        <div className="relative z-20 flex justify-center pt-4 pb-2">
          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-sm">
            <SimpleAIServiceIndicator size="sm" />
            <SimpleSerpServiceIndicator size="sm" />
          </div>
        </div>
        
        {/* Animated Background - matching Repository design */}
        <AnimatedBackground intensity="medium" />
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ResearchHubHero />

            {/* Unified Search Interface */}
            <GlassCard className="p-6">
              <div className="space-y-6">
                {/* Search Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Research & Analysis</h2>
                  <p className="text-muted-foreground">Discover keywords, identify content gaps, and analyze audience questions</p>
                </div>

                {/* Search Interface */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={searchMode} onValueChange={setSearchMode}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keywords">
                          <div className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Keywords
                          </div>
                        </SelectItem>
                        <SelectItem value="content-gaps">
                          <div className="flex items-center gap-2">
                            <FileSearch className="h-4 w-4" />
                            Content Gaps
                          </div>
                        </SelectItem>
                        <SelectItem value="people-questions">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            People Questions
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder={
                          searchMode === 'keywords' ? 'Enter keyword to research...' :
                          searchMode === 'content-gaps' ? 'Enter topic to find content gaps...' :
                          'Enter topic to find questions...'
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                      />
                      <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                {hasSearched && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-6 border-t border-border/50"
                  >
                    {searchMode === 'keywords' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Search className="h-5 w-5 text-primary" />
                          Keyword Research Results for "{searchTerm}"
                        </h3>
                        <p className="text-muted-foreground">
                          SERP analysis and keyword intelligence will be displayed here. 
                          <span className="text-sm block mt-1">Note: Full keyword analysis moved to dedicated Keywords page under Content menu.</span>
                        </p>
                      </div>
                    )}
                    
                    {searchMode === 'content-gaps' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <FileSearch className="h-5 w-5 text-primary" />
                          Content Gap Analysis for "{searchTerm}"
                        </h3>
                        <ContentGapsTab goals={{ monthlyTraffic: '', contentPieces: '', timeline: '3 months', mainKeyword: searchTerm }} />
                      </div>
                    )}
                    
                    {searchMode === 'people-questions' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          People Questions for "{searchTerm}"
                        </h3>
                        <PeopleQuestionsTab />
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default ResearchHub;