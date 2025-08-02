
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Lightbulb, TrendingUp, Target, Users, Calendar, Loader2, Plus, Wand2, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { toast } from 'sonner';
import { CustomStrategyCreator } from '../CustomStrategyCreator';
import { StrategyComparison } from '../StrategyComparison';

interface StrategySuggestionsProps {
  serpMetrics: any;
  goals: any;
}

export const StrategySuggestions = ({ serpMetrics, goals }: StrategySuggestionsProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const { createStrategy, createPipelineItem, createCalendarItem, currentStrategy } = useContentStrategy();

  const getStrategyRecommendations = () => {
    const difficulty = serpMetrics?.keywordDifficulty || 50;
    const volume = serpMetrics?.searchVolume || 10000;
    const competition = serpMetrics?.competitionScore || 0.5;
    const cpc = serpMetrics?.cpc || 1.5;
    
    // Dynamic strategy generation based on SERP metrics
    const strategies = [];
    
    // Strategy 1: SEO-Focused Content Hub (Always recommended but adjusted based on metrics)
    strategies.push({
      id: 1,
      title: difficulty < 40 ? "Aggressive SEO Content Hub" : difficulty < 70 ? "Strategic SEO Content Hub" : "Long-tail SEO Content Hub",
      description: difficulty < 40 
        ? `Capitalize on low competition for "${goals.mainKeyword}" with aggressive content targeting`
        : difficulty < 70
        ? `Build comprehensive authority around "${goals.mainKeyword}" with strategic content approach`
        : `Target long-tail opportunities around "${goals.mainKeyword}" to compete in high-difficulty space`,
      difficulty: difficulty < 40 ? "Low" : difficulty < 70 ? "Medium" : "High",
      traffic: Math.floor(volume * (difficulty < 40 ? 0.4 : difficulty < 70 ? 0.3 : 0.15)).toLocaleString(),
      contentPieces: parseInt(goals.contentPieces) || 12,
      score: Math.max(95 - (difficulty * 0.8), 60),
      topics: difficulty < 40 
        ? ["Primary keyword targeting", "Related keywords", "Featured snippets", "Local SEO"]
        : difficulty < 70
        ? ["Pillar content", "Topic clusters", "Long-tail keywords", "Internal linking"]
        : ["Long-tail opportunities", "Question-based content", "Niche subtopics", "Semantic keywords"],
      timeframe: difficulty < 40 ? "2-3 months" : difficulty < 70 ? goals.timeline || "3 months" : "4-6 months",
      implementation: difficulty < 40
        ? [
            `Target "${goals.mainKeyword}" directly with comprehensive pillar content`,
            "Create supporting content for 15-20 related keywords",
            "Optimize aggressively for featured snippets",
            "Build rapid internal linking structure"
          ]
        : difficulty < 70
        ? [
            `Create authority content hub around "${goals.mainKeyword}"`,
            "Develop topic clusters with 8-12 supporting articles",
            "Focus on E-A-T signals and comprehensive coverage",
            "Build systematic internal linking strategy"
          ]
        : [
            `Focus on long-tail variations of "${goals.mainKeyword}"`,
            "Target question-based and conversational queries",
            "Create in-depth, expert-level content",
            "Build topical authority through consistent publishing"
          ]
    });

    // Strategy 2: Competitor Gap Strategy (Recommended when competition data available)
    if (serpMetrics?.topResults?.length > 0) {
      strategies.push({
        id: 2,
        title: competition > 0.7 ? "Competitive Disruption Strategy" : "Competitor Gap Strategy",
        description: competition > 0.7
          ? "Disrupt established competitors with superior content and user experience"
          : "Identify and exploit content gaps left by competitors in your niche",
        difficulty: competition > 0.7 ? "High" : "Medium",
        traffic: Math.floor(volume * (competition > 0.7 ? 0.25 : 0.35)).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * (competition > 0.7 ? 1.2 : 0.9)),
        score: competition > 0.7 ? 75 : 85,
        topics: competition > 0.7
          ? ["Disruptive content formats", "Superior user experience", "Updated information", "Unique perspectives"]
          : ["Untapped subtopics", "Missing content types", "Outdated competitor content", "User experience gaps"],
        timeframe: competition > 0.7 ? "6-8 months" : goals.timeline || "4 months",
        implementation: competition > 0.7
          ? [
              "Analyze top 10 competitors for content weaknesses",
              "Create dramatically superior content experiences",
              "Focus on multimedia and interactive elements",
              "Target emerging trends competitors are missing"
            ]
          : [
              "Conduct comprehensive competitor content audit",
              "Identify specific gaps in competitor coverage",
              "Create targeted content for unexploited opportunities",
              "Optimize for user intent competitors are missing"
            ]
      });
    }

    // Strategy 3: Multi-Format Content Series (Recommended for higher volume keywords)
    if (volume > 5000) {
      strategies.push({
        id: 3,
        title: volume > 20000 ? "Omnichannel Content Empire" : "Multi-Format Content Series",
        description: volume > 20000
          ? "Build comprehensive content ecosystem across all formats to dominate high-volume keyword space"
          : "Diversify content formats to capture different audience preferences and search intents",
        difficulty: volume > 20000 ? "High" : "Medium",
        traffic: Math.floor(volume * (volume > 20000 ? 0.3 : 0.2)).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * (volume > 20000 ? 1.5 : 1.2)),
        score: volume > 20000 ? 90 : 80,
        topics: volume > 20000
          ? ["Written content", "Video content", "Interactive tools", "Podcasts", "Webinars", "Infographics"]
          : ["Blog posts", "Video tutorials", "Infographics", "Case studies", "Templates"],
        timeframe: volume > 20000 ? "6-12 months" : "4-6 months",
        implementation: volume > 20000
          ? [
              "Create comprehensive written content foundation",
              "Develop video series and podcast episodes",
              "Build interactive tools and calculators",
              "Establish cross-format content promotion strategy"
            ]
          : [
              "Start with detailed written guides as foundation",
              "Repurpose into video tutorials and visual content",
              "Create downloadable resources and templates",
              "Cross-promote across all content formats"
            ]
      });
    }

    // Strategy 4: Paid + Organic Hybrid (Recommended for high CPC keywords)
    if (cpc > 2.0) {
      strategies.push({
        id: 4,
        title: "Paid + Organic Hybrid Strategy",
        description: `High commercial value detected (CPC: $${cpc.toFixed(2)}). Combine organic content with strategic paid promotion`,
        difficulty: "Medium",
        traffic: Math.floor(volume * 0.2).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * 0.8),
        score: 88,
        topics: ["Commercial content", "Comparison guides", "Product reviews", "Landing pages", "Lead magnets"],
        timeframe: "3-4 months",
        implementation: [
          "Create high-converting commercial content",
          "Develop comparison and review content",
          "Build landing pages for paid traffic",
          "Create lead magnets and conversion funnels"
        ]
      });
    }

    // Strategy 5: Local SEO Focus (Recommended if location-based intent detected)
    if (goals.mainKeyword?.includes('near me') || goals.mainKeyword?.includes('local') || volume < 2000) {
      strategies.push({
        id: 5,
        title: "Local SEO Domination Strategy",
        description: "Focus on local search optimization and community-based content to dominate local market",
        difficulty: "Low",
        traffic: Math.floor(volume * 0.6).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * 0.7),
        score: 92,
        topics: ["Local guides", "Community content", "Location pages", "Local partnerships", "Reviews management"],
        timeframe: "2-3 months",
        implementation: [
          "Optimize Google Business Profile and local listings",
          "Create location-specific content and landing pages",
          "Build local partnership and citation opportunities",
          "Develop community-focused content strategy"
        ]
      });
    }

    return strategies.slice(0, 4); // Return top 4 strategies
  };

  const strategies = getStrategyRecommendations();

  const handleSelectStrategy = async (strategy: any) => {
    setLoading(strategy.id);
    try {
      // 1. Create the strategy
      await createStrategy({
        name: strategy.title,
        monthly_traffic_goal: parseInt(strategy.traffic.replace(/,/g, '')) || undefined,
        content_pieces_per_month: strategy.contentPieces,
        timeline: strategy.timeframe,
        main_keyword: goals.mainKeyword,
        target_audience: goals.audience || undefined,
        brand_voice: goals.voice || undefined,
        content_pillars: strategy.topics
      });
      
      // 2. Auto-generate pipeline items from implementation steps
      await generatePipelineFromStrategy(strategy);
      
      // 3. Auto-generate calendar items based on timeline
      await generateCalendarFromStrategy(strategy);
      
      toast.success(`${strategy.title} strategy activated with ${strategy.implementation.length} pipeline items and calendar schedule!`);
      setSelectedStrategy(strategy.id);
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast.error('Failed to activate strategy. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const generatePipelineFromStrategy = async (strategy: any) => {    
    // Generate pipeline items from implementation steps
    const pipelinePromises = strategy.implementation.map((step: string, index: number) => {
      const stageMap = ['idea', 'planning', 'in_progress', 'review'];
      const priorityMap = ['high', 'medium', 'medium', 'low'];
      
      return createPipelineItem({
        title: step,
        stage: stageMap[index] || 'idea',
        content_type: 'blog',
        priority: priorityMap[index] || 'medium',
        progress_percentage: 0,
        notes: `Auto-generated from ${strategy.title} strategy`
      });
    });

    // Generate additional content pieces based on topics
    const topicPromises = strategy.topics.slice(0, Math.min(strategy.contentPieces - strategy.implementation.length, 5)).map((topic: string) => {
      return createPipelineItem({
        title: `Create ${topic} content`,
        stage: 'idea',
        content_type: 'blog',
        target_keyword: `${goals.mainKeyword} ${topic.toLowerCase()}`,
        priority: 'medium',
        progress_percentage: 0,
        notes: `Content piece for ${topic} - auto-generated from strategy`
      });
    });

    await Promise.all([...pipelinePromises, ...topicPromises]);
  };

  const generateCalendarFromStrategy = async (strategy: any) => {    
    // Parse timeline to determine schedule
    const timelineMatch = strategy.timeframe.match(/(\d+)/);
    const months = timelineMatch ? parseInt(timelineMatch[1]) : 3;
    
    const calendarPromises = [];
    let currentDate = new Date();
    
    // Generate calendar items for implementation steps
    strategy.implementation.forEach((step: string, index: number) => {
      const scheduleDate = new Date(currentDate);
      scheduleDate.setDate(scheduleDate.getDate() + (index * 7)); // Weekly intervals
      
      calendarPromises.push(createCalendarItem({
        title: step,
        content_type: 'blog',
        status: 'planning',
        scheduled_date: scheduleDate.toISOString().split('T')[0],
        priority: index === 0 ? 'high' : 'medium',
        estimated_hours: 4,
        tags: ['strategy-implementation'],
        notes: `Implementation step ${index + 1} for ${strategy.title}`
      }));
    });

    // Generate calendar items for content topics
    strategy.topics.forEach((topic: string, index: number) => {
      const scheduleDate = new Date(currentDate);
      scheduleDate.setDate(scheduleDate.getDate() + ((index + strategy.implementation.length) * 3)); // Every 3 days
      
      calendarPromises.push(createCalendarItem({
        title: `Create ${topic} content`,
        content_type: 'blog',
        status: 'planning',
        scheduled_date: scheduleDate.toISOString().split('T')[0],
        priority: 'medium',
        estimated_hours: 6,
        tags: [topic.toLowerCase().replace(/\s+/g, '-'), 'content-creation'],
        notes: `Content creation for ${topic} topic`
      }));
    });

    await Promise.all(calendarPromises);
  };

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Strategy Recommendations</h2>
          <p className="text-muted-foreground">AI-powered strategies based on your keyword analysis and goals</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowComparison(true)}
            variant="outline" 
            className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
            disabled={strategies.length < 2}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare Strategies
          </Button>
          <Button 
            onClick={() => setShowCustomCreator(true)}
            variant="outline" 
            className="text-primary border-primary hover:bg-primary/10"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Create Custom Strategy
          </Button>
        </div>
      </div>

      {strategies.map((strategy, index) => (
        <motion.div
          key={strategy.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className={`glass-panel border-white/10 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-2xl ${
              selectedStrategy === strategy.id ? 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]' : ''
            }`}
            onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
          >
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-2xl font-semibold text-white">{strategy.title}</h3>
                    <Badge variant="outline" className="text-primary border-primary px-3 py-1">
                      Score: {Math.round(strategy.score)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 text-base leading-relaxed">{strategy.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400 mb-1">{strategy.traffic}</div>
                  <div className="text-sm text-muted-foreground">Est. Traffic</div>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400 mb-1">{strategy.contentPieces}</div>
                  <div className="text-sm text-muted-foreground">Content Pieces</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <Users className="h-6 w-6 text-white mx-auto mb-2" />
                  <Badge variant={strategy.difficulty === 'Low' ? 'default' : strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'} className="mb-2">
                    {strategy.difficulty}
                  </Badge>
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <Calendar className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white mb-1">{strategy.timeframe}</div>
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

              <Progress value={strategy.score} className="mb-6 h-3" />

              <AnimatePresence>
                {selectedStrategy === strategy.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Implementation Plan
                      </h4>
                      <div className="grid gap-3">
                        {strategy.implementation.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="bg-primary/20 rounded-full p-1 mt-1">
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-white/80">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button 
                className="w-full h-12 text-base" 
                variant={currentStrategy?.name === strategy.title ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectStrategy(strategy);
                }}
                disabled={loading === strategy.id}
              >
                {loading === strategy.id ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Activating Strategy...
                  </>
                ) : currentStrategy?.name === strategy.title ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Active Strategy
                  </>
                ) : (
                  <>
                    Select This Strategy
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Custom Strategy Creator Modal */}
      <AnimatePresence>
        {showCustomCreator && (
          <CustomStrategyCreator 
            onClose={() => setShowCustomCreator(false)}
            goals={goals}
          />
        )}
      </AnimatePresence>

      {/* Strategy Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <StrategyComparison 
            strategies={strategies}
            onClose={() => setShowComparison(false)}
            onSelectStrategy={(strategy) => {
              setShowComparison(false);
              handleSelectStrategy(strategy);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
