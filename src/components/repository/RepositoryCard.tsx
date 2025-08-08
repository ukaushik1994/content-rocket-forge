import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CustomBadge } from '@/components/ui/custom-badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Copy,
  Calendar,
  BarChart3,
  Clock,
  Target,
  Tag,
  Building2
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);

  const wordCount = content.metadata?.wordCount || content.content.split(' ').length;
  const readingTime = content.metadata?.readingTime || Math.ceil(wordCount / 200);

  // Get solution information from metadata - using any to access dynamic solution properties
  const solutionInfo = (content.metadata as any)?.solution_name ? {
    name: (content.metadata as any).solution_name,
    logo: (content.metadata as any).solution_logo || null
  } : null;

  const contentTypeDisplay = content.content_type.replace('_', ' ').toUpperCase();
  const statusColor = content.status === 'published' ? 'bg-green-500/20 text-green-600' : 
                     content.status === 'draft' ? 'bg-yellow-500/20 text-yellow-600' : 
                     'bg-gray-500/20 text-gray-600';

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="h-full flex flex-col glass-card bg-background/60 backdrop-blur-xl border-white/10 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl group overflow-hidden">
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${colorGradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
                  {content.title}
                </CardTitle>
                
                {/* Solution Chip - Prominent placement */}
                {solutionInfo && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-primary/10 backdrop-blur-sm rounded-lg border border-primary/20">
                    {solutionInfo.logo ? (
                      <img 
                        src={solutionInfo.logo} 
                        alt={`${solutionInfo.name} logo`}
                        className="w-5 h-5 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building2 className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-primary">
                      For: {solutionInfo.name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <CustomBadge 
                    className={`text-xs ${statusColor} font-medium`}
                  >
                    {content.status}
                  </CustomBadge>
                  <CustomBadge className="text-xs border border-white/20">
                    {contentTypeDisplay}
                  </CustomBadge>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/20">
                <DropdownMenuItem onClick={handleEdit} className="hover:bg-white/10">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} className="hover:bg-white/10">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between pb-4">
          <div className="space-y-4">
            {/* Content Description */}
            {content.metadata?.description && (
              <CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {content.metadata.description}
              </CardDescription>
            )}

            {/* Content Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {wordCount && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-white/10">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  <span className="font-medium">{wordCount.toLocaleString()} words</span>
                </div>
              )}
              {readingTime && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-white/10">
                  <Clock className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{readingTime} min</span>
                </div>
              )}
              {content.metadata?.seoScore && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-white/10">
                  <Target className="h-3 w-3 text-purple-500" />
                  <span className="font-medium">SEO: {content.metadata.seoScore}%</span>
                </div>
              )}
              {content.metadata?.tags && content.metadata.tags.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-white/10">
                  <Tag className="h-3 w-3 text-orange-500" />
                  <span className="font-medium">{content.metadata.tags.length} tags</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {content.metadata?.tags && content.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {content.metadata.tags.slice(0, 3).map((tag, index) => (
                  <CustomBadge key={index} className="text-xs px-3 py-1 bg-secondary/50 text-secondary-foreground">
                    {tag}
                  </CustomBadge>
                ))}
                {content.metadata.tags.length > 3 && (
                  <CustomBadge className="text-xs px-3 py-1 bg-muted/50 text-muted-foreground">
                    +{content.metadata.tags.length - 3}
                  </CustomBadge>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/30 rounded-lg px-3 py-2">
              <Calendar className="h-3 w-3" />
              <span className="font-medium">
                {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
              </span>
            </div>
            
            <Button 
              onClick={onView}
              size="sm" 
              className="glass-button bg-gradient-to-r from-primary to-neon-blue hover:from-primary/80 hover:to-neon-blue/80 text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{content.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};