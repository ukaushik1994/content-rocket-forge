
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Users, 
  AlertTriangle,
  Trophy,
  BarChart3
} from 'lucide-react';
import { Opportunity } from '@/services/opportunityHunterService';

interface OpportunityMetricsProps {
  opportunities: Opportunity[];
}

export const OpportunityMetrics: React.FC<OpportunityMetricsProps> = ({
  opportunities
}) => {
  const getMetrics = () => {
    const total = opportunities.length;
    const newCount = opportunities.filter(o => o.status === 'new').length;
    const highPriority = opportunities.filter(o => o.priority === 'high').length;
    const aioFriendly = opportunities.filter(o => o.is_aio_friendly).length;
    const withCompetitorAnalysis = opportunities.filter(o => 
      o.competitor_analysis && o.competitor_analysis.length > 0
    ).length;
    const inProgress = opportunities.filter(o => o.status === 'in_progress').length;

    // Calculate average opportunity score
    const avgScore = opportunities.length > 0 
      ? Math.round(opportunities.reduce((sum, o) => sum + (o.opportunity_score || 0), 0) / opportunities.length)
      : 0;

    // Growth trend (mock calculation)
    const thisWeekCount = opportunities.filter(o => {
      const detected = new Date(o.detected_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return detected >= weekAgo;
    }).length;

    return {
      total,
      newCount,
      highPriority,
      aioFriendly,
      withCompetitorAnalysis,
      inProgress,
      avgScore,
      thisWeekCount
    };
  };

  const metrics = getMetrics();

  const metricCards = [
    {
      title: 'Total Opportunities',
      value: metrics.total,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'All discovered opportunities'
    },
    {
      title: 'New This Week',
      value: metrics.thisWeekCount,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Recently discovered'
    },
    {
      title: 'High Priority',
      value: metrics.highPriority,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      description: 'Requires immediate attention'
    },
    {
      title: 'AIO-Friendly',
      value: metrics.aioFriendly,
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'AI Overview optimized'
    },
    {
      title: 'Competitor Intel',
      value: metrics.withCompetitorAnalysis,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      description: 'With competitive analysis'
    },
    {
      title: 'In Progress',
      value: metrics.inProgress,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: 'Currently being worked on'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="border-white/10 bg-glass">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground mb-1 truncate">
                      {metric.title}
                    </p>
                    <p className="text-lg md:text-xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {metric.description}
                    </p>
                  </div>
                  <div className={`p-1.5 rounded-lg ${metric.bgColor} flex-shrink-0 ml-2`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="border-white/10 bg-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Opportunity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium">Status Distribution</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  New: {metrics.newCount}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                  In Progress: {metrics.inProgress}
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  Other: {metrics.total - metrics.newCount - metrics.inProgress}
                </Badge>
              </div>
            </div>

            {/* Quality Indicators */}
            <div className="space-y-3">
              <h4 className="font-medium">Quality Indicators</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Avg. Opportunity Score</span>
                  <Badge variant="outline">{metrics.avgScore}/100</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>AIO-Friendly Rate</span>
                  <Badge variant="outline">
                    {metrics.total > 0 ? Math.round((metrics.aioFriendly / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Intelligence Coverage */}
            <div className="space-y-3">
              <h4 className="font-medium">Intelligence Coverage</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Competitor Analysis</span>
                  <Badge variant="outline">
                    {metrics.total > 0 ? Math.round((metrics.withCompetitorAnalysis / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>High Priority Rate</span>
                  <Badge variant="outline">
                    {metrics.total > 0 ? Math.round((metrics.highPriority / metrics.total) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
