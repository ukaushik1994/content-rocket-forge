
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Edit2, FileText, Tag, Copy, Download, Maximize2, Eye, BarChart3, Zap, Target, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { toast } from 'sonner';
import { ContentPreviewSection } from './enhanced-detail/ContentPreviewSection';
import { MetadataAnalytics } from './enhanced-detail/MetadataAnalytics';
import { SerpAnalysisDisplay } from './enhanced-detail/SerpAnalysisDisplay';
import { SolutionIntegrationDashboard } from './enhanced-detail/SolutionIntegrationDashboard';
import { DocumentStructureVisualization } from './enhanced-detail/DocumentStructureVisualization';
import { KeywordPerformanceCard } from './enhanced-detail/KeywordPerformanceCard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  // All hooks must be called before any conditional returns
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'seo' | 'structure'>('content');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState({
    serpData: null,
    documentStructure: null,
    solutionMetrics: null,
    keywordUsage: []
  });

  // Stable callback for loading analysis - remove draft dependency to prevent infinite loops
  const loadComprehensiveAnalysis = useCallback(async () => {
    if (!draft || !draft.content) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Extract document structure (always works)
      const structure = extractDocumentStructure(draft.content);
      
      // Calculate keyword usage if keywords available
      let keywordUsage = [];
      if (draft.keywords && Array.isArray(draft.keywords) && draft.keywords.length > 0) {
        try {
          const mainKeyword = draft.keywords[0];
          const selectedKeywords = draft.keywords.slice(1);
          keywordUsage = calculateKeywordUsage(draft.content, mainKeyword, selectedKeywords);
        } catch (error) {
          console.warn('Failed to calculate keyword usage:', error);
        }
      }
      
      // Analyze SERP data if keywords available
      let serpAnalysis = null;
      if (draft.keywords && Array.isArray(draft.keywords) && draft.keywords.length > 0) {
        try {
          const mainKeyword = draft.keywords[0];
          if (mainKeyword && typeof mainKeyword === 'string') {
            serpAnalysis = await analyzeKeywordSerp(mainKeyword);
          }
        } catch (error) {
          console.warn('Failed to analyze SERP data:', error);
        }
      }
      
      // Analyze solution integration if solution data is available
      let solutionAnalysis = null;
      if (draft.metadata?.selectedSolution) {
        try {
          solutionAnalysis = analyzeSolutionIntegration(draft.content, draft.metadata.selectedSolution);
        } catch (error) {
          console.warn('Failed to analyze solution integration:', error);
        }
      }
      
      setAnalysisData({
        serpData: serpAnalysis,
        documentStructure: structure,
        solutionMetrics: solutionAnalysis,
        keywordUsage
      });
    } catch (error) {
      console.error('Error loading comprehensive analysis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to load analysis data');
      toast.error('Some analysis features may not be available');
    } finally {
      setIsAnalyzing(false);
    }
  }, []); // Empty dependency array to prevent infinite loops

  // Load comprehensive analysis when component mounts or draft changes
  useEffect(() => {
    if (draft && draft.content) {
      loadComprehensiveAnalysis();
    }
  }, [draft, loadComprehensiveAnalysis]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  }, []);

  const handleCopyContent = useCallback(async () => {
    if (draft?.content) {
      try {
        await navigator.clipboard.writeText(draft.content);
        toast.success('Content copied to clipboard');
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = draft.content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Content copied to clipboard');
      }
    }
  }, []); // Remove draft dependency

  const handleExport = useCallback(() => {
    if (!draft?.content) {
      toast.error('No content to export');
      return;
    }

    try {
      const element = document.createElement('a');
      const file = new Blob([draft.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${draft.title || 'content'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Content exported successfully');
    } catch (error) {
      toast.error('Failed to export content');
    }
  }, []); // Remove draft dependency

  const retryAnalysis = useCallback(() => {
    loadComprehensiveAnalysis();
  }, [loadComprehensiveAnalysis]);

  // Early return after all hooks are called
  if (!draft) return null;

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
                  >
                    <RefreshCw className="h-4 w-4" />
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
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="h-full flex flex-col">
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
                    <motion.div
                      key="content"
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
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="h-full m-0">
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <MetadataAnalytics 
                        draft={draft}
                        isAnalyzing={isAnalyzing}
                        analysisData={analysisData}
                        formatDate={formatDate}
                      />
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="seo" className="h-full m-0">
                    <motion.div
                      key="seo"
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
                  </TabsContent>
                  
                  <TabsContent value="structure" className="h-full m-0">
                    <motion.div
                      key="structure"
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
