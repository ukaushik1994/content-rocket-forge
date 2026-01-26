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
  Zap,
  Sparkles
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

  const statusItems = [
    { key: 'pending', label: 'Pending', value: data.pending, icon: Clock, color: 'amber' },
    { key: 'processing', label: 'Processing', value: data.processing, icon: Loader2, color: 'blue' },
    { key: 'completed', label: 'Completed', value: data.completed, icon: CheckCircle2, color: 'green' },
    { key: 'failed', label: 'Failed', value: data.failed, icon: XCircle, color: 'red' },
  ];

  const getStatusStyles = (color: string) => {
    const styles: Record<string, string> = {
      amber: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400',
      blue: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
      green: 'bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20 text-green-400',
      red: 'bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    };
    return styles[color] || styles.blue;
  };

  const isComplete = data.completed === data.total && data.total > 0;
  const hasFailures = data.failed > 0;
  const isProcessing = data.processing > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Main Card */}
      <Card className="relative overflow-hidden bg-card/80 backdrop-blur-md border border-border/50 p-6">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 pointer-events-none" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{data.campaignName}</h3>
                <p className="text-sm text-muted-foreground">Content Generation Queue</p>
              </div>
            </div>
            
            <Badge 
              variant="outline"
              className={cn(
                "px-3 py-1 font-medium",
                isComplete 
                  ? "bg-green-500/10 text-green-400 border-green-500/30" 
                  : hasFailures 
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : isProcessing
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-muted/20 text-muted-foreground border-border"
              )}
            >
              {isComplete ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Complete
                </>
              ) : hasFailures ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Has Failures
                </>
              ) : isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  In Progress
                </>
              ) : (
                'Queued'
              )}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-primary">{completionPercentage}%</span>
            </div>
            <div className="relative">
              <Progress value={completionPercentage} className="h-3" />
              {isProcessing && (
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '50%' }}
                />
              )}
            </div>
            {data.estimatedCompletionMinutes && isProcessing && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Estimated: ~{data.estimatedCompletionMinutes} minute{data.estimatedCompletionMinutes !== 1 ? 's' : ''} remaining
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
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "p-3 rounded-xl border backdrop-blur-sm text-center",
                  getStatusStyles(item.color)
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <item.icon className={cn(
                    "w-4 h-4",
                    item.key === 'processing' && "animate-spin"
                  )} />
                </div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs opacity-70">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      {/* Processing Items */}
      {data.processingDetails && data.processingDetails.length > 0 && (
        <Card className="p-4 bg-blue-500/5 border-blue-500/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <h4 className="text-sm font-medium text-blue-400">Currently Processing</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.processingDetails.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-blue-500/5"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="capitalize truncate">{item.asset_type.replace(/_/g, ' ')}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Failed Items */}
      {data.failedItems && data.failedItems.length > 0 && (
        <Card className="p-4 bg-red-500/5 border-red-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-medium text-red-400">
                Failed Items ({data.failedItems.length})
              </h4>
            </div>
            {onRetryFailed && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onRetryFailed}
                className="h-8 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry All
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.failedItems.slice(0, 5).map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize text-foreground">
                    {item.asset_type.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs border-red-500/30 text-red-400 bg-red-500/10">
                    {item.retry_count} {item.retry_count === 1 ? 'retry' : 'retries'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.error_message || 'Unknown error occurred'}
                </p>
              </motion.div>
            ))}
            {data.failedItems.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{data.failedItems.length - 5} more failed items
              </p>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};
