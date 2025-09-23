import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  Search, 
  Target, 
  Users, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Zap,
  Brain,
  MessageCircle,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink
} from 'lucide-react';
import { SerpQueryResult } from '@/services/serpQueryIntelligence';

interface VisualSerpRendererProps {
  serpData: SerpQueryResult[];
  onAction?: (action: string, data?: any) => void;
}

interface SerpMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: string;
}

const SerpMetricCard: React.FC<SerpMetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'primary' 
}) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-xs ${
                change.type === 'increase' ? 'text-green-500' : 'text-red-500'
              }`}>
                {change.type === 'increase' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {change.value}%
              </div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface KeywordTrendChartProps {
  data: SerpQueryResult[];
}

const KeywordTrendChart: React.FC<KeywordTrendChartProps> = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Keyword Performance Overview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data.slice(0, 5).map((result, index) => (
          <div key={result.keyword} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{result.keyword}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Search className="h-3 w-3" />
                {result.data.searchVolume?.toLocaleString() || 'N/A'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={result.data.keywordDifficulty || 0} 
                className="flex-1 h-2" 
              />
              <Badge variant={
                (result.data.keywordDifficulty || 0) > 70 ? 'destructive' :
                (result.data.keywordDifficulty || 0) > 40 ? 'secondary' : 'default'
              }>
                {result.data.keywordDifficulty || 0}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface ContentOpportunityProps {
  serpData: SerpQueryResult[];
  onAction?: (action: string, data?: any) => void;
}

const ContentOpportunityPanel: React.FC<ContentOpportunityProps> = ({ serpData, onAction }) => {
  const allContentGaps = serpData.flatMap(result => 
    result.data.contentGaps?.map(gap => ({
      ...gap,
      keyword: result.keyword
    })) || []
  );

  const topOpportunities = allContentGaps.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Content Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {topOpportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{opportunity.topic}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{opportunity.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {opportunity.keyword}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAction?.('create-content', { 
                      topic: opportunity.topic,
                      keyword: opportunity.keyword,
                      description: opportunity.description
                    })}
                  >
                    <Zap className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        
        {topOpportunities.length > 0 && (
          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onAction?.('bulk-content-creation', { opportunities: topOpportunities })}
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Content Strategy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface QuestionAnalysisProps {
  serpData: SerpQueryResult[];
  onAction?: (action: string, data?: any) => void;
}

const QuestionAnalysisPanel: React.FC<QuestionAnalysisProps> = ({ serpData, onAction }) => {
  const allQuestions = serpData.flatMap(result => 
    result.data.questions?.map(q => ({
      ...q,
      keyword: result.keyword
    })) || []
  );

  const topQuestions = allQuestions.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Popular Questions ({allQuestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {topQuestions.map((question, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg border bg-background/30 hover:bg-background/60 transition-colors cursor-pointer"
                onClick={() => onAction?.('analyze-question', { 
                  question: question.question,
                  keyword: question.keyword
                })}
              >
                <p className="text-sm font-medium">{question.question}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {question.keyword}
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        
        {topQuestions.length > 0 && (
          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => onAction?.('faq-generation', { questions: topQuestions })}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate FAQ Content
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CompetitorInsightsProps {
  serpData: SerpQueryResult[];
  onAction?: (action: string, data?: any) => void;
}

const CompetitorInsightsPanel: React.FC<CompetitorInsightsProps> = ({ serpData, onAction }) => {
  const topCompetitors = serpData.flatMap(result => 
    result.data.serp_blocks?.organic?.slice(0, 3) || []
  ).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Top Ranking Content
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCompetitors.map((competitor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg border bg-background/30 hover:bg-background/60 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{competitor.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {competitor.snippet}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 text-xs h-6"
                    onClick={() => onAction?.('analyze-competitor', { competitor })}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const VisualSerpRenderer: React.FC<VisualSerpRendererProps> = ({ serpData, onAction }) => {
  if (!serpData || serpData.length === 0) {
    return null;
  }

  // Calculate aggregate metrics
  const totalSearchVolume = serpData.reduce((sum, result) => 
    sum + (result.data.searchVolume || 0), 0
  );
  
  const avgDifficulty = serpData.reduce((sum, result) => 
    sum + (result.data.keywordDifficulty || 0), 0
  ) / serpData.length;

  const totalOpportunities = serpData.reduce((sum, result) => 
    sum + (result.data.contentGaps?.length || 0), 0
  );

  const totalQuestions = serpData.reduce((sum, result) => 
    sum + (result.data.questions?.length || 0), 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">SERP Intelligence Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Real-time data for {serpData.length} keyword{serpData.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SerpMetricCard
          title="Total Search Volume"
          value={totalSearchVolume.toLocaleString()}
          icon={<TrendingUp className="h-4 w-4" />}
          color="primary"
        />
        <SerpMetricCard
          title="Avg. Difficulty"
          value={`${Math.round(avgDifficulty)}%`}
          icon={<Target className="h-4 w-4" />}
          color="secondary"
        />
        <SerpMetricCard
          title="Content Gaps"
          value={totalOpportunities}
          icon={<Lightbulb className="h-4 w-4" />}
          color="accent"
        />
        <SerpMetricCard
          title="Questions Found"
          value={totalQuestions}
          icon={<MessageCircle className="h-4 w-4" />}
          color="primary"
        />
      </div>

      {/* Main Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keyword Performance */}
        <KeywordTrendChart data={serpData} />
        
        {/* Content Opportunities */}
        <ContentOpportunityPanel serpData={serpData} onAction={onAction} />
        
        {/* Question Analysis */}
        <QuestionAnalysisPanel serpData={serpData} onAction={onAction} />
        
        {/* Competitor Insights */}
        <CompetitorInsightsPanel serpData={serpData} onAction={onAction} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <Button 
          onClick={() => onAction?.('comprehensive-analysis', { serpData })}
          className="flex-1 min-w-[200px]"
        >
          <Brain className="h-4 w-4 mr-2" />
          Generate Strategy Report
        </Button>
        <Button 
          variant="outline"
          onClick={() => onAction?.('export-serp-data', { serpData })}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export Data
        </Button>
        <Button 
          variant="outline"
          onClick={() => onAction?.('monitor-keywords', { keywords: serpData.map(s => s.keyword) })}
        >
          <Eye className="h-4 w-4 mr-2" />
          Monitor Changes
        </Button>
      </div>
    </motion.div>
  );
};