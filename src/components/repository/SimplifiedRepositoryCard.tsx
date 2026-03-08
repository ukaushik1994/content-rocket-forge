import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  BookOpen, 
  Mail, 
  Globe, 
  MessageSquare, 
  Edit, 
  Eye,
  Image as ImageIcon,
  Film,
  Pencil
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { VideoComingSoonBadge } from '@/components/content/VideoPlaceholder';
import { useNavigate } from 'react-router-dom';
import { getPlatformConfig } from '@/utils/platformIcons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// AI preamble patterns for display-level title sanitization
const AI_PREAMBLE_PATTERNS = [
  /^here\s+are/i, /^sure[,!]/i, /^i['']ll/i, /^let\s+me/i,
  /^certainly/i, /^of\s+course/i, /^great[,!]/i, /^absolutely/i,
  /^\d+\s+(unique|creative|compelling)/i,
];

function getDisplayTitle(content: ContentItemType): string {
  const extracted = extractTitleFromContent(content.content);
  if (extracted && extracted.length <= 120) return extracted;
  
  const metaTitle = content.metadata?.metaTitle;
  if (metaTitle && typeof metaTitle === 'string' && metaTitle.length <= 120) return metaTitle;
  
  const title = content.title;
  if (title && !AI_PREAMBLE_PATTERNS.some(p => p.test(title)) && title.length <= 120) return title;
  
  // Fallback: truncate title
  if (title) return title.substring(0, 100) + '...';
  return 'Untitled Content';
}

interface SimplifiedRepositoryCardProps {
  content: ContentItemType;
  onView: () => void;
  repurposedFormats?: string[];
}

export const SimplifiedRepositoryCard: React.FC<SimplifiedRepositoryCardProps> = ({ 
  content, 
  onView,
  repurposedFormats 
}) => {
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
      case 'article': return 'from-blue-500/80 to-blue-600/90 shadow-[0_0_20px_rgba(59,130,246,0.4)]';
      case 'blog': return 'from-green-500/80 to-green-600/90 shadow-[0_0_20px_rgba(34,197,94,0.4)]';
      case 'glossary': return 'from-primary/80 to-primary/90 shadow-[0_0_20px_rgba(155,135,245,0.4)]';
      case 'email': return 'from-orange-500/80 to-orange-600/90 shadow-[0_0_20px_rgba(249,115,22,0.4)]';
      case 'landing_page': return 'from-cyan-500/80 to-cyan-600/90 shadow-[0_0_20px_rgba(6,182,212,0.4)]';
      case 'social_post': return 'from-pink-500/80 to-pink-600/90 shadow-[0_0_20px_rgba(236,72,153,0.4)]';
      default: return 'from-muted/80 to-muted/90 shadow-[0_0_20px_rgba(155,135,245,0.2)]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(234,179,8,0.3)]';
      case 'published': return 'bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm shadow-[0_0_10px_rgba(34,197,94,0.3)]';
      case 'archived': return 'bg-muted/40 text-muted-foreground border-muted/50 backdrop-blur-sm';
      default: return 'bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm shadow-[0_0_10px_rgba(155,135,245,0.3)]';
    }
  };

  const IconComponent = getContentTypeIcon(content.content_type);
  const colorGradient = getContentTypeColor(content.content_type);
  const solution = (content as any).metadata?.solution || (content as any).metadata?.selectedSolution;

  // Get generated images from content metadata
  const generatedImages = useMemo(() => {
    const images = (content as any).generated_images || (content as any).metadata?.generated_images || [];
    return Array.isArray(images) ? images : [];
  }, [content]);
  const hasImages = generatedImages.length > 0;
  const firstImageUrl = hasImages ? generatedImages[0]?.url : null;

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
      whileHover={{ 
        y: -8, 
        scale: 1.03,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.96 }}
      className="h-full"
    >
      <Card className="glass-card hover:neon-border transition-all duration-500 overflow-hidden group h-full card-3d relative
        hover:shadow-[0_20px_40px_rgba(155,135,245,0.4),0_0_0_1px_rgba(255,255,255,0.1)_inset]
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 
        hover:before:opacity-100 before:transition-opacity before:duration-500 before:pointer-events-none">
        
        {/* Image preview banner if has generated images */}
        {hasImages && firstImageUrl && (
          <div className="relative h-32 overflow-hidden border-b border-border/30">
            <img 
              src={firstImageUrl} 
              alt="Generated content image"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Badge 
                className="bg-background/80 backdrop-blur-sm text-xs"
                variant="secondary"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                {generatedImages.length}
              </Badge>
              <Badge 
                className="bg-background/80 backdrop-blur-sm text-xs text-muted-foreground"
                variant="outline"
              >
                <Film className="h-3 w-3 mr-1" />
                Soon
              </Badge>
            </div>
          </div>
        )}
        
        {/* Video placeholder badge when no images */}
        {!hasImages && (
          <div className="absolute top-2 right-2 z-10">
            <VideoComingSoonBadge />
          </div>
        )}
        
        <CardContent className={`p-6 h-full flex flex-col relative z-10 ${hasImages ? 'pt-4' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colorGradient} text-white shadow-lg 
                relative overflow-hidden group-hover:scale-110 transition-all duration-300
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent 
                before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300`}>
                <IconComponent className="h-5 w-5 relative z-10" />
              </div>
              <Badge className={`${getStatusColor(content.status)} px-3 py-1 text-xs font-medium rounded-full
                transition-all duration-300 group-hover:scale-105`}>
                {content.status}
              </Badge>
            </div>
            
            {/* Solution indicator */}
            {solution && (
              <div className="flex-shrink-0">
                {solution.logoUrl ? (
                  <div
                    className="h-10 w-10 rounded-lg overflow-hidden glass-card border-primary/20 shadow-lg
                      group-hover:scale-110 transition-all duration-300 relative
                      hover:shadow-[0_0_20px_rgba(155,135,245,0.4)]"
                    title={solution.name || 'Solution'}
                  >
                    <img
                      src={solution.logoUrl}
                      alt={`${solution.name || 'Solution'} logo`}
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : solution.name ? (
                  <div
                    className="h-10 w-10 rounded-lg glass-card border-primary/20 text-primary-foreground 
                      grid place-items-center text-sm font-bold shadow-lg
                      group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(155,135,245,0.4)] 
                      transition-all duration-300"
                    title={solution.name}
                  >
                    {solution.name.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="flex-1 space-y-4">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary 
              transition-all duration-300 line-clamp-2 leading-tight
              group-hover:drop-shadow-[0_0_8px_rgba(155,135,245,0.6)]">
              {getDisplayTitle(content)}
            </h3>
            
            {content.metadata?.description && (
              <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/90 
                transition-colors duration-300 line-clamp-3 leading-relaxed">
                {content.metadata.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-border/30 mt-auto relative">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                Updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
              </span>
              {repurposedFormats && repurposedFormats.length > 0 && (
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-1">
                    {repurposedFormats.slice(0, 5).map((formatCode) => {
                      const platform = getPlatformConfig(formatCode);
                      const PlatformIcon = platform.icon;
                      return (
                        <Tooltip key={formatCode}>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] p-0.5">
                              <PlatformIcon className="h-3.5 w-3.5" style={{ color: platform.color }} />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {platform.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {repurposedFormats.length > 5 && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        +{repurposedFormats.length - 5}
                      </span>
                    )}
                  </div>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  sessionStorage.setItem('contentBuilderPayload', JSON.stringify({
                    content: content.content,
                    mainKeyword: (content.metadata as any)?.mainKeyword || '',
                    selectedKeywords: (content.metadata as any)?.secondaryKeywords || [],
                    outline: (content.metadata as any)?.outline || [],
                    serpSelections: (content.metadata as any)?.serpSelections || [],
                    contentTitle: content.title,
                    metaTitle: content.metadata?.metaTitle || '',
                    metaDescription: content.metadata?.metaDescription || '',
                    contentType: (content.metadata as any)?.contentType || 'blog',
                  }));
                  navigate('/ai-chat');
                }}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Pencil className="h-4 w-4 mr-1" />
                <span className="text-xs">Edit</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onView}
                className="glass-card border-primary/30 text-primary-foreground hover:border-primary/60 
                  hover:text-primary hover:shadow-[0_0_20px_rgba(155,135,245,0.4)]
                  transition-all duration-300 group-hover:scale-105 backdrop-blur-sm
                  hover:bg-primary/10 relative overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-transparent
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                <Eye className="h-4 w-4 mr-2 relative z-10" />
                <span className="relative z-10">View</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};