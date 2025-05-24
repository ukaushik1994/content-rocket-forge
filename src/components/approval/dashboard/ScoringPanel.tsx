
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Target, FileText, Clock, CheckCircle, 
  AlertTriangle, TrendingUp, Award, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface ScoringPanelProps {
  content: ContentItemType | null;
}

interface ContentScore {
  overall: number;
  readability: number;
  engagement: number;
  seoOptimization: number;
  technicalQuality: number;
  brandAlignment: number;
}

export const ScoringPanel: React.FC<ScoringPanelProps> = ({ content }) => {
  const [scores, setScores] = useState<ContentScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    if (content) {
      generateScores();
    }
  }, [content]);

  const generateScores = async () => {
    if (!content) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate realistic scores based on content
      const contentLength = content.content?.length || 0;
      const hasKeywords = content.keywords && content.keywords.length > 0;
      const wordCount = content.content?.split(' ').length || 0;
      
      const newScores: ContentScore = {
        readability: Math.min(95, 60 + (contentLength > 500 ? 20 : 0) + (wordCount > 300 ? 10 : 0)),
        engagement: Math.min(90, 50 + (contentLength > 800 ? 25 : 0) + (hasKeywords ? 15 : 0)),
        seoOptimization: Math.min(88, 40 + (hasKeywords ? 30 : 0) + (wordCount > 500 ? 18 : 0)),
        technicalQuality: Math.min(92, 70 + (contentLength > 400 ? 15 : 0) + Math.random() * 7),
        brandAlignment: Math.min(85, 60 + Math.random() * 25),
        overall: 0
      };
      
      // Calculate overall score
      newScores.overall = Math.round(
        (newScores.readability + newScores.engagement + newScores.seoOptimization + 
         newScores.technicalQuality + newScores.brandAlignment) / 5
      );
      
      setScores(newScores);
      
      // Generate recommendations
      const newRecommendations = [];
      if (newScores.readability < 70) newRecommendations.push("Improve readability with shorter sentences and simpler language");
      if (newScores.engagement < 70) newRecommendations.push("Add more engaging elements like questions, examples, or statistics");
      if (newScores.seoOptimization < 70) newRecommendations.push("Optimize for target keywords and improve meta descriptions");
      if (newScores.technicalQuality < 80) newRecommendations.push("Review grammar, spelling, and formatting");
      if (newScores.brandAlignment < 75) newRecommendations.push("Ensure content aligns with brand voice and guidelines");
      
      setRecommendations(newRecommendations);
      
      toast.success('AI content analysis completed');
    } catch (error) {
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  if (!content) {
    return (
      <Card className="h-full border border-white/10 bg-gray-800/20 backdrop-blur-sm">
        <CardContent className="h-full flex flex-col items-center justify-center text-white/50">
          <Brain className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">AI Content Scoring</h3>
          <p>Select content to generate AI-powered quality scores</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-neon-purple" />
          <h2 className="text-xl font-semibold text-white/90">AI Content Scoring</h2>
          {scores && (
            <Badge className={getScoreBadgeColor(scores.overall)}>
              Overall Score: {scores.overall}/100
            </Badge>
          )}
        </div>
        
        <Button
          onClick={generateScores}
          disabled={isAnalyzing}
          className="bg-neon-purple hover:bg-neon-purple/80"
        >
          {isAnalyzing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              {scores ? 'Reanalyze' : 'Analyze Content'}
            </>
          )}
        </Button>
      </div>

      {scores ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Cards */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white/90">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scores).filter(([key]) => key !== 'overall').map(([key, value]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className={`font-semibold ${getScoreColor(value)}`}>
                        {value}/100
                      </span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card className="bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border-neon-purple/30">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-neon-purple mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">Overall Score</h3>
                <div className="text-4xl font-bold text-neon-purple mb-2">
                  {scores.overall}/100
                </div>
                <p className="text-white/60">
                  {scores.overall >= 80 ? 'Excellent content quality' :
                   scores.overall >= 60 ? 'Good content with room for improvement' :
                   'Needs significant improvements'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white/90">
                  <Target className="h-5 w-5" />
                  Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-200 text-sm">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p className="text-green-200">Great work! No immediate improvements needed.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Stats */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white/90">
                  <FileText className="h-5 w-5" />
                  Content Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Word Count</span>
                  <span className="text-white/90">{content.content?.split(' ').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Character Count</span>
                  <span className="text-white/90">{content.content?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Keywords</span>
                  <span className="text-white/90">{content.keywords?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Reading Time</span>
                  <span className="text-white/90">
                    {Math.ceil((content.content?.split(' ').length || 0) / 200)} min
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="h-64 border border-white/10 bg-gray-800/20 backdrop-blur-sm">
          <CardContent className="h-full flex flex-col items-center justify-center text-white/50">
            <Brain className="h-12 w-12 mb-4 opacity-50" />
            <p>Click "Analyze Content" to generate AI-powered quality scores</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
