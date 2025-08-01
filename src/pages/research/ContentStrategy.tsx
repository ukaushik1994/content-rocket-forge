
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, Users, Clock, Star, ArrowRight, Plus, BarChart3, Sparkles, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ContentStrategy = () => {
  const [goals, setGoals] = useState({
    monthlyTraffic: '',
    contentPieces: '',
    timeline: '3 months'
  });

  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const strategySuggestions = [
    {
      id: 1,
      title: "SEO-Focused Blog Content",
      description: "Target high-volume, low-competition keywords with comprehensive guides and tutorials",
      difficulty: "Medium",
      traffic: "15,000",
      contentPieces: 12,
      score: 85,
      topics: ["How-to guides", "Best practices", "Industry trends", "Tool comparisons"],
      timeframe: "3 months",
      implementation: [
        "Keyword research and content gap analysis",
        "Create editorial calendar with 4 posts per month",
        "Optimize for featured snippets and semantic search",
        "Build topic clusters around main keywords"
      ]
    },
    {
      id: 2,
      title: "Video Content Series",
      description: "Create engaging video content for YouTube and social media platforms",
      difficulty: "High",
      traffic: "25,000",
      contentPieces: 8,
      score: 92,
      topics: ["Tutorials", "Behind the scenes", "Product demos", "Expert interviews"],
      timeframe: "4 months",
      implementation: [
        "Set up professional video recording setup",
        "Create consistent branding and thumbnails",
        "Develop content repurposing strategy",
        "Optimize for YouTube SEO and engagement"
      ]
    },
    {
      id: 3,
      title: "Community-Driven Content",
      description: "Leverage user-generated content and community engagement strategies",
      difficulty: "Low",
      traffic: "8,000",
      contentPieces: 15,
      score: 78,
      topics: ["User stories", "Q&A sessions", "Community highlights", "Case studies"],
      timeframe: "2 months",
      implementation: [
        "Build community engagement framework",
        "Create user-generated content campaigns",
        "Implement feedback collection systems",
        "Develop community moderation guidelines"
      ]
    }
  ];

  const contentGaps = [
    {
      topic: "Advanced tutorials",
      opportunity: "High",
      competition: "Low",
      volume: "12,000",
      description: "In-depth technical content that competitors are missing",
      actionItems: ["Create step-by-step video tutorials", "Write comprehensive guides", "Include downloadable resources"]
    },
    {
      topic: "Case studies",
      opportunity: "Medium", 
      competition: "Medium",
      volume: "8,500",
      description: "Real-world success stories and detailed analysis",
      actionItems: ["Interview successful customers", "Document ROI and metrics", "Create visual case study templates"]
    },
    {
      topic: "Industry comparisons",
      opportunity: "High",
      competition: "High", 
      volume: "15,000",
      description: "Detailed comparison content that helps users make decisions",
      actionItems: ["Create comparison matrices", "Include pricing analysis", "Add pros/cons sections"]
    }
  ];

  const topicClusters = [
    {
      id: 1,
      mainTopic: "Content Marketing",
      pillarPage: "Complete Guide to Content Marketing",
      subTopics: [
        { title: "Content Strategy", searchVolume: "8,900", difficulty: "Medium" },
        { title: "Content Calendar", searchVolume: "5,400", difficulty: "Low" },
        { title: "Content Distribution", searchVolume: "3,200", difficulty: "Medium" },
        { title: "Content Analytics", searchVolume: "2,100", difficulty: "High" }
      ],
      status: "Planning"
    },
    {
      id: 2,
      mainTopic: "SEO Optimization",
      pillarPage: "Advanced SEO Techniques Guide",
      subTopics: [
        { title: "Keyword Research", searchVolume: "12,100", difficulty: "High" },
        { title: "On-page SEO", searchVolume: "9,800", difficulty: "Medium" },
        { title: "Technical SEO", searchVolume: "6,700", difficulty: "High" },
        { title: "Link Building", searchVolume: "4,300", difficulty: "High" }
      ],
      status: "In Progress"
    },
    {
      id: 3,
      mainTopic: "Social Media Marketing",
      pillarPage: "Social Media Strategy Playbook",
      subTopics: [
        { title: "Social Media Strategy", searchVolume: "7,200", difficulty: "Medium" },
        { title: "Content Creation", searchVolume: "11,400", difficulty: "Low" },
        { title: "Community Management", searchVolume: "2,900", difficulty: "Low" },
        { title: "Social Analytics", searchVolume: "1,800", difficulty: "Medium" }
      ],
      status: "Completed"
    }
  ];

  const handleGenerateStrategy = async () => {
    if (!goals.monthlyTraffic || !goals.contentPieces) {
      toast.error("Please fill in your traffic and content goals");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate AI strategy generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success("AI strategy generated based on your goals!");
  };

  const getOpportunityColor = (opportunity: string) => {
    if (opportunity === 'High') return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (opportunity === 'Medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'text-green-400 bg-green-500/20';
    if (status === 'In Progress') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-blue-400 bg-blue-500/20';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Strategy | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Enhanced Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-neon-blue/10 rounded-full filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-neon-purple/10 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="futuristic-grid absolute inset-0 opacity-10"></div>
        <div className="floating-particles"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Enhanced Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <h1 className="text-5xl font-bold text-gradient mb-4">
                Content Strategy
              </h1>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              AI-powered content strategy planning with goal setting, gap analysis, topic clusters, and performance tracking
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-neon-blue" />
                <span>Goal Setting</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neon-purple" />
                <span>Gap Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-neon-green" />
                <span>Topic Clusters</span>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Goal Setting Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="glass-panel border-white/10 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-neon-blue/20 rounded-xl">
                    <Target className="h-6 w-6 text-neon-blue" />
                  </div>
                  Set Your Content Goals
                  <Badge variant="outline" className="text-neon-blue border-neon-blue ml-auto">
                    AI-Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    className="space-y-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="traffic" className="text-base font-medium">Monthly Traffic Goal</Label>
                    <Input
                      id="traffic"
                      placeholder="e.g., 50,000"
                      value={goals.monthlyTraffic}
                      onChange={(e) => setGoals({...goals, monthlyTraffic: e.target.value})}
                      className="bg-glass border-white/10 h-12 text-base focus:border-neon-blue transition-all"
                    />
                  </motion.div>
                  <motion.div 
                    className="space-y-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="content" className="text-base font-medium">Content Pieces per Month</Label>
                    <Input
                      id="content"
                      placeholder="e.g., 8"
                      value={goals.contentPieces}
                      onChange={(e) => setGoals({...goals, contentPieces: e.target.value})}
                      className="bg-glass border-white/10 h-12 text-base focus:border-neon-purple transition-all"
                    />
                  </motion.div>
                  <motion.div 
                    className="space-y-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Label htmlFor="timeline" className="text-base font-medium">Timeline</Label>
                    <select 
                      className="w-full px-4 py-3 bg-glass border border-white/10 rounded-md text-white h-12 text-base focus:border-neon-green transition-all"
                      value={goals.timeline}
                      onChange={(e) => setGoals({...goals, timeline: e.target.value})}
                    >
                      <option value="1 month">1 month</option>
                      <option value="3 months">3 months</option>
                      <option value="6 months">6 months</option>
                      <option value="12 months">12 months</option>
                    </select>
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={handleGenerateStrategy} 
                    disabled={isGenerating}
                    className="w-full md:w-auto h-12 px-8 text-base bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate AI Strategy
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="strategies" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 h-14 bg-glass border border-white/10 p-1">
              <TabsTrigger value="strategies" className="h-12 text-base">Strategy Suggestions</TabsTrigger>
              <TabsTrigger value="gaps" className="h-12 text-base">Content Gaps</TabsTrigger>
              <TabsTrigger value="clusters" className="h-12 text-base">Topic Clusters</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-6">
              <AnimatePresence>
                <div className="grid gap-6">
                  {strategySuggestions.map((strategy, index) => (
                    <motion.div
                      key={strategy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`glass-panel border-white/10 cursor-pointer transition-all duration-300 hover:border-neon-blue/30 hover:shadow-2xl ${
                          selectedStrategy === strategy.id ? 'border-neon-blue shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''
                        }`}
                        onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
                      >
                        <CardContent className="p-8">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <h3 className="text-2xl font-semibold text-white">{strategy.title}</h3>
                                <Badge variant="outline" className="text-neon-blue border-neon-blue px-3 py-1">
                                  Score: {strategy.score}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-4 text-base leading-relaxed">{strategy.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div className="text-center p-4 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
                              <div className="text-3xl font-bold text-neon-blue mb-1">{strategy.traffic}</div>
                              <div className="text-sm text-muted-foreground">Monthly Traffic</div>
                            </div>
                            <div className="text-center p-4 bg-neon-purple/10 rounded-xl border border-neon-purple/20">
                              <div className="text-3xl font-bold text-neon-purple mb-1">{strategy.contentPieces}</div>
                              <div className="text-sm text-muted-foreground">Content Pieces</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                              <Badge variant={strategy.difficulty === 'Low' ? 'default' : strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="mb-2">
                                {strategy.difficulty}
                              </Badge>
                              <div className="text-sm text-muted-foreground">Difficulty</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="text-xl font-semibold text-white mb-1">{strategy.timeframe}</div>
                              <div className="text-sm text-muted-foreground">Timeline</div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {strategy.topics.map((topic, index) => (
                                <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Progress value={strategy.score} className="mb-6 h-2" />

                          <AnimatePresence>
                            {selectedStrategy === strategy.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                              >
                                <div className="p-6 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl border border-white/10">
                                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-neon-blue" />
                                    Implementation Plan
                                  </h4>
                                  <div className="grid gap-3">
                                    {strategy.implementation.map((step, idx) => (
                                      <div key={idx} className="flex items-start gap-3">
                                        <div className="bg-neon-blue/20 rounded-full p-1 mt-1">
                                          <CheckCircle className="h-4 w-4 text-neon-blue" />
                                        </div>
                                        <span className="text-white/80">{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <Button className="w-full h-12 text-base" variant={selectedStrategy === strategy.id ? "default" : "outline"}>
                            {selectedStrategy === strategy.id ? "Strategy Selected" : "Select This Strategy"}
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-6">
              <Card className="glass-panel border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-neon-green/20 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-neon-green" />
                    </div>
                    Content Gap Analysis
                    <Badge variant="outline" className="text-neon-green border-neon-green ml-auto">
                      AI-Analyzed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {contentGaps.map((gap, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 bg-glass rounded-xl border border-white/10 hover:border-neon-green/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-xl mb-2">{gap.topic}</h4>
                            <p className="text-muted-foreground mb-3">{gap.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Volume: <span className="text-white font-medium">{gap.volume}/month</span></span>
                              <Badge variant="outline" className={getOpportunityColor(gap.opportunity)}>
                                {gap.opportunity} Opportunity
                              </Badge>
                              <Badge variant={gap.competition === 'Low' ? 'default' : gap.competition === 'Medium' ? 'secondary' : 'destructive'}>
                                {gap.competition} Competition
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-neon-green mb-2">Action Items:</h5>
                          <div className="grid gap-2">
                            {gap.actionItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                                <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button size="sm" variant="outline" className="hover:bg-neon-green/10 hover:border-neon-green">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Content Plan
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clusters" className="space-y-6">
              <Card className="glass-panel border-white/10 shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-neon-purple/20 rounded-xl">
                      <BarChart3 className="h-6 w-6 text-neon-purple" />
                    </div>
                    Topic Cluster Strategy
                    <Badge variant="outline" className="text-neon-purple border-neon-purple ml-auto">
                      Interactive
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {topicClusters.map((cluster, index) => (
                      <motion.div
                        key={cluster.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="p-6 bg-glass rounded-xl border border-white/10 hover:border-neon-purple/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-white text-xl mb-1">{cluster.mainTopic}</h4>
                            <p className="text-muted-foreground mb-2">Pillar Page: {cluster.pillarPage}</p>
                            <Badge variant="outline" className={getStatusColor(cluster.status)}>
                              {cluster.status}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Topic
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cluster.subTopics.map((subTopic, idx) => (
                            <div key={idx} className="p-4 bg-neon-purple/10 rounded-lg border border-neon-purple/20">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-white">{subTopic.title}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {subTopic.difficulty}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Search Volume: <span className="text-neon-purple font-medium">{subTopic.searchVolume}/mo</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="hover:bg-neon-purple/10">
                            View Cluster Map
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-neon-blue/10">
                            Generate Content Plan
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 rounded-xl border border-white/10">
                    <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-neon-purple" />
                      Topic Cluster Best Practices
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                      <div>
                        <span className="font-medium text-neon-purple">Pillar Content:</span>
                        <p>Create comprehensive guides that cover the main topic broadly</p>
                      </div>
                      <div>
                        <span className="font-medium text-neon-blue">Cluster Content:</span>
                        <p>Develop specific content that dives deep into subtopics</p>
                      </div>
                      <div>
                        <span className="font-medium text-neon-green">Internal Linking:</span>
                        <p>Connect all cluster content to the pillar page strategically</p>
                      </div>
                      <div>
                        <span className="font-medium text-neon-purple">User Intent:</span>
                        <p>Match content type to search intent for each cluster topic</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default ContentStrategy;
