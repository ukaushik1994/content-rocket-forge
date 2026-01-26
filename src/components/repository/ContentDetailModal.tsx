import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  History,
  Wand2
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
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { MediaAssetsSection, MediaAsset } from '@/components/content/MediaAssetsSection';
import { imageGenOrchestrator } from '@/services/imageGenOrchestrator';
import { supabase } from '@/integrations/supabase/client';
import { ContentEditingToolbar, ContentQualityDashboard, VersionHistoryPanel } from '@/components/content/editing';
import { useContentEditing } from '@/hooks/useContentEditing';

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
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [localGeneratedImages, setLocalGeneratedImages] = useState<MediaAsset[]>([]);
  const [localContent, setLocalContent] = useState<string>('');
  const [isAIToolsOpen, setIsAIToolsOpen] = useState(true);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Content editing hook
  const { 
    isProcessing: isEditingProcessing, 
    regenerate, 
    improve, 
    expand, 
    compress, 
    changeTone 
  } = useContentEditing({
    contentId: content?.id,
    onContentUpdate: (newContent) => {
      setLocalContent(newContent);
      toast.success('Content updated');
    }
  });

  // Sync local content with prop
  useEffect(() => {
    if (content?.content) {
      setLocalContent(content.content);
    }
  }, [content?.content]);
  
  // Debug logging to track content data
  useEffect(() => {
    if (content) {
      console.log('[ContentDetailModal] Received content object:', {
        id: content.id,
        title: content.title,
        meta_title: content.meta_title,
        meta_description: content.meta_description,
        extractedTitle: extractTitleFromContent(content.content),
        hasMetaInMetadata: {
          metaTitle: content.metadata?.metaTitle,
          metaDescription: content.metadata?.metaDescription
        }
      });
    }
  }, [content]);
  
  // Collapsible section states
  const [isContentPreviewOpen, setIsContentPreviewOpen] = useState(true);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(true);
  const [isMediaAssetsOpen, setIsMediaAssetsOpen] = useState(true);
  const [isSerpAnalysisOpen, setIsSerpAnalysisOpen] = useState(true);
  const [isDocumentStructureOpen, setIsDocumentStructureOpen] = useState(false);
  const [isRepurposedOpen, setIsRepurposedOpen] = useState(true);
  
  // Get generated images from content (combine DB images with locally generated)
  const generatedImages: MediaAsset[] = useMemo(() => {
    const dbImages = (content as any)?.generated_images || (content as any)?.metadata?.generated_images || [];
    const allImages = [...(Array.isArray(dbImages) ? dbImages : []), ...localGeneratedImages];
    return allImages.map((img: any, index: number) => ({
      id: img.id || `image-${index}`,
      url: img.url,
      type: 'image' as const,
      prompt: img.prompt,
      alt: img.alt || img.prompt,
      createdAt: img.createdAt || img.created_at
    }));
  }, [content, localGeneratedImages]);

  // Reset local images when content changes
  useEffect(() => {
    setLocalGeneratedImages([]);
  }, [content?.id]);

  // Handle image generation for repository content
  const handleGenerateImages = useCallback(async () => {
    if (!content?.content || isGeneratingImages) return;
    
    setIsGeneratingImages(true);
    toast.info('Analyzing content and generating images...');
    
    try {
      const result = await imageGenOrchestrator.orchestrateForContent(content.content, {
        maxImages: 3,
        onSlotUpdate: (slot) => {
          console.log('[ContentDetailModal] Slot update:', slot);
        }
      });
      
      if (result.images.length > 0) {
        // Add to local state for immediate display
        const newImages: MediaAsset[] = result.images.map((img, idx) => ({
          id: `generated-${Date.now()}-${idx}`,
          url: img.url,
          type: 'image' as const,
          prompt: img.prompt,
          alt: img.prompt,
          createdAt: new Date().toISOString()
        }));
        setLocalGeneratedImages(newImages);
        
        // Persist to database
        const existingImages = (content as any)?.generated_images || [];
        const allImages = [...(Array.isArray(existingImages) ? existingImages : []), ...result.images];
        
        const { error } = await supabase
          .from('content_items')
          .update({ generated_images: allImages })
          .eq('id', content.id);
        
        if (error) {
          console.error('[ContentDetailModal] Failed to save images:', error);
          toast.error('Images generated but failed to save');
        } else {
          toast.success(`Generated ${result.images.length} images`);
        }
      } else {
        toast.info('No suitable image slots found in content');
      }
    } catch (error) {
      console.error('[ContentDetailModal] Image generation error:', error);
      toast.error('Failed to generate images');
    } finally {
      setIsGeneratingImages(false);
    }
  }, [content, isGeneratingImages]);
  
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
              {extractTitleFromContent(content.content) || content.metadata?.metaTitle || content.title}
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
                    const allOpen = isContentPreviewOpen && isKeywordsOpen && isMediaAssetsOpen && isSerpAnalysisOpen && isDocumentStructureOpen && isRepurposedOpen;
                    setIsContentPreviewOpen(!allOpen);
                    setIsKeywordsOpen(!allOpen);
                    setIsMediaAssetsOpen(!allOpen);
                    setIsSerpAnalysisOpen(!allOpen);
                    setIsDocumentStructureOpen(!allOpen);
                    setIsRepurposedOpen(!allOpen);
                  }}
                  className="text-xs h-7 px-2"
                >
                  {(isContentPreviewOpen && isKeywordsOpen && isMediaAssetsOpen && isSerpAnalysisOpen && isDocumentStructureOpen && isRepurposedOpen) ? 'Collapse All' : 'Expand All'}
                </Button>
                {generatedImages.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {generatedImages.length} Images
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 pb-6">
              {/* Left Side - Content Preview & Repurposed Content */}
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
                                {localContent || content.content || 'No content available'}
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
                              {(localContent || content.content) ? (
                                (localContent || content.content).length > 300 
                                  ? (localContent || content.content).substring(0, 300) + '...'
                                  : (localContent || content.content)
                              ) : 'No content available'}
                            </div>
                            {(localContent || content.content) && (localContent || content.content).length > 300 && (
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

                {/* Media Assets Section */}
                <CollapsibleSection
                  isOpen={isMediaAssetsOpen}
                  onToggle={() => setIsMediaAssetsOpen(!isMediaAssetsOpen)}
                  title="Media Assets"
                  icon={ImageIcon}
                  count={generatedImages.length}
                >
                  {isGeneratingImages ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                      <p className="text-sm text-muted-foreground">Generating images...</p>
                    </div>
                  ) : (
                    <MediaAssetsSection
                      images={generatedImages}
                      isCollapsible={false}
                      showVideoPlaceholder={true}
                      showEmptyState={true}
                      onDelete={(asset) => {
                        toast.info('Image deletion coming soon');
                      }}
                      onRegenerate={(asset) => {
                        toast.info('Image regeneration coming soon');
                      }}
                      onGenerateImage={handleGenerateImages}
                      compact={false}
                    />
                  )}
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

                {/* AI Editing Tools */}
                <CollapsibleSection
                  isOpen={isAIToolsOpen}
                  onToggle={() => setIsAIToolsOpen(!isAIToolsOpen)}
                  title="AI Editing Tools"
                  icon={Wand2}
                >
                  <div className="space-y-4">
                    {/* Quick Actions Toolbar */}
                    <ContentEditingToolbar
                      onRegenerate={() => regenerate(localContent || content.content)}
                      onExpand={() => expand(localContent || content.content)}
                      onCompress={() => compress(localContent || content.content)}
                      onImprove={() => improve(localContent || content.content)}
                      onChangeTone={(tone) => changeTone(localContent || content.content, tone)}
                      isProcessing={isEditingProcessing}
                    />
                    
                    {/* Quality Dashboard */}
                    <ContentQualityDashboard
                      content={localContent || content.content}
                      title={extractTitleFromContent(content.content) || content.title}
                      onAutoFix={async (rec) => {
                        // Auto-fix via AI improvement
                        await improve(localContent || content.content);
                      }}
                    />
                  </div>
                </CollapsibleSection>

                {/* Version History */}
                <CollapsibleSection
                  isOpen={isVersionHistoryOpen}
                  onToggle={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
                  title="Version History"
                  icon={History}
                >
                  <VersionHistoryPanel
                    contentId={content.id}
                    currentContent={localContent || content.content}
                    onRestore={(restoredContent) => {
                      setLocalContent(restoredContent);
                      toast.success('Version restored');
                    }}
                  />
                </CollapsibleSection>

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
                        {content.meta_title || (
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

                      <Button
                        onClick={handleRepurpose}
                        className="w-full"
                        variant="outline"
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        {repurposedFormats.length > 0 ? 'Manage Repurposed Content' : 'Repurpose Content'}
                      </Button>

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