import React, { useState, useEffect } from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Globe, Lightbulb, FileText, Loader2, Sparkles, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TermDiscoveryStep = () => {
  const { state, dispatch, analyzeDomain, suggestTopicTerms } = useGlossaryBuilder();
  const { activeMode, isAnalyzing, suggestedTerms, lastError } = state;

  const [domainUrl, setDomainUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [manualTerms, setManualTerms] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Mark step as completed when we have suggested terms
  useEffect(() => {
    if (suggestedTerms.length > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
    }
  }, [suggestedTerms, dispatch]);

  const handleAnalyzeDomain = async () => {
    if (domainUrl.trim()) {
      dispatch({ type: 'SET_ACTIVE_MODE', payload: 'domain' });
      await analyzeDomain(domainUrl);
    }
  };

  const handleSuggestTerms = async () => {
    if (topic.trim()) {
      dispatch({ type: 'SET_ACTIVE_MODE', payload: 'topic' });
      await suggestTopicTerms(topic);
    }
  };

  const handleManualSubmit = () => {
    const terms = manualTerms
      .split(/[,\n;]/)
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    if (terms.length > 0) {
      dispatch({ type: 'SET_ACTIVE_MODE', payload: 'manual' });
      dispatch({ type: 'SET_SUGGESTED_TERMS', payload: terms });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setManualTerms(content);
      };
      reader.readAsText(file);
    }
  };

  const topicExamples = [
    'Digital Marketing',
    'AI & Machine Learning', 
    'Cryptocurrency',
    'Web Development',
    'SEO & Content',
    'SaaS Business'
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Interactive floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative">
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Term Discovery</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Discover Terms
              <br />
              <span className="text-primary">Intelligently</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Extract terms from websites, explore topics with AI, or upload your own lists. 
              Our intelligent algorithms find the most relevant terms for your glossary.
            </motion.p>

            {/* Quick Stats */}
            <motion.div 
              className="flex justify-center gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: TrendingUp, label: "Term Sources", value: "3+" },
                { icon: BarChart3, label: "AI Models", value: "GPT-4" },
                { icon: Zap, label: "Discovery Time", value: "< 1m" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Term Discovery Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="domain" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="domain" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Domain Analysis
                  </TabsTrigger>
                  <TabsTrigger value="topic" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Topic Mode
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="domain">
                  <div className="space-y-6">
                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        Analyze any website to extract relevant terminology and key concepts automatically.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-4">
                      <Input
                        placeholder="Enter domain URL (e.g., https://example.com)"
                        value={domainUrl}
                        onChange={(e) => setDomainUrl(e.target.value)}
                        disabled={isAnalyzing}
                      />
                      <Button 
                        onClick={handleAnalyzeDomain}
                        disabled={!domainUrl.trim() || isAnalyzing}
                        className="bg-gradient-to-r from-primary to-blue-500"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="topic">
                  <div className="space-y-6">
                    <Alert>
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        Let AI suggest relevant terms based on your topic or industry focus.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-4">
                      <Input
                        placeholder="Enter topic (e.g., Digital Marketing, AI, Web Development)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isAnalyzing}
                      />
                      <Button 
                        onClick={handleSuggestTerms}
                        disabled={!topic.trim() || isAnalyzing}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Suggest
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Popular topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {topicExamples.map((example) => (
                          <Badge 
                            key={example}
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => setTopic(example)}
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="manual">
                  <div className="space-y-6">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Upload a CSV file or manually enter terms separated by commas or new lines.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Enter terms separated by commas or new lines..."
                        value={manualTerms}
                        onChange={(e) => setManualTerms(e.target.value)}
                        rows={6}
                      />
                      
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <Button variant="outline" className="cursor-pointer">
                            <FileText className="h-4 w-4 mr-2" />
                            Upload CSV
                          </Button>
                        </label>
                        
                        <Button 
                          onClick={handleManualSubmit}
                          disabled={!manualTerms.trim()}
                          className="bg-gradient-to-r from-green-500 to-emerald-500"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Process Terms
                        </Button>
                      </div>
                      
                      {csvFile && (
                        <p className="text-sm text-muted-foreground">
                          File loaded: {csvFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Results Section */}
              <AnimatePresence>
                {suggestedTerms.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="mt-8 p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-xl border border-green-500/20"
                  >
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                      <Search className="h-5 w-5 text-green-500" />
                      Discovered Terms ({suggestedTerms.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestedTerms.slice(0, 20).map((term, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                          {term}
                        </Badge>
                      ))}
                      {suggestedTerms.length > 20 && (
                        <Badge variant="outline">+{suggestedTerms.length - 20} more</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Great! Your terms have been discovered. Click "Next" to proceed to term selection.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              {lastError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertDescription>{lastError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};