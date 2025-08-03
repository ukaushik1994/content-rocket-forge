
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BriefModal } from './BriefModal';
import { type Opportunity } from '@/services/opportunityHunterService';
import { opportunityHunterService } from '@/services/opportunityHunterService';
import { toast } from 'sonner';
import { 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Eye,
  Search,
  Target,
  Trash2,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onGenerateBrief: () => void;
  onUpdateStatus: (status: string) => void;
  onAddToCalendar: (date: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onGenerateBrief,
  onUpdateStatus,
  onAddToCalendar
}) => {
  const [showBrief, setShowBrief] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const handleGenerateBrief = async () => {
    try {
      setIsGeneratingBrief(true);
      await opportunityHunterService.generateBrief(opportunity.id);
      toast.success('Content brief generated successfully');
      setShowBrief(true);
    } catch (error) {
      console.error('Error generating brief:', error);
      toast.error('Failed to generate content brief');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleStatusChange = (status: string) => {
    onUpdateStatus(status);
  };

  const handleAddToCalendar = async () => {
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7); // Schedule for next week
    onAddToCalendar(scheduledDate.toISOString().split('T')[0]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'scheduled':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'published':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      <Card className="border-white/10 bg-glass hover:border-neon-purple/30 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{opportunity.keyword}</CardTitle>
              <CardDescription className="text-sm">
                {opportunity.suggested_title || `Content opportunity for "${opportunity.keyword}"`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(opportunity.priority)}>
                {opportunity.priority}
              </Badge>
              <Badge className={getStatusColor(opportunity.status)}>
                {opportunity.status.replace('_', ' ')}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onGenerateBrief}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Brief
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddToCalendar}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('dismissed')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Dismiss
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('dismissed')}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-medium">{opportunity.search_volume?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium">{opportunity.keyword_difficulty || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon(opportunity.trend_direction || 'stable')}
              <span className="text-muted-foreground">Trend:</span>
              <span className="font-medium capitalize">{opportunity.trend_direction || 'stable'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Score:</span>
              <span className="font-medium">{opportunity.opportunity_score || 'N/A'}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {opportunity.content_format || 'blog'}
            </Badge>
            {opportunity.is_aio_friendly && (
              <Badge variant="outline" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                AIO Friendly
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {opportunity.source || 'serp_analysis'}
            </Badge>
          </div>

          {/* Detection Date */}
          <div className="text-xs text-muted-foreground">
            Detected {format(new Date(opportunity.detected_at), 'MMM d, yyyy')}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              onClick={onGenerateBrief}
              className="bg-neon-purple/20 hover:bg-neon-purple/30 text-neon-purple border border-neon-purple/30"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Brief
            </Button>
            {opportunity.opportunity_briefs && opportunity.opportunity_briefs.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowBrief(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Brief
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brief Modal */}
      {showBrief && (
        <BriefModal
          opportunity={opportunity}
          isOpen={showBrief}
          onClose={() => setShowBrief(false)}
        />
      )}
    </>
  );
};
