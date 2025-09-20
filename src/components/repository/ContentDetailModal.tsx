import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  FileSearch
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

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-background border-border text-foreground backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
          <DialogHeader className="flex-shrink-0 px-2 sm:px-0">
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

        <ScrollArea className="h-[calc(90vh-8rem)] flex-1 min-h-0" hideScrollbar>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 pr-2 sm:pr-4 px-2 sm:px-0">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Description */}
              {content.metadata?.description && (
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{content.metadata.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Content Preview */}
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Content Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                            <ScrollArea className="h-64 w-full border border-border rounded-lg bg-muted/5">
                              <div className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {content.content || 'No content available'}
                              </div>
                            </ScrollArea>
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
                </CardContent>
              </Card>

              {/* Keywords & Tags */}
              {(content.keywords?.length > 0 || content.metadata?.tags?.length > 0) && (
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Hash className="h-5 w-5 text-primary" />
                      Keywords & Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                </Card>
              )}

              {/* SERP Analysis */}
              {(content.metadata?.serpSelections?.length > 0 || content.metadata?.documentStructure) && (
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      SERP Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.metadata?.serpSelections?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Selected SERP Items</h4>
                        <RepositorySerpDisplay serpSelections={content.metadata.serpSelections} />
                      </div>
                    )}
                    
                    {content.metadata?.documentStructure && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Document Structure</h4>
                        <RepositoryDocumentStructure documentStructure={content.metadata.documentStructure} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

                  {/* Optimization Badges */}
                  <OptimizationBadges metadata={content.metadata} />

                  {/* Repurposed Content Section */}
                  {repurposedFormats.length > 0 && (
                    <Card className="bg-muted/5 border-border">
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          Repurposed Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RepurposedContentIcons
                          repurposedFormats={repurposedFormats}
                          onFormatClick={handleRepurposedFormatClick}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Content Type & Status */}
              <Card className="bg-muted/5 border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <Badge className={getStatusColor(content.status)} variant="outline">
                        {content.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {content.content_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="default" 
                      className="w-full gap-2 bg-primary hover:bg-primary/90"
                      onClick={handleRepurpose}
                    >
                      <Undo className="h-4 w-4" />
                      Repurpose Content
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                          <MoreVertical className="h-4 w-4" />
                          More Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDuplicate}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={isLoading}>
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-3 bg-muted/10 rounded-lg border border-border cursor-help">
                          <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="font-semibold text-foreground">{wordCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Words</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total word count in the content</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center p-3 bg-muted/10 rounded-lg border border-border cursor-help">
                          <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="font-semibold text-foreground">{readingTime} min</div>
                          <div className="text-xs text-muted-foreground">Read Time</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Estimated reading time (200 words/min)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* SEO Score */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-border cursor-help">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">SEO Score</span>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {content.seo_score || content.metadata?.seoScore || 'N/A'}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>SEO optimization score based on keywords, structure, and readability</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {(content.metadata as any)?.keywordDensity && (
                      <div className="text-center p-2 bg-muted/10 rounded-lg border border-border">
                        <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <div className="font-semibold text-foreground text-sm">{(content.metadata as any).keywordDensity}%</div>
                        <div className="text-xs text-muted-foreground">Keyword Density</div>
                      </div>
                    )}
                    {content.metadata?.readabilityScore && (
                      <div className="text-center p-2 bg-muted/10 rounded-lg border border-border">
                        <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
                        <div className="font-semibold text-foreground text-sm">{content.metadata.readabilityScore}</div>
                        <div className="text-xs text-muted-foreground">Readability</div>
                      </div>
                    )}
                  </div>

                  {/* Engagement Metrics */}
                  {((content.metadata as any)?.engagementScore || (content.metadata as any)?.optimizationScore) && (
                    <div className="p-3 bg-muted/10 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Optimization</span>
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {(content.metadata as any)?.optimizationScore || (content.metadata as any)?.engagementScore || 'N/A'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Solution Integration */}
              {solution && (
                <Card className="bg-muted/5 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Solution Integration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {solution.logoUrl || solution.logo ? (
                          <img
                            src={solution.logoUrl || solution.logo}
                            alt={solution.name}
                            className="h-10 w-10 rounded object-contain bg-background/80 border border-border p-1"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/20 grid place-items-center text-sm font-semibold text-primary">
                            {solution.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{solution.name}</p>
                          {solution.category && (
                            <p className="text-xs text-muted-foreground">{solution.category}</p>
                          )}
                          {solution.description && (
                            <p className="text-xs text-muted-foreground mt-1">{solution.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Integration Metrics */}
                      {(content.metadata as any)?.integrationScore && (
                        <div className="p-2 bg-muted/10 rounded-lg border border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Integration Score</span>
                            <span className="font-semibold text-foreground">{(content.metadata as any).integrationScore}%</span>
                          </div>
                        </div>
                      )}
                      
                      {(content.metadata as any)?.featuresCovered && (
                        <div className="p-2 bg-muted/10 rounded-lg border border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Features Covered</span>
                            <span className="font-semibold text-foreground">{(content.metadata as any).featuresCovered}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground">{format(new Date(content.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="text-foreground">{format(new Date(content.updated_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Relative:</span>
                      <span className="text-foreground">{formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleEdit}
                    className="w-full gap-2 bg-primary/20 border-primary/30 text-primary hover:bg-primary/30"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Content
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
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