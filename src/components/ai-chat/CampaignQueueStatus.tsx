import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RefreshCw,
  AlertTriangle,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueStatusData {
  campaignId: string;
  campaignName: string;
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  failedItems?: Array<{
    id: string;
    asset_type: string;
    error_message: string;
    retry_count: number;
  }>;
  estimatedCompletionMinutes: number | null;
  processingDetails?: Array<{
    id: string;
    asset_type: string;
  }>;
}

interface CampaignQueueStatusProps {
  data: QueueStatusData;
  onRetryFailed?: () => void;
}

export const CampaignQueueStatus: React.FC<CampaignQueueStatusProps> = ({
  data,
  onRetryFailed
}) => {
  const completionPercentage = data.total > 0 
    ? Math.round((data.completed / data.total) * 100) 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400';
      case 'processing': return 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400';
      case 'completed': return 'from-green-500/20 to-green-500/5 border-green-500/30 text-green-400';
      case 'failed': return 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400';
      default: return 'from-muted/20 to-muted/5 border-muted/30 text-muted-foreground';
    }
  };

  const statusItems = [
    { key: 'pending', label: 'Pending', value: data.pending, icon: Clock },
    { key: 'processing', label: 'Processing', value: data.processing, icon: Loader2 },
    { key: 'completed', label: 'Completed', value: data.completed, icon: CheckCircle2 },
    { key: 'failed', label: 'Failed', value: data.failed, icon: XCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header */}
      <Card className="relative overflow-hidden glass-panel bg-glass border border-white/10 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{data.campaignName}</h3>
                <p className="text-sm text-muted-foreground">Content Generation Queue</p>
              </div>
            </div>
            
            <Badge 
              variant="secondary"
              className={cn(
                "px-3 py-1",
                data.processing > 0 
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30" 
                  : data.failed > 0 
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-green-500/20 text-green-400 border-green-500/30"
              )}
            >
              {data.processing > 0 ? 'In Progress' : data.failed > 0 ? 'Has Failures' : 'Complete'}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-violet-400">{completionPercentage}%</span>
            </div>
            <div className="relative">
              <Progress value={completionPercentage} className="h-3" />
              {data.processing > 0 && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '30%' }}
                />
              )}
            </div>
            {data.estimatedCompletionMinutes && data.processing > 0 && (
              <p className="text-xs text-muted-foreground">
                Estimated completion: ~{data.estimatedCompletionMinutes} minute{data.estimatedCompletionMinutes !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-4 gap-3">
            {statusItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-3 rounded-lg bg-gradient-to-br border backdrop-blur-md",
                  getStatusColor(item.key)
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className={cn(
                    "w-4 h-4",
                    item.key === 'processing' && "animate-spin"
                  )} />
                  <span className="text-xs opacity-80">{item.label}</span>
                </div>
                <p className="text-xl font-bold">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Processing Items */}
      {data.processingDetails && data.processingDetails.length > 0 && (
        <Card className="p-4 bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <h4 className="text-sm font-medium text-blue-400">Currently Processing</h4>
          </div>
          <div className="space-y-2">
            {data.processingDetails.map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="capitalize">{item.asset_type.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Failed Items */}
      {data.failedItems && data.failedItems.length > 0 && (
        <Card className="p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-medium text-red-400">Failed Items</h4>
            </div>
            {onRetryFailed && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onRetryFailed}
                className="h-7 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry All
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {data.failedItems.slice(0, 5).map((item) => (
              <div 
                key={item.id}
                className="p-2 rounded bg-red-500/5 border border-red-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {item.asset_type.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                    {item.retry_count} retries
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {item.error_message || 'Unknown error'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
};
