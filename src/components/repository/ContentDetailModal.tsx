import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertCircle
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { CustomBadge } from '@/components/ui/custom-badge';
import { SolutionIntegrationBadge } from './SolutionIntegrationBadge';
import { OptimizationBadges } from './OptimizationBadges';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

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
      await deleteContentItem(content.id);
      toast.success('Content deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);
  const wordCount = content.metadata?.wordCount || content.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);
  const solution = (content as any).metadata?.solution || (content as any).metadata?.selectedSolution;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-background border-border text-foreground backdrop-blur-xl shadow-2xl rounded-xl flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-foreground pr-8">
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)] flex-1 min-h-0" hideScrollbar>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pr-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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

              {/* Full Content Preview */}
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
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {content.content || 'No content available'}
                      </div>
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

              {/* Optimization Badges */}
              <OptimizationBadges metadata={content.metadata} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Header with Icon, Status & Actions */}
              <Card className="bg-muted/5 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <Badge className={getStatusColor(content.status)} variant="outline">
                          {content.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {content.content_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDuplicate}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>

              {/* Content Metrics */}
              <Card className="bg-muted/5 border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Content Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/10 rounded-lg border border-border">
                      <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold text-foreground">{wordCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center p-3 bg-muted/10 rounded-lg border border-border">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="font-semibold text-foreground">{readingTime} min</div>
                      <div className="text-xs text-muted-foreground">Read Time</div>
                    </div>
                  </div>
                  
                  {content.seo_score && (
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/20 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">SEO Score</span>
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {content.seo_score}
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
                    <div className="flex items-center gap-3">
                      {solution.logoUrl ? (
                        <img
                          src={solution.logoUrl}
                          alt={solution.name}
                          className="h-8 w-8 rounded object-contain bg-background/80 border border-border p-1"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted grid place-items-center text-sm font-semibold">
                          {solution.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{solution.name}</p>
                        {solution.description && (
                          <p className="text-xs text-muted-foreground">{solution.description}</p>
                        )}
                      </div>
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
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full gap-2 bg-muted/10 border-border text-muted-foreground hover:bg-muted/20"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};