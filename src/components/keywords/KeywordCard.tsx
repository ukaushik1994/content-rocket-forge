import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Copy,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Simple SVG sparkline component
const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className = '' }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
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

// Difficulty badge
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

interface KeywordCardProps {
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

const statusConfig = {
  'published': { 
    label: 'Published', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    gradient: 'from-green-500/10 to-emerald-600/10'
  },
  'draft': { 
    label: 'Draft', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gradient: 'from-blue-500/10 to-blue-600/10'
  },
  'archived': { 
    label: 'Archived', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    gradient: 'from-gray-500/10 to-gray-600/10'
  },
};

export const KeywordCard: React.FC<KeywordCardProps> = ({
  keyword,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  
  const publishedCount = keyword.content_pieces?.filter(p => p.status === 'published').length || 0;
  const draftCount = keyword.content_pieces?.filter(p => p.status === 'draft').length || 0;
  const hasCannibalization = publishedCount > 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(keyword.keyword);
    toast.success('Keyword copied to clipboard');
  };

  const handleViewContent = (contentId: string) => {
    navigate(`/repository?id=${contentId}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden glass-card glass-card-hover transition-all duration-300 group h-full flex flex-col">
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${hasCannibalization ? 'from-orange-500/10 to-red-500/10' : 'from-primary/10 to-blue-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          initial={false}
        />
        
        {/* Usage Count Indicator */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs font-bold">{keyword.usage_count}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">Used in {keyword.usage_count} piece{keyword.usage_count !== 1 ? 's' : ''}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {hasCannibalization && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Warning
                  </Badge>
                )}
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Content Keyword
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                {keyword.keyword}
              </CardTitle>
            </div>
          </div>
          
          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{publishedCount} published</span>
            </div>
            {draftCount > 0 && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{draftCount} draft</span>
              </div>
            )}
            {keyword.first_used && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(keyword.first_used), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative pt-0 flex-1 flex flex-col">
          {/* Content Preview */}
          {keyword.content_pieces && keyword.content_pieces.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">CONTENT USAGE</h4>
              <div className="space-y-2">
                {keyword.content_pieces.slice(0, isExpanded ? undefined : 2).map((piece) => {
                  const statusInfo = statusConfig[piece.status as keyof typeof statusConfig] || statusConfig.draft;
                  return (
                    <div key={piece.id} className="flex items-center justify-between text-xs bg-background/40 p-2 rounded border border-border/30">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge className={statusInfo.color + " shrink-0"}>
                          {statusInfo.label}
                        </Badge>
                        <span className="truncate">{piece.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewContent(piece.id)}
                        className="h-6 text-xs shrink-0 ml-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              
              {keyword.content_pieces.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-2 text-xs"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show {keyword.content_pieces.length - 2} More
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Cannibalization Warning */}
          {hasCannibalization && (
            <motion.div
              className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-orange-400 mb-1">Keyword Cannibalization</h4>
                  <p className="text-xs text-muted-foreground">
                    This keyword appears in {publishedCount} published pieces. Consider consolidating or differentiating content.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-1 bg-background/40 hover:bg-background/60 border-border/50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Copy keyword</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(keyword.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">Remove keyword</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          initial={false}
        />
      </Card>
    </motion.div>
  );
};
