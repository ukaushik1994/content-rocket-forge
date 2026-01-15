import React, { useState, useEffect, useMemo } from 'react';
import { CampaignStrategy, ContentBrief } from '@/types/campaign-types';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Clock, CheckSquare, Filter, Loader2, Image as ImageIcon, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AssetPreviewCard } from './AssetPreviewCard';
import { generateAssetListFromStrategy, calculateAssetTotals, groupAssetsByType } from '@/utils/assetGenerator';
import { generateContentBriefs } from '@/services/contentBriefGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { imageGenOrchestrator } from '@/services/imageGenOrchestrator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AssetGenerationModalProps {
  strategy: CampaignStrategy;
  campaignId: string;
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (assetIds: string[], options?: { includeImages: boolean }) => void;
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
  const [isBriefsLoading, setIsBriefsLoading] = useState(false);
  const [briefProgress, setBriefProgress] = useState({ current: 0, total: 0 });
  const [includeImages, setIncludeImages] = useState(true);
  const [imageProviderAvailable, setImageProviderAvailable] = useState(false);
  const [imageProviderName, setImageProviderName] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen && strategy) {
      generateAllBriefs();
      checkImageProvider();
    }
  }, [isOpen, strategy, campaignId]);

  const checkImageProvider = async () => {
    const available = await imageGenOrchestrator.isAvailable();
    setImageProviderAvailable(available);
    if (available) {
      const name = await imageGenOrchestrator.getProviderName();
      setImageProviderName(name);
    }
  };

  const generateAllBriefs = async () => {
    setIsBriefsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate total pieces
      const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);
      setBriefProgress({ current: 0, total: totalPieces });

      console.log(`🎯 [Asset Modal] Generating briefs for ${totalPieces} pieces`);

      // Fetch solution data if strategy references one
      let solutionData = null;
      const solutionId = (strategy as any).solutionId;
      if (solutionId) {
        const { data } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single();
        solutionData = data;
      }

      let completed = 0;
      
      // Generate briefs for each format
      for (const formatItem of strategy.contentMix) {
        console.log(`🎯 [Asset Modal] Generating ${formatItem.count} briefs for ${formatItem.formatId}`);
        
        const briefs = await generateContentBriefs(
          formatItem,
          strategy,
          solutionData,
          user.id,
          (current, total) => {
            setBriefProgress({ current: completed + current, total: totalPieces });
          }
        );
        
        // Update formatItem with generated briefs
        formatItem.specificTopics = briefs;
        completed += formatItem.count;
        setBriefProgress({ current: completed, total: totalPieces });
      }

      console.log(`🎯 [Asset Modal] ✓ All briefs generated, creating asset list`);

      // Now generate assets with REAL briefs
      const generatedAssets = generateAssetListFromStrategy(strategy, campaignId);
      setAssets(generatedAssets);
      setSelectedAssets(new Set(generatedAssets.map(a => a.id)));

      toast({
        title: "Briefs Generated",
        description: `${totalPieces} detailed content briefs ready`,
      });

    } catch (error: any) {
      console.error('🎯 [Asset Modal] Brief generation failed:', error);
      
      // Generate assets with placeholder briefs as fallback
      const generatedAssets = generateAssetListFromStrategy(strategy, campaignId);
      setAssets(generatedAssets);
      setSelectedAssets(new Set(generatedAssets.map(a => a.id)));

      toast({
        title: "Using Placeholder Briefs",
        description: error.message || "Brief generation failed, using defaults",
        variant: "destructive"
      });
    } finally {
      setIsBriefsLoading(false);
    }
  };
  
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
    onGenerate(Array.from(selectedAssets), { includeImages: includeImages && imageProviderAvailable });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl">
            {isBriefsLoading ? 'Generating Content Briefs...' : 'Campaign Assets Overview'}
          </DialogTitle>
          <DialogDescription>
            {isBriefsLoading 
              ? `Creating detailed briefs for ${briefProgress.total} pieces...`
              : 'Review and select which assets to generate. Estimates shown are for AI processing time and credits.'
            }
          </DialogDescription>
        </DialogHeader>

        {isBriefsLoading && (
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Generating briefs... {briefProgress.current} of {briefProgress.total}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((briefProgress.current / briefProgress.total) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(briefProgress.current / briefProgress.total) * 100} 
                  className="h-2"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Creating unique titles, keywords, and SEO metadata for each piece...
            </p>
          </div>
        )}
        
        {!isBriefsLoading && (
          <>
            {/* Image Generation Toggle */}
            <div className="px-6 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="include-images" className="font-medium">
                        Generate Images
                      </Label>
                      {!imageProviderAvailable && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Configure an image generation provider in Settings</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {imageProviderAvailable 
                        ? `Auto-generate images using ${imageProviderName || 'AI'}`
                        : 'No image provider configured'
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  id="include-images"
                  checked={includeImages && imageProviderAvailable}
                  onCheckedChange={setIncludeImages}
                  disabled={!imageProviderAvailable}
                />
              </div>
            </div>

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
              {includeImages && imageProviderAvailable && (
                <div className="flex items-center gap-2 text-primary">
                  <ImageIcon className="h-4 w-4" />
                  <span>+images</span>
                </div>
              )}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
