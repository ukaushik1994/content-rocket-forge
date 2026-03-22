import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Hash, TrendingUp, ChevronDown, ChevronUp, Copy, MoreHorizontal, Trash, AlertTriangle, Pencil, Eye } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

// Simple SVG sparkline component
const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className = '' }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const trending = data[data.length - 1] >= data[0];
  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={trending ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Difficulty badge based on content piece count
const DifficultyBadge: React.FC<{ count: number }> = ({ count }) => {
  const level = count <= 1 ? 'Easy' : count <= 3 ? 'Medium' : 'Hard';
  const cls = count <= 1
    ? 'bg-green-500/15 text-green-400 border-green-500/30'
    : count <= 3
    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
    : 'bg-red-500/15 text-red-400 border-red-500/30';
  return <Badge className={cls + ' text-[10px] px-1.5 py-0'}>{level}</Badge>;
};

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
    search_volume?: number | null;
    difficulty?: number | null;
  };
  onDelete?: (id: string) => void;
}

export const KeywordListItem: React.FC<KeywordListItemProps> = ({ keyword, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  const publishedCount = keyword.content_pieces?.filter(p => p.status === 'published').length || 0;
  const draftCount = keyword.content_pieces?.filter(p => p.status === 'draft').length || 0;
  const hasCannibalization = publishedCount > 1;
  const contentPiecesCount = keyword.content_pieces?.length || 0;

  const sparkData = useMemo(() => {
    const pieces = keyword.content_pieces || [];
    if (pieces.length === 0) return [0, 0];
    const sorted = [...pieces].sort((a, b) => a.id.localeCompare(b.id));
    return sorted.map((_, i) => i + 1);
  }, [keyword.content_pieces]);

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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">{keyword.keyword}</h3>
                  
                  <DifficultyBadge count={contentPiecesCount} />
                  
                  {hasCannibalization && (
                    <CustomBadge 
                      className="flex-shrink-0 bg-orange-500/20 text-orange-600 border-orange-500/30 cursor-pointer hover:bg-orange-500/30 transition-colors"
                      onClick={() => navigate(`/ai-chat?prompt=${encodeURIComponent(`Help me differentiate my ${publishedCount} articles targeting "${keyword.keyword}" to avoid keyword cannibalization`)}`)}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Fix Cannibalization
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
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {keyword.usage_count} {keyword.usage_count === 1 ? 'use' : 'uses'}
                  </span>
                  {keyword.first_used && (
                    <>
                      <span>•</span>
                      <span>
                        First used {formatDistanceToNow(new Date(keyword.first_used), { addSuffix: true })}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{contentPiecesCount} {contentPiecesCount === 1 ? 'piece' : 'pieces'}</span>
                  
                  {/* SERP Metrics inline */}
                  {keyword.difficulty != null && keyword.difficulty > 0 && (
                    <>
                      <span>•</span>
                      <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                        keyword.difficulty > 70 ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        keyword.difficulty > 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}>
                        KD: {keyword.difficulty}
                      </span>
                    </>
                  )}
                  {keyword.search_volume != null && keyword.search_volume > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[10px] text-muted-foreground/70">
                        ~{keyword.search_volume.toLocaleString()}/mo
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sparkline + Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Sparkline */}
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-background/60 border border-border/30">
                <Sparkline data={sparkData} />
                <span className="text-xs font-bold text-foreground/70">{keyword.usage_count}</span>
              </div>

              {/* Write About This */}
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate(`/ai-chat?prompt=${encodeURIComponent(`Write a comprehensive blog post about "${keyword.keyword}"`)}`)}
                className="hidden md:flex gap-1 text-xs h-8"
              >
                <Pencil className="h-3 w-3" />
                Write
              </Button>

              {contentPiecesCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 h-8"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Details
                    </>
                  )}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="glass-button bg-background/40 backdrop-blur-sm border-white/10 hover:border-white/20 px-2 h-8"
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
                  <DropdownMenuItem 
                    className="md:hidden"
                    onClick={() => navigate(`/ai-chat?prompt=${encodeURIComponent(`Write a comprehensive blog post about "${keyword.keyword}"`)}`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Write About This
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

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Cannibalization Warning */}
              {hasCannibalization && (
                <div className="mx-4 mb-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-orange-400 mb-1">Keyword Cannibalization</h4>
                      <p className="text-xs text-muted-foreground">
                        This keyword appears in {publishedCount} published pieces. Consider consolidating or differentiating content.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {keyword.content_pieces && (
                <KeywordContentPieces contentPieces={keyword.content_pieces} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
