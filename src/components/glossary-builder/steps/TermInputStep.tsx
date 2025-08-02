import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { 
  Globe, 
  Lightbulb, 
  FileText, 
  Loader2, 
  Search,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export const TermInputStep = () => {
  const { state, dispatch, analyzeDomain, suggestTopicTerms } = useGlossaryBuilder();
  const { activeMode, isAnalyzing, suggestedTerms } = state;
  
  const [domainUrl, setDomainUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [manualTerms, setManualTerms] = useState('');

  const handleDomainAnalysis = async () => {
    if (!domainUrl.trim()) return;
    await analyzeDomain(domainUrl);
  };

  const handleTopicSuggestion = async () => {
    if (!topic.trim()) return;
    await suggestTopicTerms(topic);
  };

  const handleManualEntry = () => {
    const terms = manualTerms
      .split('\n')
      .map(term => term.trim())
      .filter(term => term.length > 0);
    
    if (terms.length > 0) {
      dispatch({ type: 'SET_SUGGESTED_TERMS', payload: terms });
    }
  };

  const topicExamples = [
    "Software Development", "Digital Marketing", "E-commerce", 
    "AI & Machine Learning", "Cybersecurity", "Project Management"
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
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
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
              Discover Glossary
              <br />
              <span className="text-primary">Terms</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Extract terms from domains, explore topics, or manually input your glossary terms.
              Our AI will help you build comprehensive definitions.
            </motion.p>

            {/* Quick Stats */}
            <motion.div 
              className="flex justify-center gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { icon: Globe, label: "Domain Analysis", value: "Deep" },
                { icon: Lightbulb, label: "Topic Exploration", value: "Smart" },
                { icon: TrendingUp, label: "Manual Control", value: "Full" }
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
          className="max-w-4xl mx-auto"
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
              <Tabs value={activeMode} onValueChange={(value) => 
                dispatch({ type: 'SET_ACTIVE_MODE', payload: value as 'domain' | 'topic' | 'manual' })
              }>
                <TabsList className="grid w-full grid-cols-3">
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

                <TabsContent value="domain" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="domain-url">Website URL</Label>
                      <Input
                        id="domain-url"
                        placeholder="https://example.com"
                        value={domainUrl}
                        onChange={(e) => setDomainUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={handleDomainAnalysis} 
                      disabled={!domainUrl.trim() || isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Domain...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Analyze Domain
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="topic" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="topic">Topic or Industry</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Digital Marketing, Software Development"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="mt-1"
                      />
                    </div>
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
                    <Button 
                      onClick={handleTopicSuggestion} 
                      disabled={!topic.trim() || isAnalyzing}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Suggestions...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Suggest Terms
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="manual-terms">Terms (one per line)</Label>
                      <Textarea
                        id="manual-terms"
                        placeholder={`API\nAuthentication\nDatabase\nMicroservices\nDocker`}
                        value={manualTerms}
                        onChange={(e) => setManualTerms(e.target.value)}
                        className="mt-1 min-h-[150px]"
                      />
                    </div>
                    <Button 
                      onClick={handleManualEntry} 
                      disabled={!manualTerms.trim()}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Add Terms
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results Preview */}
          <AnimatePresence>
            {suggestedTerms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Discovered Terms ({suggestedTerms.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {suggestedTerms.slice(0, 12).map((term, index) => (
                        <motion.div
                          key={term}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Badge variant="secondary" className="w-full justify-center py-2">
                            {term}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                    {suggestedTerms.length > 12 && (
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        And {suggestedTerms.length - 12} more terms...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};