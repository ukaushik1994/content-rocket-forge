import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  FileText, 
  Users, 
  Lightbulb, 
  CheckCircle,
  AlertTriangle,
  Eye,
  Brain,
  Zap
} from 'lucide-react';
import { ComprehensiveSerpInsights } from '@/services/comprehensiveSerpAnalyzer';

interface ComprehensiveSerpAnalysisProps {
  insights: ComprehensiveSerpInsights;
  onSelectSection?: (section: string) => void;
}

export const ComprehensiveSerpAnalysis: React.FC<ComprehensiveSerpAnalysisProps> = ({
  insights,
  onSelectSection
}) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-500';
    if (difficulty < 30) return 'bg-green-500';
    if (difficulty < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Keyword Overview */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keyword Intelligence: {insights.keyword}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {insights.searchVolume?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Searches</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getDifficultyColor(insights.keywordDifficulty)}`} />
                  <div className="text-2xl font-bold">
                    {insights.keywordDifficulty || 'N/A'}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Keyword Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  ${insights.cpc?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Cost Per Click</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {insights.competitorAnalysis.averageWordCount}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Word Count</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Gaps Analysis */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Content Gap Opportunities ({insights.contentGaps.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              High-impact topics your competitors are missing
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.contentGaps.slice(0, 6).map((gap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${getOpportunityColor(gap.opportunity)}`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{gap.topic}</h4>
                    <p className="text-sm text-muted-foreground">{gap.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {gap.opportunity} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {gap.source}
                      </Badge>
                    </div>
                  </div>
                  {onSelectSection && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectSection(gap.topic)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Opportunities */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              FAQ Opportunities ({insights.faqOpportunities.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Questions users are asking that you should answer
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.faqOpportunities.slice(0, 6).map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
                >
                  <div className="flex-shrink-0 mt-1">
                    {faq.isAnswered ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{faq.question}</h4>
                    {faq.answer && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {faq.answer}
                      </p>
                    )}
                    <Badge variant="secondary" className="text-xs mt-1">
                      {faq.source}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Competitor Analysis */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.competitorAnalysis.topCompetitors.slice(0, 5).map((competitor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
                >
                  <Badge variant="outline" className="text-xs">
                    #{competitor.position}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{competitor.title}</h4>
                    <p className="text-xs text-muted-foreground">{competitor.domain}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ~{competitor.wordCount} words
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {competitor.headings?.length || 0} headings
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SEO Recommendations */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              SEO Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.seoRecommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-white/10"
                >
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{rec.recommendation}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{rec.implementation}</p>
                    <Badge variant="outline" className="text-xs mt-2">
                      {rec.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};