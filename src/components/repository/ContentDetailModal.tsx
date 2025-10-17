import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit, 
  MoreVertical, 
  Eye, 
  Trash2, 
  Copy,
  Calendar,
  BarChart3,
  Star,
  Clock,
  Hash,
  Target,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Info,
  Undo,
  Layers,
  Search,
  FileSearch,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { CustomBadge } from '@/components/ui/custom-badge';
import { SolutionIntegrationBadge } from './SolutionIntegrationBadge';
import { OptimizationBadges } from './OptimizationBadges';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { RepurposedContentIcons } from './RepurposedContentIcons';
import { RepurposedContentViewer } from './RepurposedContentViewer';
import { ContentRepurposingModal } from './ContentRepurposingModal';
import { useRepurposedContentData } from '@/components/content-repurposing/hooks/repurposing/useRepurposedContentData';
import { repurposedContentService } from '@/services/repurposedContentService';
import { RepositorySerpDisplay } from './RepositorySerpDisplay';
import { RepositoryDocumentStructure } from './RepositoryDocumentStructure';

interface ContentDetailModalProps {
  content: ContentItemType | null;
  open: boolean;
  onClose: () => void;
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ 
  content, 
  open, 
  onClose 
}) => {
  const { deleteContentItem } = useContent();
  const navigate = useNavigate();
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Collapsible section states
  const [isContentPreviewOpen, setIsContentPreviewOpen] = useState(true);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(true);
  const [isSerpAnalysisOpen, setIsSerpAnalysisOpen] = useState(true);
  const [isDocumentStructureOpen, setIsDocumentStructureOpen] = useState(false);
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
  const [isRepurposedOpen, setIsRepurposedOpen] = useState(true);
  
  // Repurposing states
  const [repurposingModalOpen, setRepurposingModalOpen] = useState(false);
  const [repurposedViewerOpen, setRepurposedViewerOpen] = useState(false);
  const [selectedRepurposedContent, setSelectedRepurposedContent] = useState<any>(null);
  const [isLoadingRepurposed, setIsLoadingRepurposed] = useState(false);

  // Load repurposed content data
  const { 
    repurposedFormats, 
    repurposedContentMap, 
    isLoading: isLoadingRepurposedData,
    refreshData 
  } = useRepurposedContentData(content?.id || null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
      if (e.key === 'Enter' && open && content?.content && content.content.length > 300) {
        setIsContentExpanded(!isContentExpanded);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose, isContentExpanded, content]);

  if (!content) return null;

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'blog': return Edit;
      case 'glossary': return BookOpen;
      case 'email': return Mail;
      case 'landing_page': return Globe;
      case 'social_post': return MessageSquare;
      default: return FileText;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'from-blue-500 to-blue-600';
      case 'blog': return 'from-green-500 to-green-600';
      case 'glossary': return 'from-purple-500 to-purple-600';
      case 'email': return 'from-orange-500 to-orange-600';
      case 'landing_page': return 'from-cyan-500 to-cyan-600';
      case 'social_post': return 'from-pink-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'published': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const handleEdit = () => {
    if (content.content_type === 'glossary') {
      navigate(`/glossary-builder?edit=${content.id}`);
    } else {
      navigate(`/content-builder?edit=${content.id}`);
    }
    onClose();
  };

  const handleDuplicate = async () => {
    toast.info('Duplicate functionality coming soon!');
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteContentItem(content.id);
      toast.success('Content deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete content');
    } finally {
      setIsLoading(false);
    }
  };

  // Repurposing handlers
  const handleRepurpose = () => {
    setRepurposingModalOpen(true);
  };

  const handleRepurposedFormatClick = async (formatId: string) => {
    if (!content) return;
    
    setIsLoadingRepurposed(true);
    try {
      const repurposedContent = await repurposedContentService.getRepurposedContentByFormat(
        content.id, 
        formatId
      );
      
      if (repurposedContent) {
        setSelectedRepurposedContent(repurposedContent);
        setRepurposedViewerOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load repurposed content');
    } finally {
      setIsLoadingRepurposed(false);
    }
  };

  const handleRepurposedFormatChange = async (formatId: string) => {
    if (!content) return;
    
    setIsLoadingRepurposed(true);
    try {
      const repurposedContent = await repurposedContentService.getRepurposedContentByFormat(
        content.id, 
        formatId
      );
      
      if (repurposedContent) {
        setSelectedRepurposedContent(repurposedContent);
      }
    } catch (error) {
      toast.error('Failed to load format content');
    } finally {
      setIsLoadingRepurposed(false);
    }
  };

  const handleCopyContent = (contentText: string) => {
    navigator.clipboard.writeText(contentText);
  };

  const handleDownloadContent = (contentText: string, formatName: string) => {
    const blob = new Blob([contentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content?.title || 'content'} - ${formatName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteRepurposed = async (contentId: string, formatId: string) => {
    const success = await repurposedContentService.deleteRepurposedContent(contentId, formatId);
    if (success) {
      refreshData();
      toast.success('Repurposed content deleted successfully');
    }
    return success;
  };

  const handleContentGenerated = () => {
    refreshData();
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);
  const wordCount = content.metadata?.wordCount || content.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);
  const solution = (content as any).metadata?.solution || (content as any).metadata?.selectedSolution;

  // Collapsible Section Component
  const CollapsibleSection = ({ 
    isOpen, 
    onToggle, 
    title, 
    icon: Icon, 
    count,
    children,
    defaultOpen = false 
  }: { 
    isOpen: boolean; 
    onToggle: () => void; 
    title: string; 
    icon: any; 
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => (
    <Card className="bg-muted/5 border-border">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/10 transition-colors duration-200 rounded-t-lg">
            <CardTitle className="text-lg text-foreground flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {title}
                {count !== undefined && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {count}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-up-1 data-[state=open]:slide-in-from-top-1">
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-7xl h-[95vh] sm:h-[90vh] bg-background border-border text-foreground backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-border">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-foreground pr-8 line-clamp-2">
              {content.title}
            </DialogTitle>
            <div className="text-xs sm:text-sm text-muted-foreground capitalize">
              {content.content_type.replace('_', ' ')} • {content.status}
              <span className="text-xs text-muted-foreground/60 ml-2 hidden sm:inline">
                Press Esc to close • Enter to expand content
              </span>
            </div>
          </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 pb-2">
              {/* Quick Controls */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Quick actions:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const allOpen = isContentPreviewOpen && isKeywordsOpen && isSerpAnalysisOpen && isDocumentStructureOpen && isOptimizationOpen && isRepurposedOpen;
                    setIsContentPreviewOpen(!allOpen);
                    setIsKeywordsOpen(!allOpen);
                    setIsSerpAnalysisOpen(!allOpen);
                    setIsDocumentStructureOpen(!allOpen);
                    setIsOptimizationOpen(!allOpen);
                    setIsRepurposedOpen(!allOpen);
                  }}
                  className="text-xs h-7 px-2"
                >
                  {(isContentPreviewOpen && isKeywordsOpen && isSerpAnalysisOpen && isDocumentStructureOpen && isOptimizationOpen && isRepurposedOpen) ? 'Collapse All' : 'Expand All'}
                </Button>
              </div>
            </div>
            
            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 pb-6">
              {/* Left Side - Content Preview Only */}
              <div className="space-y-4 sm:space-y-6">
                {/* Content Preview */}
                <CollapsibleSection
                  isOpen={isContentPreviewOpen}
                  onToggle={() => setIsContentPreviewOpen(!isContentPreviewOpen)}
                  title="Content Preview"
                  icon={Eye}
                >
                  {content.content_type === 'glossary' && content.metadata ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-border">
                        <span className="text-sm text-muted-foreground">Terms Progress</span>
                        <span className="font-bold text-foreground text-lg">
                          {content.metadata.completedTerms || 0} / {content.metadata.termCount || 0}
                        </span>
                      </div>
                      {content.metadata.domainUrl && (
                        <div className="p-3 bg-muted/10 rounded-lg border border-border">
                          <span className="font-medium text-muted-foreground">Domain:</span>
                          <span className="ml-2 text-foreground">{content.metadata.domainUrl}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <AnimatePresence mode="wait">
                        {isContentExpanded ? (
                          <motion.div 
                            key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                          >
                            <div className="w-full border border-border rounded-lg bg-muted/5 max-h-80 overflow-y-auto">
                              <div className="p-3 sm:p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {content.content || 'No content available'}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:text-primary/80"
                              onClick={() => setIsContentExpanded(false)}
                            >
                              Show Less
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="collapsed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                              {content.content ? (
                                content.content.length > 300 
                                  ? content.content.substring(0, 300) + '...'
                                  : content.content
                              ) : 'No content available'}
                            </div>
                            {content.content && content.content.length > 300 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 text-primary hover:text-primary/80"
                                onClick={() => setIsContentExpanded(true)}
                              >
                                Show More
                              </Button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </CollapsibleSection>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Content Stats with Status & Solution */}
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Content Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/10 rounded-lg border border-border/20">
                        <div className="text-2xl font-bold text-foreground">{wordCount}</div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </div>
                      <div className="text-center p-3 bg-muted/10 rounded-lg border border-border/20">
                        <div className="text-2xl font-bold text-foreground">{readingTime}m</div>
                        <div className="text-xs text-muted-foreground">Read time</div>
                      </div>
                    </div>
                    
                    {/* Status & Solution Indicators */}
                    <div className="space-y-3 pt-2 border-t border-border/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Status</span>
                        </div>
                        <Badge className={`${getStatusColor(content.status)} text-xs px-2 py-1`}>
                          {content.status}
                        </Badge>
                      </div>
                      
                      {solution && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Solution</span>
                          </div>
                          <div className="flex items-center">
                            <SolutionIntegrationBadge metadata={content.metadata} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm text-foreground">
                          {format(new Date(content.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Modified</span>
                        <span className="text-sm text-foreground">
                          {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meta Information (SEO) - Always show */}
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      SEO Meta Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Meta Title</h4>
                      <p className="text-sm text-foreground bg-muted/10 p-3 rounded-lg border border-border/20">
                        {content.meta_title || content.title || (
                          <span className="text-muted-foreground italic">No meta title set</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Meta Description</h4>
                      <p className="text-sm text-foreground bg-muted/10 p-3 rounded-lg border border-border/20">
                        {content.meta_description || (
                          <span className="text-muted-foreground italic">No meta description set</span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords & Tags */}
                {(content.keywords?.length > 0 || content.metadata?.tags?.length > 0) && (
                  <CollapsibleSection
                    isOpen={isKeywordsOpen}
                    onToggle={() => setIsKeywordsOpen(!isKeywordsOpen)}
                    title="Keywords & Tags"
                    icon={Hash}
                    count={(content.keywords?.length || 0) + (content.metadata?.tags?.length || 0)}
                  >
                    <div className="space-y-4">
                      {content.keywords?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">SEO Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {content.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-muted-foreground border-border bg-muted/10">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {content.metadata?.tags?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {content.metadata.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-muted-foreground border-border bg-muted/10">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleSection>
                )}

                {/* SERP Analysis */}
                {content.metadata?.serpSelections?.length > 0 && (
                  <CollapsibleSection
                    isOpen={isSerpAnalysisOpen}
                    onToggle={() => setIsSerpAnalysisOpen(!isSerpAnalysisOpen)}
                    title="SERP Analysis"
                    icon={Search}
                    count={content.metadata?.serpSelections?.length || 0}
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Selected SERP Items</h4>
                      <RepositorySerpDisplay serpSelections={content.metadata.serpSelections} />
                    </div>
                  </CollapsibleSection>
                )}

                {/* Document Structure */}
                {content.metadata?.documentStructure && (
                  <CollapsibleSection
                    isOpen={isDocumentStructureOpen}
                    onToggle={() => setIsDocumentStructureOpen(!isDocumentStructureOpen)}
                    title="Document Structure"
                    icon={FileSearch}
                    count={content.metadata.documentStructure.headings?.length || 0}
                  >
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Structure Analysis</h4>
                      <RepositoryDocumentStructure documentStructure={content.metadata.documentStructure} />
                    </div>
                  </CollapsibleSection>
                )}

                {/* Optimization */}
                <CollapsibleSection
                  isOpen={isOptimizationOpen}
                  onToggle={() => setIsOptimizationOpen(!isOptimizationOpen)}
                  title="Optimization"
                  icon={Target}
                >
                  <OptimizationBadges metadata={content.metadata} />
                </CollapsibleSection>

                {/* Repurposed Content Section */}
                {repurposedFormats.length > 0 && (
                  <CollapsibleSection
                    isOpen={isRepurposedOpen}
                    onToggle={() => setIsRepurposedOpen(!isRepurposedOpen)}
                    title="Repurposed Content"
                    icon={Layers}
                    count={repurposedFormats.length}
                  >
                    <RepurposedContentIcons
                      repurposedFormats={repurposedFormats}
                      onFormatClick={handleRepurposedFormatClick}
                    />
                  </CollapsibleSection>
                )}

                {/* Actions */}
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleEdit}
                        className="w-full"
                        variant="default"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>

                      {repurposedFormats.length > 0 && (
                        <Button
                          onClick={handleRepurpose}
                          className="w-full"
                          variant="outline"
                        >
                          <Layers className="h-4 w-4 mr-2" />
                          Repurpose Content
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <MoreVertical className="h-4 w-4 mr-2" />
                            More Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={handleDuplicate}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={handleDelete}
                            className="text-destructive"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>
        </DialogContent>
      </Dialog>
      
      {/* Repurposing Modal */}
      <ContentRepurposingModal
        open={repurposingModalOpen}
        onClose={() => setRepurposingModalOpen(false)}
        content={content}
        onContentGenerated={handleContentGenerated}
      />

      {/* Repurposed Content Viewer */}
      <RepurposedContentViewer
        open={repurposedViewerOpen}
        onClose={() => setRepurposedViewerOpen(false)}
        content={selectedRepurposedContent}
        availableFormats={repurposedFormats}
        isLoading={isLoadingRepurposed}
        onFormatChange={handleRepurposedFormatChange}
        onCopy={handleCopyContent}
        onDownload={handleDownloadContent}
        onDelete={handleDeleteRepurposed}
      />
    </TooltipProvider>
  );
};