import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Eye, 
  MoreVertical,
  Sparkles,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Zap,
  Loader2
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getScoreLabel, getScoreTextSoftClass, getProgressBgClass } from '@/lib/score';

interface ContentApprovalCardProps {
  content: ContentItemType;
  onView: (content: ContentItemType) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onRequestChanges?: (id: string, reason: string) => void;
  onAnalyzeAI?: (content: ContentItemType) => void;
  onAssignReviewer?: (content: ContentItemType) => void;
  onViewHistory?: (content: ContentItemType) => void;
  aiScore?: number;
  analyzedAt?: string;
  isAnalyzing?: boolean;
}

const statusConfig = {
  'draft': { 
    label: 'Draft', 
    icon: FileText, 
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    gradient: 'from-slate-500/10 to-slate-600/10'
  },
  'pending_review': { 
    label: 'Pending Review', 
    icon: Clock, 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    gradient: 'from-yellow-500/10 to-amber-600/10'
  },
  'in_review': { 
    label: 'In Review', 
    icon: Eye, 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gradient: 'from-blue-500/10 to-blue-600/10'
  },
  'approved': { 
    label: 'Approved', 
    icon: CheckCircle2, 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    gradient: 'from-green-500/10 to-emerald-600/10'
  },
  'rejected': { 
    label: 'Rejected', 
    icon: XCircle, 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    gradient: 'from-red-500/10 to-red-600/10'
  },
  'needs_changes': { 
    label: 'Needs Changes', 
    icon: AlertCircle, 
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    gradient: 'from-orange-500/10 to-orange-600/10'
  },
  'published': { 
    label: 'Published', 
    icon: CheckCircle2, 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    gradient: 'from-purple-500/10 to-purple-600/10'
  }
};

export const ContentApprovalCard: React.FC<ContentApprovalCardProps> = ({
  content,
  onView,
  onApprove,
  onReject,
  onRequestChanges,
  onAnalyzeAI,
  onAssignReviewer,
  onViewHistory,
  aiScore,
  analyzedAt,
  isAnalyzing = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const status = content.approval_status as keyof typeof statusConfig;
  const statusInfo = statusConfig[status] || statusConfig['draft'];
  const StatusIcon = statusInfo.icon;
  
  const wordCount = content.content ? content.content.split(' ').length : 0;
  const readingTime = Math.ceil(wordCount / 200);
  
  const isStale = (typeof analyzedAt === 'string')
    ? new Date(analyzedAt).getTime() < new Date(content.updated_at).getTime()
    : false;

  const aiLabel = typeof aiScore === 'number' ? getScoreLabel(aiScore) : undefined;
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 group">
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${statusInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          initial={false}
        />
        
        {/* AI Score Indicator */}
        {aiScore !== undefined && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 ${getScoreTextSoftClass(aiScore)}`} aria-label={`AI score ${aiScore}%`}>
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-bold">{aiScore}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">AI Score: {aiLabel}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 text-primary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          </motion.div>
        )}

        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusIcon className={`h-4 w-4 ${statusInfo.color.split(' ')[1]}`} />
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                {content.title}
              </CardTitle>
            </div>
          </div>
          
          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readingTime} min read</span>
            </div>
            {isStale && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2 h-5 px-2 text-[10px]">STALE</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">Analysis is older than the latest content update</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Content Preview */}
          {content.content && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {content.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
            </p>
          )}

          {/* SEO Metadata */}
          {(content.metadata?.metaTitle || content.metadata?.metaDescription) && (
            <div className="mb-4 p-3 rounded-lg bg-background/40 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">SEO METADATA</h4>
              <div className="space-y-1 text-xs">
                {content.metadata.metaTitle && (
                  <p className="text-foreground/80 line-clamp-1">
                    <span className="text-muted-foreground">Title:</span> {content.metadata.metaTitle}
                  </p>
                )}
                {content.metadata.metaDescription && (
                  <p className="text-foreground/80 line-clamp-2">
                    <span className="text-muted-foreground">Desc:</span> {content.metadata.metaDescription}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI Analysis Summary */}
          {aiScore !== undefined && (
            <motion.div
              className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-primary">AI ANALYSIS</h4>
                <span className={`text-xs font-bold ${getScoreTextSoftClass(aiScore)}`}>
                  {aiLabel}
                </span>
              </div>
              <div className="w-full bg-background/40 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getProgressBgClass(aiScore)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${aiScore}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(content)}
              className="flex-1 bg-background/40 hover:bg-background/60 border-border/50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Button>
            
            {onAnalyzeAI && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyzeAI(content)}
                className="bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary"
                disabled={isAnalyzing}
                aria-label="Reanalyze content with AI"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Reanalyze
              </Button>
            )}

            {onAssignReviewer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssignReviewer(content)}
                className="border-border/50"
              >
                <User className="h-4 w-4 mr-2" />
                Assign
              </Button>
            )}

            {onViewHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewHistory(content)}
                className="text-muted-foreground"
              >
                History
              </Button>
            )}
            
            {status === 'pending_review' && onApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(content.id)}
                className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
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