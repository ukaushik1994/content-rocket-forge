import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { Lightbulb, TrendingUp, Users, Clock, Target, ChevronRight, Settings, Zap } from 'lucide-react';
import { CustomStrategyCreator } from '../CustomStrategyCreator';
import { StrategyComparison } from '../StrategyComparison';
import { ContentStrategyEngine } from '../ContentStrategyEngine';

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

    // Strategy 3: Topical Authority Playbook (Recommended for high-volume keywords)
    if (volume > 5000) {
      strategies.push({
        id: 3,
        title: "Topical Authority Playbook",
        description: `Establish comprehensive topical authority around "${goals.mainKeyword}" to dominate search results`,
        difficulty: "High",
        traffic: Math.floor(volume * 0.3).toLocaleString(),
        contentPieces: parseInt(goals.contentPieces) * 2 || 24,
        score: 80,
        topics: ["Pillar content", "Supporting articles", "Internal linking", "E-A-T optimization"],
        timeframe: "6-12 months",
        implementation: [
          `Create a central pillar page targeting "${goals.mainKeyword}"`,
          "Develop 20-30 supporting articles covering related subtopics",
          "Build a robust internal linking structure",
          "Optimize content for Expertise, Authoritativeness, and Trustworthiness (E-A-T)"
        ]
      });
    }

    // Strategy 4: Question-Driven Content Blitz (Recommended for informational keywords)
    if (serpMetrics?.hasFeaturedSnippet) {
      strategies.push({
        id: 4,
        title: "Question-Driven Content Blitz",
        description: "Answer common questions related to your niche to capture featured snippets and voice search traffic",
        difficulty: "Low",
        traffic: Math.floor(volume * 0.25).toLocaleString(),
        contentPieces: parseInt(goals.contentPieces) || 12,
        score: 78,
        topics: ["Question keywords", "Answer-focused content", "Schema markup", "Voice search optimization"],
        timeframe: goals.timeline || "3 months",
        implementation: [
          "Identify 50-100 question keywords related to your niche",
          "Create concise, direct answers to each question",
          "Implement schema markup to improve featured snippet eligibility",
          "Optimize content for voice search"
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
      
      setSelectedStrategy(strategy.id);
    } catch (error) {
      console.error('Error creating strategy:', error);
    } finally {
      setLoading(null);
    }
  };

  const generatePipelineFromStrategy = async (strategy: any) => {
    if (!strategy.implementation) return;
    
    for (const step of strategy.implementation) {
      await createPipelineItem({
        title: step,
        stage: 'idea',
        content_type: 'blog',
        priority: 'medium',
        progress_percentage: 0
      });
    }
  };

  const generateCalendarFromStrategy = async (strategy: any) => {
    if (!strategy.timeframe) return;

    const months = parseInt(strategy.timeframe.split(' ')[0]);
    const startDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const monthStartDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthEndDate = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      const daysInMonth = monthEndDate.getDate();
      
      const itemsPerPiece = Math.floor(daysInMonth / strategy.contentPieces);

      for (let j = 0; j < strategy.contentPieces; j++) {
        const dayOfMonth = Math.min((j * itemsPerPiece) + 7, daysInMonth);
        const calendarDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, dayOfMonth);

        await createCalendarItem({
          title: `Content Piece ${j + 1} - ${strategy.title}`,
          scheduled_date: calendarDate.toISOString().split('T')[0],
          content_type: 'blog',
          status: 'planning',
          priority: 'medium',
          estimated_hours: 4
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Strategy Center</h2>
          <p className="text-muted-foreground mt-1">
            Choose from pre-built templates or use our AI engine to generate custom strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowComparison(true)}
            className="bg-background/50 border-border/50 hover:bg-muted/50"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Compare Strategies
          </Button>
          <Button
            onClick={() => setShowCustomCreator(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Settings className="w-4 h-4 mr-2" />
            Create Custom Strategy
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Strategy Templates
          </TabsTrigger>
          <TabsTrigger value="engine" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            AI Strategy Engine
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Recommended Strategy Templates</h3>
              <p className="text-muted-foreground text-sm">
                Choose from AI-generated templates based on your goals and SERP analysis
              </p>
            </div>

            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {strategy.title}
                          <Badge variant="outline">
                            Score: {Math.round(strategy.score)}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {strategy.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-semibold">{strategy.traffic}</div>
                        <div className="text-xs text-muted-foreground">Est. Traffic</div>
                      </div>
                      <div className="text-center">
                        <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-lg font-semibold">{strategy.contentPieces}</div>
                        <div className="text-xs text-muted-foreground">Content Pieces</div>
                      </div>
                      <div className="text-center">
                        <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <Badge variant={strategy.difficulty === 'Low' ? 'default' : strategy.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                          {strategy.difficulty}
                        </Badge>
                        <div className="text-xs text-muted-foreground">Difficulty</div>
                      </div>
                      <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <div className="text-sm font-semibold">{strategy.timeframe}</div>
                        <div className="text-xs text-muted-foreground">Timeline</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {strategy.topics.map((topic: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleSelectStrategy(strategy)}
                      disabled={loading === strategy.id}
                      className="w-full"
                    >
                      {loading === strategy.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 mr-2"
                          >
                            <Lightbulb className="w-4 h-4" />
                          </motion.div>
                          Activating Strategy...
                        </>
                      ) : (
                        <>
                          Activate Strategy
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="engine" className="mt-6">
          <ContentStrategyEngine serpMetrics={serpMetrics} goals={goals} />
        </TabsContent>
      </Tabs>

      {/* Modal components would go here but are not yet implemented */}
    </div>
  );
};
