import React from 'react';
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
  Eye
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface SimplifiedRepositoryCardProps {
  content: ContentItemType;
  onView: () => void;
}

export const SimplifiedRepositoryCard: React.FC<SimplifiedRepositoryCardProps> = ({ 
  content, 
  onView 
}) => {
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
        <CardContent className="p-6 h-full flex flex-col relative z-10">
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
              {content.title}
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
            <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
              Updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
            </span>
            
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
        </CardContent>
      </Card>
    </motion.div>
  );
};