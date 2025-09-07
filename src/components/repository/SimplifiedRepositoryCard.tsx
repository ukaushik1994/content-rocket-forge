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
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colorGradient} text-white shadow-lg`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <Badge className={getStatusColor(content.status)}>
                {content.status}
              </Badge>
            </div>
            
            {/* Solution indicator */}
            {solution && (
              <div className="flex-shrink-0">
                {solution.logoUrl ? (
                  <div
                    className="h-8 w-8 rounded-md overflow-hidden bg-background/80 border border-border shadow-sm"
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
                    className="h-8 w-8 rounded-md bg-muted/60 text-foreground/80 border border-border grid place-items-center text-sm font-semibold"
                    title={solution.name}
                  >
                    {solution.name.charAt(0).toUpperCase()}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors line-clamp-2">
              {content.title}
            </h3>
            
            {content.metadata?.description && (
              <p className="text-sm text-gray-300 line-clamp-2">
                {content.metadata.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
            <span className="text-xs text-gray-400">
              Updated {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
            </span>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView}
              className="border-white/20 hover:border-blue-400 hover:text-blue-400"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};