
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, FileText, Maximize2, Eye, BarChart3, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ContentPreviewSection } from './enhanced-detail/ContentPreviewSection';
import { MetadataAnalytics } from './enhanced-detail/MetadataAnalytics';
import { SerpAnalysisDisplay } from './enhanced-detail/SerpAnalysisDisplay';
import { SolutionIntegrationDashboard } from './enhanced-detail/SolutionIntegrationDashboard';
import { DocumentStructureVisualization } from './enhanced-detail/DocumentStructureVisualization';
import { KeywordPerformanceCard } from './enhanced-detail/KeywordPerformanceCard';
import { TabErrorBoundary } from './enhanced-detail/TabErrorBoundary';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useSmartAnalysisLoading } from '@/hooks/drafts/useSmartAnalysisLoading';
import { validateDraftData } from '@/utils/validation/dataValidation';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'seo' | 'structure'>('content');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use smart analysis loading hook
  const { 
    isAnalyzing, 
    analysisError, 
    analysisData, 
    retryAnalysis, 
    resetAnalysis 
  } = useSmartAnalysisLoading({ draft, activeTab });
  
  // Reset states when draft changes
  useEffect(() => {
    if (draft?.id) {
      resetAnalysis();
      setActiveTab('content');
      setIsFullscreen(false);
    }
  }, [draft?.id, resetAnalysis]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAnalysis();
    };
  }, [resetAnalysis]);
  
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn('Date formatting error:', error);
      return 'Invalid date';
    }
  }, []);

  const handleCopyContent = useCallback(async () => {
    if (!draft?.content) {
      toast.error('No content to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(draft.content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = draft.content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Content copied to clipboard');
      } catch (fallbackError) {
        console.error('Copy failed:', fallbackError);
        toast.error('Failed to copy content');
      }
    }
  }, [draft?.content]);

  const handleExport = useCallback(() => {
    if (!draft?.content) {
      toast.error('No content to export');
      return;
    }

    try {
      const element = document.createElement('a');
      const file = new Blob([draft.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${draft?.title || 'content'}.txt`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
      toast.success('Content exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export content');
    }
  }, [draft?.content, draft?.title]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as any);
  }, []);

  const handleRetryForTab = useCallback(() => {
    retryAnalysis();
  }, [retryAnalysis]);

  // Validate draft data
  if (draft) {
    const validation = validateDraftData(draft);
    if (!validation.isValid) {
      console.warn('Draft validation failed:', validation.errors);
    }
  }

  if (!draft) return null;

  const tabContentProps = {
    draft,
    isAnalyzing,
    analysisData,
    formatDate,
    onRetry: handleRetryForTab
  };

  return (
    <ErrorBoundary fallbackTitle="Draft Detail View Error" onRetry={() => window.location.reload()}>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={`${isFullscreen ? 'max-w-[100vw] max-h-[100vh] w-full h-full' : 'max-w-7xl max-h-[90vh]'} overflow-hidden flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-white/10`}>
          <DialogHeader className="pb-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {draft.title || 'Untitled Draft'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Created: {formatDate(draft.created_at)} • Updated: {formatDate(draft.updated_at)}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analysisError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryAnalysis}
                    className="p-2"
                    aria-label="Retry analysis"
                  >
                    <motion.div
                      animate={{ rotate: isAnalyzing ? 360 : 0 }}
                      transition={{ duration: 1, repeat: isAnalyzing ? Infinity : 0 }}
                    >
                      <Zap className="h-4 w-4" />
                    </motion.div>
                  </Button>
                )}
                <Badge 
                  variant={draft.status === 'draft' ? 'outline' : 'default'}
                  className="text-xs px-3 py-1 rounded-full"
                >
                  {draft.status === 'draft' ? 'Draft' : 'Published'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-muted/30 backdrop-blur-sm">
                <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-background/60">
                  <Eye className="h-4 w-4" />
                  Content Preview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background/60">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-background/60">
                  <Target className="h-4 w-4" />
                  SEO Analysis
                </TabsTrigger>
                <TabsTrigger value="structure" className="flex items-center gap-2 data-[state=active]:bg-background/60">
                  <Zap className="h-4 w-4" />
                  Structure
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden mt-4">
                <AnimatePresence mode="wait">
                  <TabsContent value="content" className="h-full m-0">
                    <TabErrorBoundary tabName="Content Preview" onRetry={handleRetryForTab}>
                      <motion.div
                        key="content-tab"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <ContentPreviewSection 
                          content={draft.content || ''}
                          title={draft.title || 'Untitled Draft'}
                          keywords={draft.keywords || []}
                          onCopy={handleCopyContent}
                          onExport={handleExport}
                          isLoading={false}
                        />
                      </motion.div>
                    </TabErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="h-full m-0">
                    <TabErrorBoundary tabName="Analytics" onRetry={handleRetryForTab}>
                      <motion.div
                        key="analytics-tab"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <MetadataAnalytics {...tabContentProps} />
                      </motion.div>
                    </TabErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="seo" className="h-full m-0">
                    <TabErrorBoundary tabName="SEO Analysis" onRetry={handleRetryForTab}>
                      <motion.div
                        key="seo-tab"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                          <KeywordPerformanceCard 
                            keywords={draft.keywords || []}
                            keywordUsage={analysisData.keywordUsage}
                            isAnalyzing={isAnalyzing}
                            onRetryAnalysis={retryAnalysis}
                          />
                          <SerpAnalysisDisplay 
                            serpData={analysisData.serpData}
                            draft={draft}
                            isAnalyzing={isAnalyzing}
                          />
                        </div>
                      </motion.div>
                    </TabErrorBoundary>
                  </TabsContent>
                  
                  <TabsContent value="structure" className="h-full m-0">
                    <TabErrorBoundary tabName="Structure" onRetry={handleRetryForTab}>
                      <motion.div
                        key="structure-tab"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                          <DocumentStructureVisualization 
                            documentStructure={analysisData.documentStructure}
                            isAnalyzing={isAnalyzing}
                          />
                          <SolutionIntegrationDashboard 
                            solution={draft.metadata?.selectedSolution}
                            solutionMetrics={analysisData.solutionMetrics}
                            isAnalyzing={isAnalyzing}
                          />
                        </div>
                      </motion.div>
                    </TabErrorBoundary>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="outline" onClick={onClose} className="px-6">
              Close
            </Button>
            <Button className="px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
