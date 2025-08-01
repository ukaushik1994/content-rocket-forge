import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Globe, Target, CheckCircle, MapPin, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { useNavigate } from 'react-router-dom';
import { SerpResultsDisplay } from '@/components/research/keyword/SerpResultsDisplay';

const AioGeo = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [serpData, setSerpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [realTimeData, setRealTimeData] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const navigate = useNavigate();

  const geoKeywordSuggestions = keyword && location ? [
    `${keyword} near ${location}`,
    `${location} ${keyword} services`,
    `best ${keyword} in ${location}`,
    `${keyword} ${location} reviews`,
    `top ${keyword} ${location}`,
    `${location} ${keyword} directory`,
    `local ${keyword} ${location}`,
    `${keyword} shops in ${location}`
  ] : [];

  const handleAnalyse = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a target keyword");
      return;
    }

    setLoading(true);
    setRealTimeData(false);
    
    try {
      toast.info("Analyzing keyword for AI and GEO optimization...");
      
      const data = await analyzeKeywordSerp(keyword, true);
      
      if (data && data.isGoogleData) {
        setSerpData(data);
        setRealTimeData(true);
        toast.success("Analysis complete! Real-time SERP data loaded.");
      } else {
        setSerpData(data);
        setRealTimeData(false);
        toast.warning("Using estimated data - configure SERP API for real-time analysis");
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error("Analysis failed - please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleStartContentBuilder = () => {
    if (!serpData) {
      toast.error("Please run analysis first");
      return;
    }

    const allKeywords = [keyword, ...selectedKeywords, ...geoKeywordSuggestions.slice(0, 3)];
    
    navigate('/content-builder', {
      state: {
        mainKeyword: keyword,
        serpData: serpData,
        selectedKeywords: allKeywords,
        location: location,
        step: 1
      }
    });
  };

  const geoOptimizationChecklist = [
    {
      title: "Focus on User Intent",
      description: "Target semantic keywords that match how people naturally search"
    },
    {
      title: "Use Long-tail Queries", 
      description: "Optimize for specific, location-based search phrases"
    },
    {
      title: "Structure Content Clearly",
      description: "Use headings, lists, and tables for better AI understanding"
    },
    {
      title: "Optimize Technical SEO",
      description: "Ensure fast page speed and implement schema markup"
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>AIO/GEO Content | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent"
            >
              AIO/GEO Content Optimisation
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Combine AI-powered keyword analysis with geo-targeted SEO to create content that ranks in AI search results and captures local intent.
            </motion.p>
          </div>

          {/* Analysis Interface */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Keyword & Location Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Keyword</label>
                    <Input
                      placeholder="e.g., coffee shop, dentist, restaurant"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Location</label>
                    <Input
                      placeholder="e.g., Seattle, California, London"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAnalyse}
                  disabled={loading}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analyze for AIO/GEO
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Display */}
          <AnimatePresence>
            {serpData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* SERP Results Summary */}
                <Card className="bg-card/50 backdrop-blur border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        SERP Analysis Results
                      </CardTitle>
                      <Badge variant={realTimeData ? "default" : "secondary"}>
                        {realTimeData ? "Real-time Data" : "Estimated Data"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SerpResultsDisplay 
                      serpData={serpData}
                      onSelectKeywords={setSelectedKeywords}
                      selectedKeywords={selectedKeywords}
                    />
                  </CardContent>
                </Card>

                {/* GEO Keyword Suggestions */}
                {geoKeywordSuggestions.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        GEO-Targeted Keyword Suggestions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Location-specific keywords optimized for AI search and natural language queries
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {geoKeywordSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-white/10"
                          >
                            <TrendingUp className="h-4 w-4 text-green-400" />
                            <span className="text-sm">{suggestion}</span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Start Content Builder */}
                <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Ready to Create Content?</h3>
                        <p className="text-muted-foreground">
                          Start the content builder with your analysis data pre-loaded
                        </p>
                      </div>
                      <Button 
                        onClick={handleStartContentBuilder}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
                      >
                        Start Content Builder
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GEO Optimization Checklist */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  GEO Optimization Best Practices
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Follow these principles to maximize your content's performance in AI-powered search engines
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {geoOptimizationChecklist.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 p-4 bg-background/50 rounded-lg border border-white/10"
                    >
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AioGeo;