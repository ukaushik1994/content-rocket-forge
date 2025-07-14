
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Users, Target, Columns, Calendar, TrendingUp, CheckCircle, Star } from 'lucide-react';

interface StrategyPreviewProps {
  data: any;
  onChange: (data: any) => void;
}

export const StrategyPreview: React.FC<StrategyPreviewProps> = ({ data }) => {
  const completionScore = () => {
    let score = 0;
    if (data.targetAudience?.trim()) score += 25;
    if (data.contentGoals?.length > 0) score += 25;
    if (data.contentPillars?.length >= 3) score += 25;
    if (data.businessObjectives?.trim()) score += 15;
    if (data.competitorAnalysis?.trim()) score += 10;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-blue-500 to-cyan-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const score = completionScore();

  const strategyRecommendations = [
    {
      title: 'Audience Focus',
      status: data.targetAudience?.trim() ? 'complete' : 'incomplete',
      recommendation: data.targetAudience?.trim() 
        ? 'Well-defined audience persona' 
        : 'Define your target audience for better content alignment'
    },
    {
      title: 'Goal Alignment',
      status: data.contentGoals?.length > 0 ? 'complete' : 'incomplete',
      recommendation: data.contentGoals?.length > 0 
        ? `${data.contentGoals.length} goals selected for focused strategy` 
        : 'Select at least one content goal'
    },
    {
      title: 'Content Pillars',
      status: data.contentPillars?.length >= 3 ? 'complete' : 'incomplete',
      recommendation: data.contentPillars?.length >= 3 
        ? `${data.contentPillars.length} pillars for diverse content` 
        : 'Add at least 3 content pillars for variety'
    },
    {
      title: 'Publishing Schedule',
      status: data.publishingSchedule ? 'complete' : 'incomplete',
      recommendation: `${data.publishingSchedule || 'weekly'} publishing frequency selected`
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Eye className="h-8 w-8 text-neon-cyan" />
          <h2 className="text-3xl font-bold text-gradient">Strategy Overview</h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review your comprehensive content strategy before finalizing
        </p>
      </motion.div>

      {/* Strategy Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-panel border-white/10 text-center">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Star className="h-8 w-8 text-neon-yellow" />
                <h3 className="text-2xl font-bold text-white">Strategy Completeness</h3>
              </div>
              
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${score * 2.51} 251.2`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9b87f5" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{score}%</span>
                </div>
              </div>
              
              <Badge 
                className={`bg-gradient-to-r ${getScoreColor(score)} text-white px-4 py-2`}
              >
                {score >= 90 ? 'Excellent Strategy' : 
                 score >= 70 ? 'Good Strategy' : 
                 score >= 50 ? 'Needs Improvement' : 'Incomplete Strategy'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strategy Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audience */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-panel border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-neon-blue" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.targetAudience ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.targetAudience}
                </p>
              ) : (
                <p className="text-sm text-amber-400">No audience defined yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-panel border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-purple" />
                Content Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.contentGoals?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.contentGoals.map((goal: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {goal}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-400">No goals selected yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Pillars */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-panel border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Columns className="h-5 w-5 text-neon-green" />
                Content Pillars
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.contentPillars?.length > 0 ? (
                <div className="space-y-2">
                  {data.contentPillars.map((pillar: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-green rounded-full" />
                      <span className="text-sm text-white">{pillar}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-amber-400">No pillars defined yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Publishing Strategy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-panel border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-neon-yellow" />
                Publishing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <Badge variant="outline">{data.publishingSchedule || 'Not set'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Funnel Stage:</span>
                <Badge variant="outline">{data.targetFunnelStage || 'Not set'}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strategy Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-cyan" />
              Strategy Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyRecommendations.map((rec, index) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-glass rounded-lg border border-white/10"
                >
                  <div className={`mt-1 ${rec.status === 'complete' ? 'text-green-400' : 'text-amber-400'}`}>
                    {rec.status === 'complete' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-current rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Objectives & Competitor Analysis */}
      {(data.businessObjectives || data.competitorAnalysis) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.businessObjectives && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Business Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.businessObjectives}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {data.competitorAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle>Competitor Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.competitorAnalysis}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
