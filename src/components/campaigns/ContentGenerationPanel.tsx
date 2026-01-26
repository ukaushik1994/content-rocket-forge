import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, Eye, Copy, RefreshCw, Trash2, Play, Clock, Mail, MessageSquare, Video, Layout, Image, Megaphone, PenTool } from 'lucide-react';
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

const formatIcons: Record<string, React.ElementType> = {
  'blog': PenTool,
  'email': Mail,
  'social-twitter': MessageSquare,
  'social-linkedin': MessageSquare,
  'social-facebook': MessageSquare,
  'social-instagram': Image,
  'script': Video,
  'landing-page': Layout,
  'carousel': Image,
  'meme': Image,
  'google-ads': Megaphone,
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-l-emerald-500',
        label: 'Completed'
      };
    case 'processing':
      return {
        icon: Loader2,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-l-blue-500',
        label: 'Processing',
        animate: true
      };
    case 'failed':
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-l-red-500',
        label: 'Failed'
      };
    default:
      return {
        icon: Clock,
        color: 'text-muted-foreground',
        bg: 'bg-muted/50',
        border: 'border-l-muted-foreground/30',
        label: 'Pending'
      };
  }
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

  // Use existing briefs from strategy first, fallback to generating new ones
  useEffect(() => {
    if (isOpen && strategy && briefs.size === 0) {
      loadOrGenerateBriefs();
    }
  }, [isOpen, strategy]);

  const loadOrGenerateBriefs = async () => {
    if (!strategy) return;

    setLoadingBriefs(true);
    
    try {
      const newBriefs = new Map<string, ContentBrief>();
      
      // PRIORITY 1: Use contentBriefs from strategy if available
      if (strategy.contentBriefs && strategy.contentBriefs.length > 0) {
        console.log(`📋 [Generation Panel] Using ${strategy.contentBriefs.length} existing contentBriefs from strategy`);
        
        strategy.contentBriefs.forEach((brief, index) => {
          // Use pieceIndex if available, otherwise use loop index
          const pieceIndex = (brief as any).pieceIndex ?? index;
          const key = `${brief.formatId || (brief as any).formatId || 'unknown'}-${pieceIndex}`;
          console.log(`📝 Loading existing brief key: "${key}" - ${brief.title}`);
          newBriefs.set(key, {
            title: brief.title,
            description: brief.description,
            keywords: brief.keywords || [],
            metaTitle: brief.metaTitle || brief.title,
            metaDescription: brief.metaDescription || brief.description,
            targetWordCount: brief.targetWordCount || 1000,
            difficulty: brief.difficulty || 'medium',
            serpOpportunity: brief.serpOpportunity || 50
          });
        });
        
        setBriefs(newBriefs);
        toast({
          title: "Briefs Loaded",
          description: `${newBriefs.size} content briefs ready from campaign strategy`,
        });
        setLoadingBriefs(false);
        return;
      }
      
      // PRIORITY 2: Extract from contentMix.specificTopics
      let briefsFromMix = 0;
      for (const formatItem of strategy.contentMix) {
        if (formatItem.specificTopics && formatItem.specificTopics.length > 0) {
          formatItem.specificTopics.forEach((topic, index) => {
            const key = `${formatItem.formatId}-${index}`;
            console.log(`📝 Extracting brief from specificTopics: "${key}" - ${topic.title}`);
            newBriefs.set(key, {
              title: topic.title,
              description: topic.description,
              keywords: topic.keywords || [],
              metaTitle: topic.metaTitle || topic.title,
              metaDescription: topic.metaDescription || topic.description,
              targetWordCount: topic.targetWordCount || 1000,
              difficulty: topic.difficulty || 'medium',
              serpOpportunity: topic.serpOpportunity || 50
            });
            briefsFromMix++;
          });
        }
      }
      
      if (briefsFromMix > 0) {
        console.log(`📋 [Generation Panel] Extracted ${briefsFromMix} briefs from contentMix.specificTopics`);
        setBriefs(newBriefs);
        toast({
          title: "Briefs Ready",
          description: `${newBriefs.size} content briefs extracted from strategy`,
        });
        setLoadingBriefs(false);
        return;
      }
      
      // PRIORITY 3: Generate new briefs using AI (fallback only)
      console.log(`⚠️ [Generation Panel] No existing briefs found, generating new ones...`);
      await generateFreshBriefs();
      
    } catch (error: any) {
      console.error('Brief loading failed:', error);
      toast({
        title: "Brief Loading Failed",
        description: error.message || "Could not load content briefs",
        variant: "destructive"
      });
      setLoadingBriefs(false);
    }
  };

  const generateFreshBriefs = async () => {
    if (!strategy) return;

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
          console.log(`📝 Generated fresh brief key: "${key}"`);
          newBriefs.set(key, brief);
          totalGenerated++;
        });
      }

      setBriefs(newBriefs);
      
      toast({
        title: "Briefs Generated",
        description: `${totalGenerated} detailed content briefs created`,
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
        .filter((item): item is NonNullable<typeof item> => item !== null);

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
  const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={closePanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-16 bottom-0 w-full lg:w-[600px] xl:w-[680px] bg-background border-l border-border/50 shadow-2xl z-50 flex flex-col"
          >
            {/* Premium Header */}
            <div className="border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
              {/* Top Row */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Content Generation</h2>
                    <p className="text-sm text-muted-foreground">
                      {totalPieces} pieces ready to generate
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closePanel}
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Stats Row */}
              <div className="px-6 pb-4 flex items-center gap-3">
                {/* Mini Stat Cards */}
                <div className="flex items-center gap-2 flex-1">
                  {/* Completed */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">{stats.completed}</span>
                  </div>
                  
                  {/* Processing */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Loader2 className={`h-3.5 w-3.5 text-blue-500 ${stats.processing > 0 ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium text-blue-600">{stats.processing}</span>
                  </div>
                  
                  {/* Pending */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{stats.pending}</span>
                  </div>
                  
                  {/* Failed */}
                  {stats.failed > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-sm font-medium text-red-600">{stats.failed}</span>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                {briefs.size > 0 && stats.total === 0 && (
                  <Button
                    onClick={handleGenerateAll}
                    disabled={loadingBriefs}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                  >
                    <Play className="h-4 w-4 mr-1.5" />
                    Generate All
                  </Button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-4">
                {/* Loading State */}
                {loadingBriefs ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center py-20"
                  >
                    <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 text-center max-w-sm">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Preparing Your Content</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyzing strategy and generating optimized briefs...
                      </p>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 2, ease: 'easeInOut' }}
                        />
                      </div>
                    </Card>
                  </motion.div>
                ) : queueItems.length > 0 ? (
                  <>
                    {/* Progress Bar */}
                    <Card className="p-4 border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Generation Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.completed} / {stats.total}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-blue-500 to-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                        {stats.processing > 0 && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {progressPercent}% complete
                        </span>
                        {stats.completed > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearCompleted}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear Done
                          </Button>
                        )}
                      </div>
                    </Card>

                    {/* Queue Items */}
                    <div className="space-y-2">
                      {queueItems.map((item, index) => {
                        const formatName = formatNames[item.format_id] || item.format_id;
                        const FormatIcon = formatIcons[item.format_id] || FileText;
                        const brief = item.brief as ContentBrief;
                        const statusConfig = getStatusConfig(item.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <Card 
                              className={`p-4 border-l-[3px] ${statusConfig.border} hover:shadow-md transition-all duration-200`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Format Icon */}
                                <div className={`w-9 h-9 rounded-lg ${statusConfig.bg} flex items-center justify-center shrink-0`}>
                                  <FormatIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                          {formatName}
                                        </span>
                                      </div>
                                      <h4 className="font-medium text-sm truncate">
                                        {brief?.title || 'Untitled'}
                                      </h4>
                                    </div>
                                    
                                    {/* Status Badge */}
                                    <Badge 
                                      variant="outline" 
                                      className={`shrink-0 ${statusConfig.bg} border-transparent text-xs`}
                                    >
                                      <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
                                      <span className={statusConfig.color}>{statusConfig.label}</span>
                                    </Badge>
                                  </div>

                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {brief?.description || 'No description'}
                                  </p>

                                  {/* Error Message */}
                                  {item.error_message && (
                                    <div className="mt-2 text-xs text-red-500 bg-red-500/10 rounded px-2 py-1.5 line-clamp-2">
                                      {item.error_message}
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  {(item.status === 'failed' || item.status === 'cancelled') && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => retryItem(item.id)}
                                        className="h-7 text-xs"
                                      >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Retry
                                      </Button>
                                    </div>
                                  )}

                                  {(item.status === 'pending' || item.status === 'processing') && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => cancelItem(item.id)}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* Brief Cards */
                  <div className="space-y-3">
                    {Array.from(briefs.entries()).map(([key, brief], index) => {
                      const [formatId] = key.split('-');
                      const formatName = formatNames[formatId] || formatId;
                      const FormatIcon = formatIcons[formatId] || FileText;
                      
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
                            <div className="flex items-start gap-3">
                              {/* Format Icon */}
                              <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center shrink-0 transition-colors">
                                <FormatIcon className="h-5 w-5 text-primary" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                                    {formatName}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                                  {brief.title}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {brief.description}
                                </p>

                                {/* Metadata Tags */}
                                {brief.keywords && brief.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {brief.keywords.slice(0, 3).map((kw, i) => (
                                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {kw}
                                      </span>
                                    ))}
                                    {brief.keywords.length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{brief.keywords.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
