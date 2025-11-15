import React, { useState, useEffect } from 'react';
import { CampaignAsset } from '@/types/asset-types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

interface AssetGenerationQueueProps {
  assets: CampaignAsset[];
  onComplete: (results: { completed: CampaignAsset[]; failed: CampaignAsset[] }) => void;
  onCancel?: () => void;
}

export const AssetGenerationQueue = ({ 
  assets, 
  onComplete,
  onCancel 
}: AssetGenerationQueueProps) => {
  const [queue, setQueue] = useState<CampaignAsset[]>(assets);
  const [currentAsset, setCurrentAsset] = useState<CampaignAsset | null>(null);
  const [completedAssets, setCompletedAssets] = useState<CampaignAsset[]>([]);
  const [failedAssets, setFailedAssets] = useState<CampaignAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  
  useEffect(() => {
    const processNext = async () => {
      if (queue.length === 0 && !currentAsset) {
        setIsGenerating(false);
        onComplete({ completed: completedAssets, failed: failedAssets });
        return;
      }
      
      if (currentAsset) return;
      
      if (queue.length > 0) {
        const next = queue[0];
        setCurrentAsset(next);
        setQueue(prev => prev.slice(1));
        
        try {
          await generateAssetContent(next);
          setCompletedAssets(prev => [...prev, { ...next, status: 'completed' }]);
        } catch (error) {
          console.error('Failed to generate asset:', error);
          setFailedAssets(prev => [...prev, { ...next, status: 'failed' }]);
        } finally {
          setCurrentAsset(null);
        }
      }
    };
    
    if (isGenerating) {
      processNext();
    }
  }, [queue, currentAsset, isGenerating, completedAssets, failedAssets, onComplete]);
  
  const totalAssets = assets.length;
  const processedCount = completedAssets.length + failedAssets.length;
  const progress = (processedCount / totalAssets) * 100;
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generating Campaign Assets</DialogTitle>
          <DialogDescription>
            Creating {totalAssets} content pieces. This may take several minutes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {processedCount} / {totalAssets} assets
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                {completedAssets.length} completed
              </span>
              {failedAssets.length > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-400" />
                  {failedAssets.length} failed
                </span>
              )}
            </div>
          </div>
          
          {currentAsset && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentAsset.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generating {getFormatByIdOrDefault(currentAsset.type).name}...
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~{currentAsset.estimatedTime} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <ScrollArea className="h-64 rounded-lg border border-border">
            <div className="p-4 space-y-2">
              {completedAssets.map(asset => (
                <AssetStatusItem 
                  key={asset.id} 
                  asset={asset} 
                  status="completed" 
                />
              ))}
              
              {failedAssets.map(asset => (
                <AssetStatusItem 
                  key={asset.id} 
                  asset={asset} 
                  status="failed" 
                />
              ))}
              
              {queue.map(asset => (
                <AssetStatusItem 
                  key={asset.id} 
                  asset={asset} 
                  status="pending" 
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssetStatusItem = ({ 
  asset, 
  status 
}: { 
  asset: CampaignAsset; 
  status: 'pending' | 'completed' | 'failed' 
}) => {
  const format = getFormatByIdOrDefault(asset.type);
  const Icon = format.icon;
  
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: 'text-muted-foreground', 
      bg: 'bg-muted/20' 
    },
    completed: { 
      icon: CheckCircle, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10 border-green-500/20' 
    },
    failed: { 
      icon: XCircle, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10 border-red-500/20' 
    },
  };
  
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  
  return (
    <div className={cn('p-3 rounded-lg border border-border', config.bg)}>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium flex-1 truncate">{asset.title}</p>
        <StatusIcon className={cn('h-4 w-4', config.color)} />
      </div>
    </div>
  );
};

const generateAssetContent = async (asset: CampaignAsset): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return;
};
