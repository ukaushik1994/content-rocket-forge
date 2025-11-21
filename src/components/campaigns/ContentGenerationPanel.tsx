import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, Eye, Copy, RefreshCw, Trash2, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { useCampaignContentGeneration } from '@/hooks/useCampaignContentGeneration';
import { useContentQueue } from '@/hooks/useContentQueue';
import { generateContentBriefs } from '@/services/contentBriefGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ContentBrief } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const formatNames: Record<string, string> = {
  'blog': 'Blog Post',
  'email': 'Email Newsletter',
  'social-twitter': 'Twitter Post',
  'social-linkedin': 'LinkedIn Post',
  'social-facebook': 'Facebook Post',
  'social-instagram': 'Instagram Post',
  'script': 'Video Script',
  'landing-page': 'Landing Page',
  'carousel': 'Carousel Post',
  'meme': 'Meme Post',
  'google-ads': 'Google Ads',
};

export const ContentGenerationPanel = () => {
  const { isOpen, closePanel, strategy, campaignId } = useContentGeneration();
  const { generateContent, generateAllContent, generatedItems } = useCampaignContentGeneration();
  const { queueItems, stats, loading: queueLoading, startProcessing, retryItem, cancelItem, clearCompleted } = useContentQueue(campaignId || null);
  const [briefs, setBriefs] = useState<Map<string, ContentBrief>>(new Map());
  const [loadingBriefs, setLoadingBriefs] = useState(false);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closePanel]);

  useEffect(() => {
    if (isOpen && strategy && briefs.size === 0) {
      generateAllBriefs();
    }
  }, [isOpen, strategy]);

  const generateAllBriefs = async () => {
    if (!strategy) return;

    setLoadingBriefs(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

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

      const newBriefs = new Map<string, ContentBrief>();
      let totalGenerated = 0;

      for (const formatItem of strategy.contentMix) {
        const generatedBriefs = await generateContentBriefs(
          formatItem,
          strategy,
          solutionData,
          user.id,
          (current, total) => {
            console.log(`📋 [Generation Panel] Progress: ${current}/${total} for ${formatItem.formatId}`);
          }
        );

        generatedBriefs.forEach((brief, index) => {
          const key = `${formatItem.formatId}-${index}`;
          console.log(`📝 Generated brief key: "${key}"`);
          newBriefs.set(key, brief);
          totalGenerated++;
        });
      }

      setBriefs(newBriefs);
      
      toast({
        title: "Briefs Ready",
        description: `${totalGenerated} detailed content briefs generated`,
      });
    } catch (error: any) {
      console.error('Brief generation failed:', error);
      toast({
        title: "Brief Generation Failed",
        description: error.message || "Could not generate content briefs",
        variant: "destructive"
      });
    } finally {
      setLoadingBriefs(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!strategy || !campaignId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const solutionId = (strategy as any).solutionId || null;
      let solutionData = null;
      if (solutionId) {
        const { data } = await supabase
          .from('solutions')
          .select('*')
          .eq('id', solutionId)
          .single();
        solutionData = data;
      }

      const campaignContext = {
        title: strategy.title,
        description: strategy.description,
        targetAudience: strategy.targetAudience,
        goal: strategy.expectedEngagement
      };

      const items = Array.from(briefs.entries())
        .map(([key, brief]) => {
          const [formatId, indexStr] = key.split('-');
          const index = parseInt(indexStr, 10);
          
          // Validate that index is a valid number
          if (!formatId || isNaN(index)) {
            console.error(`Invalid brief key format: "${key}". Expected format: "formatId-index"`);
            return null;
          }
          
          return {
            brief,
            formatId,
            index
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null); // Remove invalid items

      // Validate we have items to generate
      if (items.length === 0) {
        throw new Error('No valid content briefs found. Please regenerate briefs.');
      }

      await generateAllContent(
        items,
        campaignId,
        solutionId,
        campaignContext,
        solutionData,
        user.id
      );
    } catch (error: any) {
      console.error('Generate all error:', error);
      
      const errorMessage = error.message?.includes('piece_index') 
        ? 'Invalid content format. Please regenerate content briefs.'
        : error.message?.includes('401') || error.message?.includes('Unauthorized')
        ? "Please configure your AI provider in Settings."
        : error.message?.includes('No AI provider')
        ? "Please configure an AI provider in Settings to generate content."
        : error.message || "Could not generate content. Please try again.";
      
      const errorTitle = error.message?.includes('piece_index')
        ? "Invalid Content Format"
        : error.message?.includes('401') || error.message?.includes('Unauthorized')
        ? "Authentication Error"
        : error.message?.includes('No AI provider')
        ? "AI Provider Required"
        : "Generation Failed";
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  if (!strategy) return null;

  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closePanel}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-16 bottom-0 w-full lg:w-2/3 bg-background/95 backdrop-blur-xl border-l border-border/40 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/40 bg-gradient-to-r from-background/60 to-primary/5">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Content Generation
                </h2>
                <p className="text-sm text-muted-foreground">
                  Generate {totalPieces} pieces of content
                </p>
                {stats.total > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    {stats.completed > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">{stats.completed} completed</span>
                      </div>
                    )}
                    {stats.processing > 0 && (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                        <span className="text-blue-400">{stats.processing} processing</span>
                      </div>
                    )}
                    {stats.pending > 0 && (
                      <span className="text-muted-foreground">{stats.pending} pending</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {briefs.size > 0 && stats.total === 0 && (
                  <Button
                    onClick={handleGenerateAll}
                    disabled={loadingBriefs}
                    className="bg-gradient-to-r from-primary to-blue-500"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Generate All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closePanel}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              {loadingBriefs ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                    <p className="font-medium">Generating content briefs...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from(briefs.entries()).map(([key, brief]) => {
                    const [formatId, indexStr] = key.split('-');
                    const formatName = formatNames[formatId] || formatId;
                    
                    return (
                      <Card key={key} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{brief.title}</h3>
                            <Badge>{formatName}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{brief.description}</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
