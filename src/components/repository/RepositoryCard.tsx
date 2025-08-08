import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CustomBadge } from '@/components/ui/custom-badge';
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
  Star
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { SolutionIntegrationBadge } from './SolutionIntegrationBadge';
import { OptimizationBadges } from './OptimizationBadges';

interface RepositoryCardProps {
  content: ContentItemType;
  onView: () => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ 
  content, 
  onView 
}) => {
  const { deleteContentItem } = useContent();
  const navigate = useNavigate();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <CustomBadge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Draft</CustomBadge>;
      case 'published':
        return <CustomBadge className="bg-green-500/20 text-green-600 border-green-500/30">Published</CustomBadge>;
      case 'archived':
        return <CustomBadge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Archived</CustomBadge>;
      default:
        return <CustomBadge className="bg-muted text-muted-foreground">Unknown</CustomBadge>;
    }
  };

  const handleEdit = () => {
    if (content.content_type === 'glossary') {
      navigate(`/glossary-builder?edit=${content.id}`);
    } else {
      navigate(`/content-builder?edit=${content.id}`);
    }
  };

  const handleDuplicate = async () => {
    // TODO: Implement duplicate functionality
    toast.info('Duplicate functionality coming soon!');
  };

  const handleDelete = async () => {
    try {
      await deleteContentItem(content.id);
      toast.success('Content deleted successfully');
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);

  const wordCount = content.metadata?.wordCount || content.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  const solution = (content as any).metadata?.solution || (content as any).metadata?.selectedSolution;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="relative glass-card h-full bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden">
        {/* Solution indicator */}
        {solution && (
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            {solution.logoUrl ? (
              <div
                className="h-7 w-7 rounded-md overflow-hidden bg-background/80 border border-border shadow-sm"
                title={solution.name || 'Solution'}
              >
                <img
                  src={solution.logoUrl}
                  alt={`${solution.name || 'Solution'} logo`}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : solution.name ? (
              <div
                className="h-7 w-7 rounded-md bg-muted/60 text-foreground/80 border border-border grid place-items-center text-[10px] font-semibold"
                title={solution.name}
              >
                {solution.name.charAt(0).toUpperCase()}
              </div>
            ) : null}
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
              <IconComponent className="h-5 w-5" />
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(content.status)}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {content.title}
            </h3>
            
            {content.metadata?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.metadata.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Solution Integration Section */}
          <SolutionIntegrationBadge metadata={content.metadata} />

          {/* Content Preview */}
          {content.content_type === 'glossary' && content.metadata ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Terms</span>
                <span className="font-medium">
                  {content.metadata.completedTerms || 0} / {content.metadata.termCount || 0}
                </span>
              </div>
              {content.metadata.domainUrl && (
                <div className="text-xs text-muted-foreground">
                  Domain: {content.metadata.domainUrl}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content.content.substring(0, 150)}...
            </p>
          )}

          {/* Optimization Badges */}
          <OptimizationBadges metadata={content.metadata} />

          {/* Metrics */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{readingTime} min read</span>
              </div>
              {content.seo_score && (
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>SEO: {content.seo_score}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {content.metadata?.tags && content.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.metadata.tags.slice(0, 3).map((tag, index) => (
                <CustomBadge 
                  key={index}
                  className="text-xs bg-muted/50 text-muted-foreground"
                >
                  {tag}
                </CustomBadge>
              ))}
              {content.metadata.tags.length > 3 && (
                <CustomBadge className="text-xs bg-muted/50 text-muted-foreground">
                  +{content.metadata.tags.length - 3}
                </CustomBadge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onView}
              className="h-8 px-3 text-xs hover:bg-primary/10 hover:text-primary"
            >
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};