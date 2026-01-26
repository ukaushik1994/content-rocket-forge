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
  BarChart3,
  Sparkles
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

  const getHealthStyles = (status: string) => {
    const styles: Record<string, { badge: string; icon: typeof CheckCircle2 }> = {
      on_track: { badge: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle2 },
      at_risk: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: AlertTriangle },
      overdue: { badge: 'bg-red-500/10 text-red-400 border-red-500/30', icon: Clock },
      unknown: { badge: 'bg-muted/20 text-muted-foreground border-border', icon: Target },
    };
    return styles[status] || styles.unknown;
  };

  const healthStyle = getHealthStyles(timelineHealth?.status || 'unknown');
  const HealthIcon = healthStyle.icon;

  const metrics = [
    { 
      label: 'Content', 
      value: contentInventory?.total || 0, 
      subValue: `${contentInventory?.byStatus?.published || 0} published`,
      icon: FileText, 
      color: 'blue' 
    },
    { 
      label: 'Views', 
      value: performance?.totalViews || 0, 
      subValue: `${performance?.engagementRate || 0}% engagement`,
      icon: Eye, 
      color: 'green',
      showTrend: true
    },
    { 
      label: 'Clicks', 
      value: performance?.totalClicks || 0, 
      icon: MousePointerClick, 
      color: 'purple' 
    },
    { 
      label: 'Conversions', 
      value: performance?.totalConversions || 0, 
      icon: TrendingUp, 
      color: 'amber' 
    },
  ];

  const getMetricStyles = (color: string) => {
    const styles: Record<string, string> = {
      blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
      green: 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
      purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
      amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
    };
    return styles[color] || styles.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Campaign Header Card */}
      <Card className="relative overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
        
        <div className="relative">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{campaign.name}</h3>
                {campaign.solution_name && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {campaign.solution_name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline"
                className={cn("font-medium", healthStyle.badge)}
              >
                <HealthIcon className="w-3 h-3 mr-1" />
                {(timelineHealth?.status || 'unknown').replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className="capitalize font-medium">
                {campaign.status}
              </Badge>
            </div>
          </div>

          {/* Objective */}
          {campaign.objective && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {campaign.objective}
            </p>
          )}

          {/* Timeline Progress */}
          {timelineHealth && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Campaign Progress</span>
                <span className="font-semibold text-primary">{timelineHealth.completionPercentage}%</span>
              </div>
              <Progress value={timelineHealth.completionPercentage} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onViewCampaign && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onViewCampaign}
                className="text-xs h-8"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                View Campaign
              </Button>
            )}
            {onGenerateContent && queueStatus && queueStatus.pending > 0 && (
              <Button 
                size="sm" 
                onClick={onGenerateContent}
                className="text-xs h-8 bg-primary hover:bg-primary/90"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Generate Content ({queueStatus.pending})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            className={cn(
              "p-4 rounded-xl bg-gradient-to-br border backdrop-blur-sm",
              getMetricStyles(metric.color)
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4" />
              <span className="text-xs opacity-70">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
            {metric.subValue && (
              <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                {metric.showTrend && <ArrowUpRight className="w-3 h-3" />}
                <span>{metric.subValue}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Queue Status Mini */}
      {queueStatus && queueStatus.total > 0 && (
        <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Generation Queue</h4>
            <span className="text-xs text-muted-foreground ml-auto">
              {queueStatus.completed}/{queueStatus.total} complete
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Pending', value: queueStatus.pending, color: 'amber' },
              { label: 'Processing', value: queueStatus.processing, color: 'blue' },
              { label: 'Completed', value: queueStatus.completed, color: 'green' },
              { label: 'Failed', value: queueStatus.failed, color: 'red' },
            ].map((item) => (
              <div 
                key={item.label}
                className={cn(
                  "text-center p-2 rounded-lg",
                  `bg-${item.color}-500/10`
                )}
              >
                <p className={cn("text-lg font-bold", `text-${item.color}-400`)}>{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Content Format Tags */}
      {contentInventory && Object.keys(contentInventory.byFormat || {}).length > 0 && (
        <Card className="p-4 bg-card/60 backdrop-blur-sm border border-border/50">
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

      {/* Blockers Alert */}
      {timelineHealth?.blockers && timelineHealth.blockers.length > 0 && (
        <Card className="p-4 bg-amber-500/5 border-amber-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-amber-400">
              Blockers ({timelineHealth.blockers.length})
            </h4>
          </div>
          
          <ul className="space-y-1.5">
            {timelineHealth.blockers.map((blocker, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </motion.div>
  );
};
