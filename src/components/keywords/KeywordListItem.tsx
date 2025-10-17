import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Hash, TrendingUp, ChevronDown, ChevronUp, Copy, MoreHorizontal, Trash, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeywordContentPieces } from './KeywordContentPieces';
import { toast } from 'sonner';

interface ContentPiece {
  id: string;
  title: string;
  status: string;
  type: string;
}

interface KeywordListItemProps {
  keyword: {
    id: string;
    keyword: string;
    usage_count: number;
    content_pieces?: ContentPiece[];
    first_used?: string;
    last_used?: string;
  };
  onDelete?: (id: string) => void;
}

export const KeywordListItem: React.FC<KeywordListItemProps> = ({ keyword, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const publishedCount = keyword.content_pieces?.filter(p => p.status === 'published').length || 0;
  const draftCount = keyword.content_pieces?.filter(p => p.status === 'draft').length || 0;
  const hasCannibalization = publishedCount > 1;
  const contentPiecesCount = keyword.content_pieces?.length || 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword);
    toast.success('Keyword copied to clipboard');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(keyword.id);
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div variants={item}>
      <div className="glass-panel bg-background/40 backdrop-blur-sm border border-white/10 rounded-lg hover:border-white/20 transition-all duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-neon-blue/20 flex items-center justify-center">
                <Hash className="h-5 w-5 text-primary" />
              </div>

              {/* Keyword Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{keyword.keyword}</h3>
                  
                  {hasCannibalization && (
                    <CustomBadge className="flex-shrink-0 bg-orange-500/20 text-orange-600 border-orange-500/30">
                      <AlertTriangle className="h-3 w-3" />
                      Cannibalization
                    </CustomBadge>
                  )}
                  
                  {publishedCount > 0 && (
                    <CustomBadge className="flex-shrink-0 bg-green-500/20 text-green-600 border-green-500/30">
                      Published: {publishedCount}
                    </CustomBadge>
                  )}
                  
                  {draftCount > 0 && (
                    <CustomBadge className="flex-shrink-0 bg-blue-500/20 text-blue-600 border-blue-500/30">
                      Draft: {draftCount}
                    </CustomBadge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {keyword.usage_count} {keyword.usage_count === 1 ? 'use' : 'uses'}
                  </span>
                  <span>•</span>
                  {keyword.first_used && (
                    <>
                      <span>
                        First used {formatDistanceToNow(new Date(keyword.first_used), { addSuffix: true })}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>{contentPiecesCount} {contentPiecesCount === 1 ? 'piece' : 'pieces'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {contentPiecesCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      View Details
                    </>
                  )}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 px-2"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="glass-panel bg-background/95 backdrop-blur-sm border-white/10"
                >
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Keyword
                  </DropdownMenuItem>
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        onClick={handleDelete}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Expandable Content Pieces */}
        <AnimatePresence>
          {isExpanded && keyword.content_pieces && (
            <KeywordContentPieces contentPieces={keyword.content_pieces} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
