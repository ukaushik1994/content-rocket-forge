import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useContentGeneration } from '@/contexts/ContentGenerationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { isOpen, closePanel, strategy, selectedContent } = useContentGeneration();
  const [generatingItems, setGeneratingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closePanel]);

  if (!strategy) return null;

  const handleGenerate = (formatId: string, index: number) => {
    const key = `${formatId}-${index}`;
    setGeneratingItems(prev => new Set(prev).add(key));
    
    // Simulate generation
    setTimeout(() => {
      setGeneratingItems(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }, 3000);
  };

  const totalPieces = strategy.contentMix.reduce((sum, item) => sum + item.count, 0);

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
                  {totalPieces} pieces ready to generate
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
                {strategy.contentMix.map((formatItem) => {
                  const formatName = formatNames[formatItem.formatId] || formatItem.formatId;
                  
                  return (
                    <div key={formatItem.formatId} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{formatName}</h3>
                          <Badge variant="secondary">{formatItem.count}× pieces</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Array.from({ length: formatItem.count }).map((_, index) => {
                          const key = `${formatItem.formatId}-${index}`;
                          const isGenerating = generatingItems.has(key);
                          const topic = formatItem.specificTopics?.[index];

                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {topic?.title || `${formatName} #${index + 1}`}
                                </p>
                                {topic?.description && (
                                  <p className="text-sm text-muted-foreground truncate mt-1">
                                    {topic.description}
                                  </p>
                                )}
                                {topic?.keywords && topic.keywords.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {topic.keywords.slice(0, 3).map((keyword) => (
                                      <Badge key={keyword} variant="outline" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 ml-4">
                                {isGenerating ? (
                                  <div className="w-32">
                                    <Progress value={66} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">Generating...</p>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleGenerate(formatItem.formatId, index)}
                                  >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Ready to generate {totalPieces} content pieces
                </div>
                <Button size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate All Content
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
