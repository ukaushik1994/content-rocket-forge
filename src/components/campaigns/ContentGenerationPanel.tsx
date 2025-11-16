import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, Eye, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { useCampaignContentGeneration } from '@/hooks/useCampaignContentGeneration';
import { generateContentBriefs } from '@/services/contentBriefGenerator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ContentBrief } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';

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
  const { isOpen, closePanel, strategy } = useContentGeneration();
  const { generateContent, generatedItems } = useCampaignContentGeneration();
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

  // Generate briefs when panel opens
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

      const newBriefs = new Map<string, ContentBrief>();

      for (const formatItem of strategy.contentMix) {
        const generatedBriefs = await generateContentBriefs(
          formatItem,
          strategy,
          solutionData,
          user.id
        );

        generatedBriefs.forEach((brief, index) => {
          const key = `${formatItem.formatId}-${index}`;
          newBriefs.set(key, brief);
        });
      }

      setBriefs(newBriefs);
    } catch (error: any) {
      console.error('Failed to generate briefs:', error);
      toast({
        title: "Brief Generation Failed",
        description: error.message || "Could not generate content briefs",
        variant: "destructive"
      });
    } finally {
      setLoadingBriefs(false);
    }
  };

  const handleGenerate = async (formatId: string, index: number) => {
    if (!strategy) return;

    const key = `${formatId}-${index}`;
    const brief = briefs.get(key);
    if (!brief) {
      toast({
        title: "Brief Not Found",
        description: "Please wait for briefs to generate",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get campaign ID (assuming strategy has it)
      const campaignId = (strategy as any).campaignId || 'temp-campaign-id';
      const solutionId = (strategy as any).solutionId || null;

      // Fetch solution data if needed
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

      await generateContent(
        brief,
        campaignId,
        solutionId,
        formatId,
        index,
        campaignContext,
        solutionData,
        user.id
      );
    } catch (error) {
      // Error already handled in hook
      console.error('Generation error:', error);
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
  const readyCount = Array.from(generatedItems.values()).filter(item => item.status === 'ready').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-full lg:w-2/3 bg-background border-l border-border shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold">Content Generation</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalPieces} pieces · {readyCount} ready · {totalPieces - readyCount} pending
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closePanel}
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {loadingBriefs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">Generating content briefs...</p>
                    </div>
                  </div>
                ) : (
                  strategy.contentMix.map((formatItem) => {
                    const formatName = formatNames[formatItem.formatId] || formatItem.formatId;
                    
                    return (
                      <div key={formatItem.formatId} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{formatName}</h3>
                          <Badge variant="secondary">{formatItem.count} pieces</Badge>
                        </div>

                        <div className="grid gap-3">
                          {Array.from({ length: formatItem.count }).map((_, index) => {
                            const key = `${formatItem.formatId}-${index}`;
                            const brief = briefs.get(key);
                            const generated = generatedItems.get(key);
                            const isExpanded = expandedContent === key;

                            return (
                              <Card key={key} className="p-4">
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium truncate">
                                          {brief?.title || `${formatName} #${index + 1}`}
                                        </h4>
                                        {generated?.status === 'ready' && (
                                          <Badge variant="default" className="bg-green-500">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Ready
                                          </Badge>
                                        )}
                                        {generated?.status === 'generating' && (
                                          <Badge variant="default">
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Generating...
                                          </Badge>
                                        )}
                                        {generated?.status === 'error' && (
                                          <Badge variant="destructive">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Error
                                          </Badge>
                                        )}
                                      </div>
                                      {brief && (
                                        <p className="text-sm text-muted-foreground">
                                          {brief.description}
                                        </p>
                                      )}
                                    </div>

                                    <Button
                                      size="sm"
                                      onClick={() => handleGenerate(formatItem.formatId, index)}
                                      disabled={generated?.status === 'generating' || !brief}
                                    >
                                      {generated?.status === 'generating' ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Generating
                                        </>
                                      ) : generated?.status === 'ready' ? (
                                        <>
                                          <Sparkles className="h-4 w-4 mr-2" />
                                          Regenerate
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="h-4 w-4 mr-2" />
                                          Generate
                                        </>
                                      )}
                                    </Button>
                                  </div>

                                  {/* Brief Details */}
                                  {brief && !generated && (
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                      <span>Keywords: {brief.keywords.slice(0, 3).join(', ')}</span>
                                      <span>•</span>
                                      <span>{brief.targetWordCount} words</span>
                                      <span>•</span>
                                      <span>Difficulty: {brief.difficulty}</span>
                                      <span>•</span>
                                      <span>SEO Opportunity: {brief.serpOpportunity}%</span>
                                    </div>
                                  )}

                                  {/* Generated Content */}
                                  {generated?.status === 'ready' && (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{generated.wordCount} words</span>
                                        {generated.seoScore && (
                                          <>
                                            <span>•</span>
                                            <span>SEO Score: {generated.seoScore}%</span>
                                          </>
                                        )}
                                      </div>

                                      {isExpanded && (
                                        <div className="p-3 bg-muted rounded-md">
                                          <pre className="whitespace-pre-wrap text-sm font-mono">
                                            {generated.content}
                                          </pre>
                                        </div>
                                      )}

                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setExpandedContent(isExpanded ? null : key)}
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          {isExpanded ? 'Hide' : 'View Full'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCopyContent(generated.content)}
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Error Message */}
                                  {generated?.status === 'error' && (
                                    <div className="text-sm text-destructive">
                                      {generated.error || 'Failed to generate content'}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
