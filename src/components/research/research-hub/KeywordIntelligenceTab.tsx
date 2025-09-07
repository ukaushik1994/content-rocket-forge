import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Target, BarChart3, Plus, Sparkles, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import existing keyword research components
import { KeywordSearchInterface } from '@/components/research/keyword/KeywordSearchInterface';
import { SerpResultsDisplay } from '@/components/research/keyword/SerpResultsDisplay';
import { KeywordMetrics } from '@/components/research/keyword/KeywordMetrics';
import { ContentOpportunities } from '@/components/research/keyword/ContentOpportunities';
import { KeywordClusters } from '@/components/research/keyword/KeywordClusters';
import { EnhancedEmbeddedKeywordLibrary } from '@/components/research/keyword/EnhancedEmbeddedKeywordLibrary';

// Import services
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { keywordLibraryService } from '@/services/keywordLibraryService';

export const KeywordIntelligenceTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serpData, setSerpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedKeywords, setSavedKeywords] = useState([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [realTimeData, setRealTimeData] = useState(false);
  const [libraryRefreshTrigger, setLibraryRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  const steps = ['Search', 'SERP Analysis', 'Content Intelligence', 'Content Creation'];

  const handleKeywordSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setLoading(true);
    setAnalysisStep(1);
    setRealTimeData(false);
    
    try {
      toast.info("Analyzing SERP data...");
      setTimeout(() => setAnalysisStep(2), 1000);
      
      const data = await analyzeKeywordSerp(searchTerm, true);
      
      if (data && data.isGoogleData) {
        setSerpData(data);
        setRealTimeData(true);
        setTimeout(() => setAnalysisStep(3), 500);
        
        toast.success("✅ Real-time SERP analysis completed!", {
          description: `Found ${data.topResults?.length || 0} organic results, ${data.peopleAlsoAsk?.length || 0} PAA questions`
        });
      } else {
        toast.warning("⚠️ Using estimated data - add your SERP API key for real-time results");
        setSerpData(data);
      }
    } catch (error) {
      toast.error("Failed to analyze keyword");
      console.error('SERP Analysis Error:', error);
      setAnalysisStep(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    if (!serpData) {
      toast.error("No SERP data available for content creation");
      return;
    }

    navigate('/content-builder', {
      state: {
        mainKeyword: searchTerm,
        serpData: serpData,
        selectedKeywords: selectedKeywords,
        contentOpportunities: serpData.contentGaps,
        serpFeatures: {
          peopleAlsoAsk: serpData.peopleAlsoAsk,
          relatedSearches: serpData.relatedSearches,
          topResults: serpData.topResults,
          entities: serpData.entities
        },
        step: 1
      }
    });

    toast.success("🚀 Launching Content Builder with SERP insights!");
  };

  const handleSaveKeyword = async (keyword) => {
    try {
      await keywordLibraryService.upsertKeywordWithSerpData(
        keyword.keyword || searchTerm,
        {
          searchVolume: keyword.searchVolume || serpData?.searchVolume,
          difficulty: keyword.difficulty || serpData?.difficulty,
          competitionScore: serpData?.competitionScore,
          cpc: serpData?.cpc,
          intent: serpData?.intent,
          trend: serpData?.trend,
          dataQuality: realTimeData ? 'high' : 'medium'
        },
        'research'
      );
      
      setLibraryRefreshTrigger(prev => prev + 1);
      
      if (!savedKeywords.find(k => k.keyword === keyword.keyword)) {
        setSavedKeywords([...savedKeywords, keyword]);
      }
      
      toast.success("📌 Keyword saved to your library with SERP metrics!");
    } catch (error) {
      toast.error("Failed to save keyword");
      console.error('Error saving keyword:', error);
    }
  };

  // Auto-save researched keywords with enhanced SERP data
  useEffect(() => {
    if (serpData && searchTerm) {
      handleSaveKeyword({
        keyword: searchTerm,
        searchVolume: serpData.searchVolume,
        difficulty: serpData.difficulty
      });
    }
  }, [serpData, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Enhanced Description */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          Real-Time SERP Research
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover high-performing keywords with live Google SERP analysis, AI-powered content opportunities, and instant content creation
        </p>
        
        {/* Data Quality Indicator */}
        {serpData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2"
          >
            {realTimeData ? (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Live SERP Data
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-2" />
                Estimated Data
              </Badge>
            )}
          </motion.div>
        )}
      </div>

      {/* Progress Indicator */}
      {analysisStep > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index < analysisStep 
                    ? 'bg-primary border-primary text-white' 
                    : index === analysisStep 
                    ? 'border-primary text-primary animate-pulse' 
                    : 'border-muted text-muted-foreground'
                }`}>
                  {index < analysisStep ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= analysisStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Interface */}
      <KeywordSearchInterface
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleKeywordSearch}
        loading={loading}
        onCreateContent={handleCreateContent}
        hasResults={!!serpData}
      />

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {serpData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-background/60 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="serp" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  SERP Analysis
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="clusters" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Intent Clusters
                </TabsTrigger>
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Content
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <KeywordMetrics 
                  serpData={serpData}
                  keyword={searchTerm}
                  onSaveKeyword={handleSaveKeyword}
                />
              </TabsContent>

              <TabsContent value="serp">
                <SerpResultsDisplay 
                  serpData={serpData}
                  onSelectKeywords={setSelectedKeywords}
                  selectedKeywords={selectedKeywords}
                />
              </TabsContent>

              <TabsContent value="opportunities">
                <ContentOpportunities 
                  serpData={serpData}
                  keyword={searchTerm}
                  onCreateContent={handleCreateContent}
                />
              </TabsContent>

              <TabsContent value="clusters">
                <KeywordClusters 
                  serpData={serpData}
                  onSelectKeywords={setSelectedKeywords}
                />
              </TabsContent>

              <TabsContent value="create">
                <Card className="bg-background/60 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Create Content from SERP Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCreateContent}>
                          <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Target className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">SEO Blog Post</h3>
                            <p className="text-sm text-muted-foreground">Create comprehensive blog content with SERP insights</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCreateContent}>
                          <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BarChart3 className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Landing Page</h3>
                            <p className="text-sm text-muted-foreground">Build high-converting pages with competitor analysis</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCreateContent}>
                          <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Sparkles className="h-6 w-6 text-purple-500" />
                            </div>
                            <h3 className="font-semibold mb-2">FAQ Content</h3>
                            <p className="text-sm text-muted-foreground">Answer People Also Ask questions</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                    
                    {/* SERP Integration Summary */}
                    <div className="bg-background/40 backdrop-blur-sm border border-border/50 rounded-lg p-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Your SERP Research Summary
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Questions Found:</span>
                          <div className="font-semibold text-blue-400">{serpData.peopleAlsoAsk?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Content Gaps:</span>
                          <div className="font-semibold text-purple-400">{serpData.contentGaps?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Related Keywords:</span>
                          <div className="font-semibold text-green-400">{serpData.relatedSearches?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Top Competitors:</span>
                          <div className="font-semibold text-orange-400">{serpData.topResults?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Keyword Library */}
      <div className="mt-12">
        <EnhancedEmbeddedKeywordLibrary
          refreshTrigger={libraryRefreshTrigger}
          onKeywordSelect={(keyword) => {
            setSearchTerm(typeof keyword === 'string' ? keyword : keyword.keyword);
            handleKeywordSearch();
          }}
        />
      </div>
    </div>
  );
};