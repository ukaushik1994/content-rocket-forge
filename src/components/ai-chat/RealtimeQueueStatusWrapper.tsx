import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CampaignQueueStatus } from './CampaignQueueStatus';
import { useRealtimeQueueStatus } from '@/hooks/useRealtimeQueueStatus';
import { cn } from '@/lib/utils';

interface RealtimeQueueStatusWrapperProps {
  initialData: {
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
  };
  onRetryFailed?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
}

export const RealtimeQueueStatusWrapper: React.FC<RealtimeQueueStatusWrapperProps> = ({
  initialData,
  onRetryFailed,
  onSuggestionClick
}) => {
  const { status, loading } = useRealtimeQueueStatus(initialData.campaignId);

  // Merge real-time data with initial data (preserving details like failedItems from initial)
  const mergedData = status ? {
    ...initialData,
    total: status.total,
    pending: status.pending,
    processing: status.processing,
    completed: status.completed,
    failed: status.failed,
  } : initialData;

  const isLive = status?.isActive;

  return (
    <div className="relative">
      {/* Live indicator */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-2 right-2 z-10"
          >
            <Badge 
              variant="outline" 
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium",
                "bg-green-500/10 text-green-400 border-green-500/30",
                "flex items-center gap-1"
              )}
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Radio className="w-2.5 h-2.5" />
              </motion.div>
              LIVE
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay for initial fetch */}
      {loading && !status && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg z-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}

      {/* Queue status component */}
      <CampaignQueueStatus
        data={mergedData}
        onRetryFailed={onRetryFailed}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  );
};
