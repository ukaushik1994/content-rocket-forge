
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Lightbulb, TrendingUp, Target, Users, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentStrategy } from '@/contexts/ContentStrategyContext';
import { toast } from 'sonner';

interface StrategySuggestionsProps {
  serpMetrics: any;
  goals: any;
}

export const StrategySuggestions = ({ serpMetrics, goals }: StrategySuggestionsProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const { createStrategy, currentStrategy } = useContentStrategy();

  const getStrategyRecommendations = () => {
    const difficulty = serpMetrics?.keywordDifficulty || 50;
    const volume = serpMetrics?.searchVolume || 10000;
    
    const strategies = [
      {
        id: 1,
        title: "SEO-Focused Content Hub",
        description: `Target ${goals.mainKeyword || 'your main keyword'} and related long-tail keywords with comprehensive guides`,
        difficulty: difficulty < 40 ? "Low" : difficulty < 70 ? "Medium" : "High",
        traffic: Math.floor(volume * 0.3).toLocaleString(),
        contentPieces: parseInt(goals.contentPieces) || 12,
        score: Math.max(90 - (difficulty * 0.5), 60),
        topics: ["How-to guides", "Best practices", "Industry trends", "Tool comparisons"],
        timeframe: goals.timeline || "3 months",
        implementation: [
          `Create pillar content around "${goals.mainKeyword || 'main topic'}"`,
          "Develop 8-10 supporting articles targeting long-tail keywords",
          "Optimize for featured snippets and People Also Ask",
          "Build internal linking structure for topic authority"
        ]
      },
      {
        id: 2,
        title: "Competitor Gap Strategy",
        description: "Identify and target content gaps left by top-ranking competitors",
        difficulty: "Medium",
        traffic: Math.floor(volume * 0.4).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * 0.8),
        score: serpMetrics ? 85 : 75,
        topics: ["Untapped subtopics", "Better user experience", "Updated information", "Missing formats"],
        timeframe: goals.timeline || "3 months",
        implementation: [
          "Analyze top 10 competitors for content gaps",
          "Create superior content for identified opportunities",
          "Add visual elements competitors are missing",
          "Target featured snippet opportunities"
        ]
      },
      {
        id: 3,
        title: "Multi-Format Content Series",
        description: "Diversify content formats to capture different audience preferences",
        difficulty: "High",
        traffic: Math.floor(volume * 0.25).toLocaleString(),
        contentPieces: Math.floor((parseInt(goals.contentPieces) || 12) * 1.2),
        score: 80,
        topics: ["Blog posts", "Video content", "Infographics", "Podcasts", "Interactive tools"],
        timeframe: goals.timeline || "4 months",
        implementation: [
          "Create written guides as foundation content",
          "Repurpose into video tutorials and infographics",
          "Develop interactive elements and calculators",
          "Cross-promote across all content formats"
        ]
      }
    ];

    return strategies;
  };

  const strategies = getStrategyRecommendations();

  const handleSelectStrategy = async (strategy: any) => {
    setLoading(strategy.id);
    try {
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
      
      toast.success(`${strategy.title} strategy activated successfully!`);
      setSelectedStrategy(strategy.id);
    } catch (error) {
      console.error('Error creating strategy:', error);
      toast.error('Failed to activate strategy. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
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
    </div>
  );
};
