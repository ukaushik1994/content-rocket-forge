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
import { Sparkles, Clock, CheckSquare, Filter, Loader2, Image as ImageIcon, Info, Layers, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AssetPreviewCard } from './AssetPreviewCard';
import { generateAssetListFromStrategy, calculateAssetTotals, groupAssetsByType } from '@/utils/assetGenerator';
import { generateContentBriefs } from '@/services/contentBriefGenerator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { imageGenOrchestrator } from '@/services/imageGenOrchestrator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getFormatByIdOrDefault } from '@/components/content-repurposing/formats';

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
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0 overflow-hidden bg-gradient-to-b from-background via-background to-background/95">
        {/* Premium Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-transparent relative">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          <div className="flex items-start gap-4 relative">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 shadow-lg shadow-primary/10">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {isBriefsLoading ? (
                  <span className="flex items-center gap-2">
                    Generating Content Briefs
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </span>
                  </span>
                ) : (
                  <>Campaign Assets <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Overview</span></>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1 text-muted-foreground/80">
                {isBriefsLoading 
                  ? `Creating detailed briefs for ${briefProgress.total} pieces...`
                  : 'Review and select assets to generate. Estimates shown for AI processing.'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Premium Loading State */}
        {isBriefsLoading && (
          <div className="px-6 py-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative p-3 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">
                    Generating briefs... {briefProgress.current} of {briefProgress.total}
                  </span>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {Math.round((briefProgress.current / briefProgress.total) * 100)}%
                  </span>
                </div>
                <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(briefProgress.current / briefProgress.total) * 100}%` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              Creating unique titles, keywords, and SEO metadata for each piece...
            </div>
          </div>
        )}
        
        {!isBriefsLoading && (
          <>
            {/* Premium Image Generation Toggle */}
            <div className="px-6 py-4 border-b border-border/50">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                imageProviderAvailable && includeImages 
                  ? "bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 shadow-sm shadow-green-500/5"
                  : "bg-muted/30 border border-border/50"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    imageProviderAvailable && includeImages 
                      ? "bg-green-500/20 shadow-lg shadow-green-500/10" 
                      : "bg-muted/50"
                  )}>
                    <ImageIcon className={cn(
                      "h-5 w-5 transition-colors",
                      imageProviderAvailable && includeImages ? "text-green-500" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="include-images" className="font-semibold">
                        Auto-Generate Images
                      </Label>
                      {imageProviderAvailable && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                          {imageProviderName || 'AI'}
                        </span>
                      )}
                      {!imageProviderAvailable && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Configure an image provider in Settings → AI Providers</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {imageProviderAvailable 
                        ? 'Hero images, thumbnails & visuals for each piece'
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
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            {/* Premium Filter Tabs & Stats */}
            <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-b from-muted/20 to-transparent">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Filter Pills */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterType('all')}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      filterType === 'all'
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All <span className="ml-1.5 opacity-70">{assets.length}</span>
                  </button>
                  {Object.entries(groupedAssets).map(([type, typeAssets]) => {
                    const format = getFormatByIdOrDefault(type);
                    const Icon = format.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                          filterType === type
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {type.replace('social-', '').replace('-', ' ')}
                        <span className="opacity-70">{typeAssets.length}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Premium Stats Cards */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="font-bold text-sm tabular-nums">{selectedAssets.size}</span>
                    <span className="text-xs text-muted-foreground">selected</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-sm tabular-nums text-amber-600 dark:text-amber-400">~{totals.totalTime}</span>
                    <span className="text-xs text-muted-foreground">min</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-sm tabular-nums text-purple-600 dark:text-purple-400">{totals.totalCost}</span>
                    <span className="text-xs text-muted-foreground">credits</span>
                  </div>
                  {includeImages && imageProviderAvailable && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 animate-pulse">
                      <ImageIcon className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">+images</span>
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
        
        {/* Premium Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent flex-row items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSelectAll}
              className="text-muted-foreground hover:text-foreground"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDeselectAll}
              className="text-muted-foreground hover:text-foreground"
            >
              Deselect All
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-border/50">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={selectedAssets.size === 0}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                selectedAssets.size > 0 && "bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-gradient-x shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              <Zap className="h-4 w-4 mr-2" />
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
