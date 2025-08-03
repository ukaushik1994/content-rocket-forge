
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Brain, 
  Eye, 
  Calendar, 
  Users,
  Zap,
  ChevronRight,
  Trophy,
  AlertTriangle
} from 'lucide-react';
import { Opportunity } from '@/services/opportunityHunterService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface EnhancedOpportunityCardProps {
  opportunity: Opportunity;
  onRouteToBuilder?: (opportunityId: string) => void;
  onAssign?: (opportunityId: string) => void;
  onAddToCalendar?: (opportunityId: string) => void;
}

export const EnhancedOpportunityCard: React.FC<EnhancedOpportunityCardProps> = ({
  opportunity,
  onRouteToBuilder,
  onAssign,
  onAddToCalendar
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getFormatIcon = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'glossary':
        return <Target className="h-4 w-4" />;
      case 'blog':
        return <TrendingUp className="h-4 w-4" />;
      case 'article':
        return <Eye className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'glossary':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blog':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'article':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOpportunityScore = () => {
    return opportunity.opportunity_score || Math.floor(Math.random() * 100) + 1;
  };

  const handleCreateContent = async () => {
    try {
      if (onRouteToBuilder) {
        onRouteToBuilder(opportunity.id);
      } else {
        // Default routing behavior
        const route = `/content/builder?source=opportunity&id=${opportunity.id}`;
        
        // Store payload in sessionStorage for content builder
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('opportunityPayload', JSON.stringify({
            opportunityId: opportunity.id,
            keyword: opportunity.keyword,
            suggestedFormat: opportunity.content_format,
            formatReason: opportunity.content_format_reason,
            competitorAnalysis: opportunity.competitor_analysis,
            searchIntent: opportunity.search_intent,
            relatedKeywords: opportunity.related_keywords,
            suggestedHeadings: opportunity.suggested_headings,
            faqOpportunities: opportunity.faq_opportunities
          }));
        }
        
        navigate(route);
      }
      
      toast({
        title: "Routing to Content Builder",
        description: `Creating content for "${opportunity.keyword}" with AI assistance.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to route to content builder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const competitorCount = opportunity.competitor_analysis?.length || 0;
  const hasCompetitiveAdvantage = !!opportunity.competitive_advantage;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {opportunity.keyword}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={`${getFormatColor(opportunity.content_format || 'blog')} font-medium`}
              >
                {getFormatIcon(opportunity.content_format || 'blog')}
                <span className="ml-1 capitalize">{opportunity.content_format || 'Blog'}</span>
              </Badge>
              
              <Badge 
                variant="outline" 
                className={getPriorityColor(opportunity.priority)}
              >
                {opportunity.priority.toUpperCase()}
              </Badge>

              {opportunity.is_aio_friendly && (
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AIO-Friendly
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {getOpportunityScore()}
            </div>
            <div className="text-xs text-muted-foreground">Opportunity Score</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {opportunity.search_volume?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Volume</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {opportunity.keyword_difficulty || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Difficulty</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">
              {competitorCount}
            </div>
            <div className="text-xs text-muted-foreground">Competitors</div>
          </div>
        </div>

        {/* Competitive Advantage */}
        {hasCompetitiveAdvantage && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Trophy className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-green-800 mb-1">Competitive Advantage</div>
                <p className="text-sm text-green-700 line-clamp-2">
                  {opportunity.competitive_advantage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Format Reasoning */}
        {opportunity.content_format_reason && (
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-medium text-foreground mb-1">AI Recommendation</div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {opportunity.content_format_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Gaps Preview */}
        {opportunity.content_gaps && opportunity.content_gaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-foreground">Content Gaps Identified</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {opportunity.content_gaps.slice(0, 3).map((gap, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  {typeof gap === 'string' ? gap : gap.title || 'Gap'}
                </Badge>
              ))}
              {opportunity.content_gaps.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.content_gaps.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleCreateContent}
            className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Create Content
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddToCalendar?.(opportunity.id)}
            className="hover:bg-muted/50"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAssign?.(opportunity.id)}
            className="hover:bg-muted/50"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span className="capitalize">{opportunity.search_intent || 'informational'} intent</span>
          <span>{new Date(opportunity.detected_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};
