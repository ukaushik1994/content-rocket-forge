
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Award, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  BookOpen,
  ExternalLink,
  Lightbulb,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { EATAnalyzer, EATAnalysisResult } from '@/services/eatOptimization/EATAnalyzer';
import { AuthorityBuildingService, AuthorityBuildingPlan } from '@/services/eatOptimization/AuthorityBuildingService';
import { TrustSignalOptimizer, TrustOptimizationPlan } from '@/services/eatOptimization/TrustSignalOptimizer';
import { toast } from 'sonner';

interface EATDashboardProps {
  content: string;
  title: string;
  topic: string;
  authorInfo?: {
    name?: string;
    credentials?: string[];
    bio?: string;
  };
  onImplementRecommendation?: (recommendation: string) => void;
}

export const EATDashboard: React.FC<EATDashboardProps> = ({
  content,
  title,
  topic,
  authorInfo,
  onImplementRecommendation
}) => {
  const [eatAnalysis, setEatAnalysis] = useState<EATAnalysisResult | null>(null);
  const [authorityPlan, setAuthorityPlan] = useState<AuthorityBuildingPlan | null>(null);
  const [trustPlan, setTrustPlan] = useState<TrustOptimizationPlan | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Run E-A-T analysis on content change
  useEffect(() => {
    if (content && topic) {
      runEATAnalysis();
    }
  }, [content, topic]);

  const runEATAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      toast.info("Running comprehensive E-A-T analysis...");
      
      // Run all analyses in parallel
      const [eatResult, authorityResult, trustResult] = await Promise.all([
        EATAnalyzer.analyzeContent(content, title, topic, authorInfo),
        AuthorityBuildingService.generateAuthorityPlan(content, topic, 'professionals', authorInfo?.credentials),
        TrustSignalOptimizer.optimizeTrustSignals(content, undefined, authorInfo)
      ]);
      
      setEatAnalysis(eatResult);
      setAuthorityPlan(authorityResult);
      setTrustPlan(trustResult);
      
      toast.success("E-A-T analysis completed successfully!");
    } catch (error) {
      console.error('E-A-T analysis error:', error);
      toast.error("Failed to complete E-A-T analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const handleImplementRecommendation = (recommendation: string) => {
    if (onImplementRecommendation) {
      onImplementRecommendation(recommendation);
    }
    toast.success("Recommendation noted for implementation");
  };

  if (!eatAnalysis) {
    return (
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-neon-purple" />
            E-A-T Analysis
          </CardTitle>
          <CardDescription>
            Expertise, Authority, and Trustworthiness assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Button 
            onClick={runEATAnalysis} 
            disabled={isAnalyzing}
            className="bg-neon-purple hover:bg-neon-purple/80"
          >
            {isAnalyzing ? 'Analyzing...' : 'Start E-A-T Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* E-A-T Score Overview */}
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-neon-purple" />
              <CardTitle>E-A-T Score Overview</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runEATAnalysis}
              disabled={isAnalyzing}
              className="border-white/10 hover:bg-white/10"
            >
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={`text-2xl font-bold ${getScoreColor(eatAnalysis.score.overall)}`}>
                {eatAnalysis.score.overall}
              </div>
              <div className="text-xs text-white/60">Overall</div>
              <Progress value={eatAnalysis.score.overall} className="h-2" />
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`text-2xl font-bold ${getScoreColor(eatAnalysis.score.expertise)}`}>
                {eatAnalysis.score.expertise}
              </div>
              <div className="text-xs text-white/60">Expertise</div>
              <Progress value={eatAnalysis.score.expertise} className="h-2" />
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`text-2xl font-bold ${getScoreColor(eatAnalysis.score.authority)}`}>
                {eatAnalysis.score.authority}
              </div>
              <div className="text-xs text-white/60">Authority</div>
              <Progress value={eatAnalysis.score.authority} className="h-2" />
            </motion.div>
            
            <motion.div 
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={`text-2xl font-bold ${getScoreColor(eatAnalysis.score.trustworthiness)}`}>
                {eatAnalysis.score.trustworthiness}
              </div>
              <div className="text-xs text-white/60">Trust</div>
              <Progress value={eatAnalysis.score.trustworthiness} className="h-2" />
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-900/60">
          <TabsTrigger value="overview" className="data-[state=active]:bg-neon-purple/20">
            Overview
          </TabsTrigger>
          <TabsTrigger value="expertise" className="data-[state=active]:bg-neon-purple/20">
            Expertise
          </TabsTrigger>
          <TabsTrigger value="authority" className="data-[state=active]:bg-neon-purple/20">
            Authority
          </TabsTrigger>
          <TabsTrigger value="trust" className="data-[state=active]:bg-neon-purple/20">
            Trust
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Top Recommendations */}
          <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-blue" />
                Priority Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eatAnalysis.overallRecommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">{rec}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleImplementRecommendation(rec)}
                    className="text-neon-blue hover:text-white hover:bg-neon-blue/20"
                  >
                    Implement
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content Gaps */}
          {eatAnalysis.contentGaps.length > 0 && (
            <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Content Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eatAnalysis.contentGaps.map((gap, index) => (
                    <Alert key={index} className="border-orange-600/30 bg-orange-600/10">
                      <AlertDescription className="text-orange-200">
                        {gap}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expertise" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expertise Analysis */}
            <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-neon-purple" />
                  Expertise Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Expertise Level</span>
                  <Badge variant={getScoreBadgeVariant(eatAnalysis.expertise.score)}>
                    {eatAnalysis.expertise.expertiseLevel}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium">Present Indicators:</span>
                  {eatAnalysis.expertise.indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      {indicator}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expertise Recommendations */}
            <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <CardHeader>
                <CardTitle>Expertise Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eatAnalysis.expertise.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-sm">{rec}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-neon-purple hover:bg-neon-purple/20"
                      onClick={() => handleImplementRecommendation(rec)}
                    >
                      Implement
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authority" className="space-y-4">
          {authorityPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Authority Strategy */}
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-neon-blue" />
                    Authority Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/80 mb-4">{authorityPlan.overallStrategy}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Priority Actions:</h4>
                    {authorityPlan.priorityActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{action.title}</span>
                          <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/70">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Citation Recommendations */}
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-green-400" />
                    Citation Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {authorityPlan.citationRecommendations.slice(0, 4).map((citation, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{citation.title}</span>
                        <Badge variant={citation.authority === 'high' ? 'default' : 'secondary'}>
                          {citation.authority}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/70">{citation.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trust" className="space-y-4">
          {trustPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Trust Score Breakdown */}
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    Trust Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(trustPlan.overallTrustScore)}`}>
                      {trustPlan.overallTrustScore}
                    </div>
                    <div className="text-sm text-white/60">Overall Trust Score</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Transparency</span>
                        <span>{trustPlan.transparencyAudit.score}</span>
                      </div>
                      <Progress value={trustPlan.transparencyAudit.score} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Accuracy</span>
                        <span>{trustPlan.accuracyAudit.score}</span>
                      </div>
                      <Progress value={trustPlan.accuracyAudit.score} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Recommendations */}
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <CardHeader>
                  <CardTitle>Trust Improvements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trustPlan.recommendations.slice(0, 4).map((rec, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{rec.title}</span>
                        <div className="flex gap-1">
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline">
                            Impact: {rec.trustImpact}/10
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 mb-2">{rec.description}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-green-400 hover:bg-green-400/20"
                        onClick={() => handleImplementRecommendation(rec.implementation)}
                      >
                        Implement
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
