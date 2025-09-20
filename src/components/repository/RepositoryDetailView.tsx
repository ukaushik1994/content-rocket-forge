import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit, 
  BarChart3,
  Eye,
  Share,
  Download
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { CustomBadge } from '@/components/ui/custom-badge';
import { RepositorySerpDisplay } from './RepositorySerpDisplay';
import { RepositoryDocumentStructure } from './RepositoryDocumentStructure';

interface RepositoryDetailViewProps {
  open: boolean;
  onClose: () => void;
  content: ContentItemType | null;
}

export const RepositoryDetailView: React.FC<RepositoryDetailViewProps> = ({
  open,
  onClose,
  content
}) => {
  // Wrapper component with no hooks to ensure stable hook order
  if (!content) return null;
  return (
    <RepositoryDetailViewBody open={open} onClose={onClose} content={content} />
  );
};

interface RepositoryDetailViewBodyProps {
  open: boolean;
  onClose: () => void;
  content: ContentItemType;
}

const RepositoryDetailViewBody: React.FC<RepositoryDetailViewBodyProps> = ({ open, onClose, content }) => {
  const navigate = useNavigate();
  
  // Debug logging to understand the data structure
  console.log('Repository Detail View - Content:', content);
  console.log('Repository Detail View - Metadata:', content.metadata);
  console.log('Repository Detail View - SERP Selections:', content.metadata?.serpSelections);
  console.log('Repository Detail View - Document Structure:', content.metadata?.documentStructure);

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
    onClose();
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);
  const wordCount = content.metadata?.wordCount || content.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-panel bg-background/95 backdrop-blur-xl border-white/20">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
              <IconComponent className="h-6 w-6" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <DialogTitle className="text-2xl font-bold leading-tight pr-8">
                  {content.title}
                </DialogTitle>
                {getStatusBadge(content.status)}
              </div>
              
              {content.metadata?.description && (
                <p className="text-muted-foreground text-lg">
                  {content.metadata.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleEdit} className="glass-button bg-primary text-white">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="glass-button">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" className="glass-button">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="glass-button">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Content</h3>
              <ScrollArea className="h-96 w-full rounded-lg border border-border/50 p-4 bg-muted/20">
                {content.content_type === 'glossary' ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      This is a glossary with {content.metadata?.termCount || 0} terms.
                      {content.metadata?.domainUrl && (
                        <div className="mt-2">
                          <strong>Domain:</strong> {content.metadata.domainUrl}
                        </div>
                      )}
                    </div>
                    {content.metadata?.completedTerms && (
                      <div className="text-sm">
                        <strong>Progress:</strong> {content.metadata.completedTerms} / {content.metadata.termCount} terms completed
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {content.content}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Tags */}
            {content.metadata?.tags && content.metadata.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {content.metadata.tags.map((tag, index) => (
                    <CustomBadge 
                      key={index}
                      className="bg-muted/50 text-muted-foreground"
                    >
                      {tag}
                    </CustomBadge>
                  ))}
                </div>
              </div>
            )}

            {/* SERP Analysis Results */}
            {content.metadata?.serpSelections && content.metadata.serpSelections.length > 0 && (
              <div>
                <RepositorySerpDisplay serpSelections={content.metadata.serpSelections} />
              </div>
            )}

            {/* Document Structure Analysis */}
            {content.metadata?.documentStructure && (
              <div>
                <RepositoryDocumentStructure documentStructure={content.metadata.documentStructure} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="glass-card p-4 bg-background/40 backdrop-blur-sm border-white/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{content.content_type.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Words</span>
                  <span>{wordCount.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reading Time</span>
                  <span>{readingTime} min</span>
                </div>
                
                {content.seo_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">SEO Score</span>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{content.seo_score}/100</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(content.created_at), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* SEO Information */}
            {(content.metadata?.metaTitle || content.metadata?.metaDescription || content.metadata?.mainKeyword) && (
              <div className="glass-card p-4 bg-background/40 backdrop-blur-sm border-white/10 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">SEO</h3>
                <div className="space-y-3 text-sm">
                  {content.metadata?.metaTitle && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Meta Title</span>
                      <span className="text-xs bg-muted/50 p-2 rounded block">
                        {content.metadata.metaTitle}
                      </span>
                    </div>
                  )}
                  
                  {content.metadata?.metaDescription && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Meta Description</span>
                      <span className="text-xs bg-muted/50 p-2 rounded block">
                        {content.metadata.metaDescription}
                      </span>
                    </div>
                  )}
                  
                  {content.metadata?.mainKeyword && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Main Keyword</span>
                      <CustomBadge className="bg-primary/20 text-primary">
                        {content.metadata.mainKeyword}
                      </CustomBadge>
                    </div>
                  )}
                  
                  {content.metadata?.secondaryKeywords && content.metadata.secondaryKeywords.length > 0 && (
                    <div>
                      <span className="text-muted-foreground block mb-2">Secondary Keywords</span>
                      <div className="flex flex-wrap gap-1">
                        {content.metadata.secondaryKeywords.map((keyword, index) => (
                          <CustomBadge 
                            key={index}
                            className="text-xs bg-muted/50 text-muted-foreground"
                          >
                            {keyword}
                          </CustomBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
