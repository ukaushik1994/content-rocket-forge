import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  ArrowRight,
  Zap,
  Calendar
} from 'lucide-react';
import { useKeywordRecommendations, useContentGapAnalysis, useSeasonalSuggestions } from '@/hooks/useKeywordRecommendations';
import { UnifiedKeyword } from '@/services/keywordLibraryService';

interface OpportunityAlert {
  id: string;
  type: 'high_opportunity' | 'stale_data' | 'content_gap' | 'seasonal' | 'competition_drop';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  keyword?: UnifiedKeyword;
  metadata?: any;
  created_at: string;
}

interface KeywordOpportunityAlertsProps {
  className?: string;
  onKeywordSelect?: (keywordId: string) => void;
  onCreateContent?: (keyword: UnifiedKeyword) => void;
}

export const KeywordOpportunityAlerts: React.FC<KeywordOpportunityAlertsProps> = ({
  className = '',
  onKeywordSelect,
  onCreateContent
}) => {
  const { recommendations, loading: recLoading } = useKeywordRecommendations();
  const { analysis, loading: gapLoading } = useContentGapAnalysis();
  const { suggestions, loading: seasonalLoading } = useSeasonalSuggestions();
  const [alerts, setAlerts] = useState<OpportunityAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateAlerts();
  }, [recommendations, analysis, suggestions]);

  const generateAlerts = () => {
    const newAlerts: OpportunityAlert[] = [];

    // High opportunity keyword alerts
    recommendations
      .filter(rec => rec.opportunityScore >= 80)
      .slice(0, 3)
      .forEach((rec, index) => {
        newAlerts.push({
          id: `high-opp-${rec.keyword.id}`,
          type: 'high_opportunity',
          title: `High Opportunity: ${rec.keyword.keyword}`,
          description: `${rec.opportunityScore}% opportunity score with ${rec.keyword.search_volume || 'unknown'} monthly searches`,
          priority: 'high',
          actionable: true,
          keyword: rec.keyword,
          metadata: { recommendedContentType: rec.recommendedContentType },
          created_at: new Date().toISOString()
        });
      });

    // Content gap alerts
    if (analysis && analysis.gapKeywords.length > 0) {
      newAlerts.push({
        id: 'content-gaps',
        type: 'content_gap',
        title: `${analysis.gapKeywords.length} Content Gaps Found`,
        description: `${analysis.opportunityScore}% of your strategy keywords lack dedicated content`,
        priority: analysis.opportunityScore > 50 ? 'high' : 'medium',
        actionable: true,
        metadata: { gapCount: analysis.gapKeywords.length },
        created_at: new Date().toISOString()
      });
    }

    // Seasonal opportunity alerts
    suggestions
      .filter(sugg => sugg.priority === 'high')
      .slice(0, 2)
      .forEach((sugg) => {
        newAlerts.push({
          id: `seasonal-${sugg.id}`,
          type: 'seasonal',
          title: `Seasonal Opportunity: ${sugg.keyword_focus}`,
          description: sugg.reasoning,
          priority: 'medium',
          actionable: true,
          metadata: { suggestedDate: sugg.suggested_date, contentType: sugg.content_type },
          created_at: new Date().toISOString()
        });
      });

    // Stale data alerts (simulated based on keyword freshness)
    const staleKeywords = recommendations.filter(rec => 
      !rec.keyword.serp_last_updated || 
      new Date(rec.keyword.serp_last_updated) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (staleKeywords.length > 5) {
      newAlerts.push({
        id: 'stale-data',
        type: 'stale_data',
        title: `${staleKeywords.length} Keywords Need Data Refresh`,
        description: 'Your keyword metrics may be outdated. Refresh for accurate opportunities.',
        priority: 'low',
        actionable: true,
        metadata: { staleCount: staleKeywords.length },
        created_at: new Date().toISOString()
      });
    }

    // Filter out dismissed alerts
    const filteredAlerts = newAlerts.filter(alert => !dismissedAlerts.has(alert.id));
    
    // Sort by priority and date
    filteredAlerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setAlerts(filteredAlerts);
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleAlertAction = (alert: OpportunityAlert) => {
    switch (alert.type) {
      case 'high_opportunity':
        if (alert.keyword && onCreateContent) {
          onCreateContent(alert.keyword);
        }
        break;
      case 'content_gap':
        // Navigate to gap analysis or content creation
        break;
      case 'seasonal':
        // Navigate to calendar or content creation
        break;
      case 'stale_data':
        // Trigger bulk refresh
        break;
    }
  };

  const getAlertIcon = (type: OpportunityAlert['type']) => {
    switch (type) {
      case 'high_opportunity':
        return <TrendingUp className="h-4 w-4" />;
      case 'content_gap':
        return <Target className="h-4 w-4" />;
      case 'seasonal':
        return <Calendar className="h-4 w-4" />;
      case 'stale_data':
        return <Clock className="h-4 w-4" />;
      case 'competition_drop':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const loading = recLoading || gapLoading || seasonalLoading;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Opportunity Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Opportunity Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary">{alerts.length}</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No alerts at the moment</p>
            <p className="text-xs text-muted-foreground">Your keyword strategy is on track!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="relative">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <AlertDescription className="text-xs mt-1">
                            {alert.description}
                          </AlertDescription>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      
                      {alert.actionable && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert)}
                            className="text-xs"
                          >
                            Take Action
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDismissAlert(alert.id)}
                            className="text-xs"
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};