import React, { useState, useEffect, useMemo } from 'react';
import { CampaignStrategy } from '@/types/campaign-types';
import { CampaignAsset } from '@/types/asset-types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Clock, CheckSquare, Filter } from 'lucide-react';
import { AssetPreviewCard } from './AssetPreviewCard';
import { generateAssetListFromStrategy, calculateAssetTotals, groupAssetsByType } from '@/utils/assetGenerator';

interface AssetGenerationModalProps {
  strategy: CampaignStrategy;
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (assetIds: string[]) => void;
}

export const AssetGenerationModal = ({
  strategy,
  campaignId,
  isOpen,
  onClose,
  onGenerate,
}: AssetGenerationModalProps) => {
  const [assets, setAssets] = useState<CampaignAsset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');
  
  useEffect(() => {
    if (isOpen && strategy) {
      const generatedAssets = generateAssetListFromStrategy(strategy, campaignId);
      setAssets(generatedAssets);
      setSelectedAssets(new Set(generatedAssets.map(a => a.id)));
    }
  }, [isOpen, strategy, campaignId]);
  
  const filteredAssets = useMemo(() => {
    if (filterType === 'all') return assets;
    return assets.filter(a => a.type === filterType);
  }, [assets, filterType]);
  
  const selectedAssetsList = useMemo(() => {
    return assets.filter(a => selectedAssets.has(a.id));
  }, [assets, selectedAssets]);
  
  const totals = useMemo(() => 
    calculateAssetTotals(selectedAssetsList), 
    [selectedAssetsList]
  );
  
  const groupedAssets = useMemo(() => 
    groupAssetsByType(assets), 
    [assets]
  );
  
  const handleToggleAsset = (assetId: string) => {
    const newSet = new Set(selectedAssets);
    if (newSet.has(assetId)) {
      newSet.delete(assetId);
    } else {
      newSet.add(assetId);
    }
    setSelectedAssets(newSet);
  };
  
  const handleSelectAll = () => {
    setSelectedAssets(new Set(assets.map(a => a.id)));
  };
  
  const handleDeselectAll = () => {
    setSelectedAssets(new Set());
  };
  
  const handleGenerate = () => {
    onGenerate(Array.from(selectedAssets));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl">Campaign Assets Overview</DialogTitle>
          <DialogDescription>
            Review and select which assets to generate. Estimates shown are for AI processing time and credits.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={filterType === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({assets.length})
              </Button>
              {Object.entries(groupedAssets).map(([type, typeAssets]) => (
                <Button 
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {type.replace('social-', '').replace('-', ' ')} ({typeAssets.length})
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold">{selectedAssets.size} selected</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{totals.totalTime} min</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>{totals.totalCost} credits</span>
              </div>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
            {filteredAssets.map(asset => (
              <AssetPreviewCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAssets.has(asset.id)}
                onToggle={handleToggleAsset}
              />
            ))}
          </div>
          
          {filteredAssets.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No assets found for this filter</p>
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4 border-t border-border flex-row items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeselectAll}
            >
              Deselect All
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={selectedAssets.size === 0}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate {selectedAssets.size} Asset{selectedAssets.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
