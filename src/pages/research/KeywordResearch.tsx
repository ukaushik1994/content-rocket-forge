
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Target, BarChart3, Plus, Sparkles, Zap, Filter, Download, Bookmark, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { useNavigate } from 'react-router-dom';
import { KeywordSearchInterface } from '@/components/research/keyword/KeywordSearchInterface';
import { SerpResultsDisplay } from '@/components/research/keyword/SerpResultsDisplay';
import { KeywordMetrics } from '@/components/research/keyword/KeywordMetrics';
import { ContentOpportunities } from '@/components/research/keyword/ContentOpportunities';
import { KeywordClusters } from '@/components/research/keyword/KeywordClusters';

const KeywordResearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serpData, setSerpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedKeywords, setSavedKeywords] = useState([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const navigate = useNavigate();

  const steps = ['Search', 'Analysis', 'Results', 'Content'];

  const handleKeywordSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a keyword to research");
      return;
    }

    setLoading(true);
    setAnalysisStep(1);
    
    try {
      // Animate through steps
      setTimeout(() => setAnalysisStep(2), 1500);
      
      const data = await analyzeKeywordSerp(searchTerm);
      setSerpData(data);
      
      setTimeout(() => setAnalysisStep(3), 500);
      toast.success("Keyword analysis completed!");
    } catch (error) {
      toast.error("Failed to analyze keyword");
      console.error(error);
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

    // Navigate to content builder with SERP data
    navigate('/content-builder', {
      state: {
        mainKeyword: searchTerm,
        serpData: serpData,
        step: 1
      }
    });
  };

  const handleSaveKeyword = (keyword) => {
    if (!savedKeywords.find(k => k.keyword === keyword.keyword)) {
      setSavedKeywords([...savedKeywords, keyword]);
      toast.success("Keyword saved to your list!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Keyword Research | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute bottom-40 left-1/2 w-64 h-64 bg-neon-purple/10 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                className="p-3 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="h-8 w-8 text-primary" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-bold text-gradient bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Keyword Research
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover high-performing keywords with real-time SERP analysis, competitor insights, and AI-powered content opportunities
            </p>
          </motion.div>

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
                  <TabsList className="grid w-full grid-cols-6 bg-glass border border-white/10">
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
                      Clusters
                    </TabsTrigger>
                    <TabsTrigger value="competitors" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Competitors
                    </TabsTrigger>
                    <TabsTrigger value="content" className="flex items-center gap-2">
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

                  <TabsContent value="competitors">
                    <div className="grid gap-6">
                      {serpData?.topResults?.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="glass-panel border-white/10 hover:border-primary/30 transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="outline" className="bg-primary/10">
                                      #{result.position}
                                    </Badge>
                                    <h3 className="font-semibold text-lg">{result.title}</h3>
                                  </div>
                                  <p className="text-muted-foreground mb-3">{result.snippet}</p>
                                  <p className="text-sm text-primary">{new URL(result.link).hostname}</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  Analyze
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="content">
                    <Card className="glass-panel border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-5 w-5 text-primary" />
                          Create Content from Research
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={handleCreateContent}>
                              <CardContent className="p-6 text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Target className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Blog Post</h3>
                                <p className="text-sm text-muted-foreground">Create comprehensive blog content</p>
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
                                <p className="text-sm text-muted-foreground">Build high-converting pages</p>
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
                                <p className="text-sm text-muted-foreground">Answer common questions</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                        
                        <div className="text-center">
                          <Button onClick={handleCreateContent} size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:from-blue-500 hover:to-primary">
                            <Plus className="h-5 w-5 mr-2" />
                            Start Content Creation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saved Keywords */}
          {savedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5 text-primary" />
                      Saved Keywords ({savedKeywords.length})
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {savedKeywords.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="outline" className="text-sm p-2 bg-primary/5">
                          {keyword.keyword}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default KeywordResearch;
