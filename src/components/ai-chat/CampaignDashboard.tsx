import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target,
  Eye,
  MousePointerClick,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ExternalLink,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignDashboardData {
  campaign: {
    id: string;
    name: string;
    status: string;
    objective: string | null;
    timeline: string | null;
    solution_name: string | null;
  };
  queueStatus?: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  contentInventory?: {
    total: number;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
  };
  performance?: {
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    engagementRate: number;
  };
  timelineHealth?: {
    status: 'on_track' | 'at_risk' | 'overdue' | 'unknown';
    completionPercentage: number;
    blockers: string[];
  };
}

interface CampaignDashboardProps {
  data: CampaignDashboardData;
  onViewCampaign?: () => void;
  onGenerateContent?: () => void;
}

export const CampaignDashboard: React.FC<CampaignDashboardProps> = ({
  data,
  onViewCampaign,
  onGenerateContent
}) => {
  const { campaign, queueStatus, contentInventory, performance, timelineHealth } = data;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'at_risk': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'on_track': return CheckCircle2;
      case 'at_risk': return AlertTriangle;
      case 'overdue': return Clock;
      default: return Target;
    }
  };

  const HealthIcon = getHealthIcon(timelineHealth?.status || 'unknown');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Campaign Header */}
      <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{campaign.name}</h3>
                {campaign.solution_name && (
                  <p className="text-sm text-muted-foreground">
                    Solution: {campaign.solution_name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={getHealthColor(timelineHealth?.status || 'unknown')}
              >
                <HealthIcon className="w-3 h-3 mr-1" />
                {timelineHealth?.status?.replace('_', ' ') || 'Unknown'}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {campaign.status}
              </Badge>
            </div>
          </div>

          {campaign.objective && (
            <p className="text-sm text-muted-foreground mb-4">
              {campaign.objective}
            </p>
          )}

          {/* Timeline Health Progress */}
          {timelineHealth && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Campaign Progress</span>
                <span className="font-medium text-primary">{timelineHealth.completionPercentage}%</span>
              </div>
              <Progress value={timelineHealth.completionPercentage} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {onViewCampaign && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onViewCampaign}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Campaign
              </Button>
            )}
            {onGenerateContent && queueStatus && queueStatus.pending > 0 && (
              <Button 
                size="sm" 
                onClick={onGenerateContent}
                className="text-xs bg-primary/90 hover:bg-primary"
              >
                <Zap className="w-3 h-3 mr-1" />
                Generate Content
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Content Count */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Content</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{contentInventory?.total || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {contentInventory?.byStatus?.published || 0} published
          </p>
        </motion.div>

        {/* Views */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Views</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {performance?.totalViews?.toLocaleString() || 0}
          </p>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{performance?.engagementRate || 0}% engagement</span>
          </div>
        </motion.div>

        {/* Clicks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-muted-foreground">Clicks</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {performance?.totalClicks?.toLocaleString() || 0}
          </p>
        </motion.div>

        {/* Conversions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {performance?.totalConversions?.toLocaleString() || 0}
          </p>
        </motion.div>
      </div>

      {/* Queue Status Summary */}
      {queueStatus && queueStatus.total > 0 && (
        <Card className="p-4 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-violet-400" />
            <h4 className="text-sm font-medium text-violet-400">Generation Queue</h4>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded bg-amber-500/10">
              <p className="text-lg font-bold text-amber-400">{queueStatus.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center p-2 rounded bg-blue-500/10">
              <p className="text-lg font-bold text-blue-400">{queueStatus.processing}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
            <div className="text-center p-2 rounded bg-green-500/10">
              <p className="text-lg font-bold text-green-400">{queueStatus.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-2 rounded bg-red-500/10">
              <p className="text-lg font-bold text-red-400">{queueStatus.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
      )}

      {/* Content Format Distribution */}
      {contentInventory && Object.keys(contentInventory.byFormat || {}).length > 0 && (
        <Card className="p-4 bg-muted/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Content by Format</h4>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(contentInventory.byFormat).map(([format, count]) => (
              <Badge 
                key={format} 
                variant="secondary"
                className="capitalize"
              >
                {format.replace(/_/g, ' ')}: {count}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Blockers */}
      {timelineHealth?.blockers && timelineHealth.blockers.length > 0 && (
        <Card className="p-4 bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-amber-400">Blockers</h4>
          </div>
          
          <ul className="space-y-1">
            {timelineHealth.blockers.map((blocker, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-400">•</span>
                {blocker}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  );
};
