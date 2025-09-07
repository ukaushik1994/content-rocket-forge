import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-left">
                  {content.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(content.status)}>
                    {content.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground capitalize">
                    {content.content_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Description */}
          {content.metadata?.description && (
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {content.metadata.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Solution Integration */}
          {solution && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
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
                    <p className="font-medium">{solution.name}</p>
                    {solution.description && (
                      <p className="text-xs text-muted-foreground">{solution.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {content.content_type === 'glossary' && content.metadata ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Terms Progress</span>
                    <span className="font-medium">
                      {content.metadata.completedTerms || 0} / {content.metadata.termCount || 0}
                    </span>
                  </div>
                  {content.metadata.domainUrl && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Domain:</span> {content.metadata.domainUrl}
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground line-clamp-6">
                    {content.content.substring(0, 500)}
                    {content.content.length > 500 && '...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimization Badges */}
          <OptimizationBadges metadata={content.metadata} />

          {/* Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Content Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <FileText className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                  <div className="font-semibold">{wordCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-green-400" />
                  <div className="font-semibold">{readingTime} min</div>
                  <div className="text-xs text-muted-foreground">Read Time</div>
                </div>
                {content.seo_score && (
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <Star className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
                    <div className="font-semibold">{content.seo_score}</div>
                    <div className="text-xs text-muted-foreground">SEO Score</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords & Tags */}
          {(content.keywords?.length > 0 || content.metadata?.tags?.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Keywords & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.keywords?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">SEO Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {content.metadata?.tags?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {content.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(content.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(new Date(content.updated_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relative:</span>
                  <span>{formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button onClick={handleEdit} className="flex-1">
            <Edit className="mr-2 h-4 w-4" />
            Edit Content
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};