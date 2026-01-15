import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Tag, List, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RepurposeButton } from '../RepurposeButton';
import { stripHtml } from '@/utils/sanitize';

interface ContentItemProps {
  item: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ContentItem: React.FC<ContentItemProps> = ({ 
  item,
  onView,
  onEdit,
  onDelete
}) => {
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get solution data from metadata
  const solutionData = item.metadata?.solution;
  const contentType = item.metadata?.contentType || 'article';

  // Debug logging to see what solution data we have
  console.log('[ContentItem] Item metadata:', item.metadata);
  console.log('[ContentItem] Solution data:', solutionData);
  console.log('[ContentItem] Content type:', contentType);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="card-3d"
    >
      <Card className="overflow-hidden border border-white/10 bg-card/30 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
        <CardHeader className="pb-2 relative">
          <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 rounded-full blur-xl z-0"></div>
          
          {/* Solution Logo and Content Type Row */}
          <div className="flex items-center justify-between mb-3 z-10 relative">
            <div className="flex items-center gap-3">
              {solutionData?.logoUrl ? (
                <div className="h-8 w-8 rounded-md overflow-hidden bg-white/10 flex items-center justify-center border border-white/20">
                  <img 
                    src={solutionData.logoUrl} 
                    alt={`${solutionData.name} logo`} 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      console.log('[ContentItem] Logo failed to load:', solutionData.logoUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('[ContentItem] Logo loaded successfully:', solutionData.logoUrl);
                    }}
                  />
                </div>
              ) : solutionData?.name ? (
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center border border-white/20">
                  <span className="text-xs font-semibold text-white/80">
                    {solutionData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                  <FileText className="h-4 w-4 text-white/40" />
                </div>
              )}
              
              <div className="flex flex-col">
                {solutionData?.name && (
                  <span className="text-xs text-muted-foreground">{solutionData.name}</span>
                )}
                <Badge variant="outline" className="w-fit text-xs bg-white/5 border-white/20 text-foreground/70">
                  {contentType}
                </Badge>
              </div>
            </div>
            
            <Badge variant={item.status === 'draft' ? 'outline' : 'default'} className={`${item.status === 'draft' ? 'border-white/20' : 'bg-primary text-primary-foreground'}`}>
              {item.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </div>

          <div className="flex justify-between items-start z-10 relative">
            <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
            <span>{formatDate(item.created_at)}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          <div className="line-clamp-3 text-sm opacity-85">
            {item.content ? (
              <span>{stripHtml(item.content)?.substring(0, 150)}...</span>
            ) : (
              <span className="text-muted-foreground italic">No content</span>
            )}
          </div>
          
          {/* Keywords badges */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.keywords.map((keyword: string, idx: number) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-xs bg-white/5 border border-white/10 text-foreground/80"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Content metadata */}
          <div className="mt-3 space-y-1.5">
            {item.metadata?.serpSelections && item.metadata.serpSelections.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-neon-blue/10 flex items-center justify-center">
                  <Tag className="h-2.5 w-2.5 text-neon-blue" />
                </div>
                <span>{item.metadata.serpSelections.filter((s: any) => s.selected).length} SERP selections</span>
              </div>
            )}
            
            {item.metadata?.outline && item.metadata.outline.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-neon-purple/10 flex items-center justify-center">
                  <List className="h-2.5 w-2.5 text-neon-purple" />
                </div>
                <span>{item.metadata.outline.length} outline sections</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-end gap-1 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] px-4 py-3">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onView(item.id)}
            className="hover:bg-white/5"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => onEdit(item.id)}
            className="hover:bg-white/5"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <RepurposeButton contentId={item.id} />
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
