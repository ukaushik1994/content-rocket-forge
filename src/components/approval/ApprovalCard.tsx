
import React, { useState } from 'react';
import { ContentItemType, ApprovalType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Calendar, 
  User, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Edit3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ApprovalCardProps {
  content: ContentItemType;
  approval?: ApprovalType;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, comments: string) => void;
  onRequestChanges: (id: string, comments: string) => void;
  onView: (content: ContentItemType) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
    case 'needs_changes': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    case 'in_review': return <Clock className="h-4 w-4 text-blue-400" />;
    default: return <FileText className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'needs_changes': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'in_review': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'pending_review': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  content,
  approval,
  onApprove,
  onReject,
  onRequestChanges,
  onView,
  isSelected,
  onClick
}) => {
  const [showActions, setShowActions] = useState(false);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes' | null>(null);

  const handleActionSubmit = () => {
    if (!actionType) return;
    
    switch (actionType) {
      case 'approve':
        onApprove(content.id, comments);
        break;
      case 'reject':
        onReject(content.id, comments);
        break;
      case 'changes':
        onRequestChanges(content.id, comments);
        break;
    }
    
    setShowActions(false);
    setComments('');
    setActionType(null);
  };

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "glass-panel cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden",
          isSelected && "ring-2 ring-neon-purple ring-offset-2 ring-offset-transparent"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-lg border border-white/20">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 text-white font-medium">
                  {getInitials(content.title)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white/90 text-sm line-clamp-1">
                  {content.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getStatusColor(content.approval_status || 'draft'))}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(content.approval_status || 'draft')}
                      {content.approval_status?.replace('_', ' ')}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(content);
              }}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Content preview */}
            <p className="text-white/70 text-xs line-clamp-2">
              {content.content ? content.content.substring(0, 120) + '...' : 'No content available'}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(content.updated_at), { addSuffix: true })}
                </span>
              </div>
              {content.metadata?.wordCount && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{content.metadata.wordCount} words</span>
                </div>
              )}
            </div>

            {/* Keywords */}
            {content.keywords && content.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.keywords.slice(0, 3).map((keyword, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                  >
                    {keyword}
                  </Badge>
                ))}
                {content.keywords.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-white/10 text-white/60">
                    +{content.keywords.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Action buttons for reviewable content */}
            {(content.approval_status === 'pending_review' || content.approval_status === 'in_review') && (
              <div className="pt-2 border-t border-white/10">
                {!showActions ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionType('approve');
                        setShowActions(true);
                      }}
                      className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionType('changes');
                        setShowActions(true);
                      }}
                      className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Changes
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionType('reject');
                        setShowActions(true);
                      }}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      placeholder={`Add ${actionType === 'approve' ? 'approval notes (optional)' : 'feedback and comments'}`}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="min-h-[60px] bg-white/5 border-white/10 text-white text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionSubmit();
                        }}
                        disabled={actionType !== 'approve' && !comments.trim()}
                        className="flex-1 bg-neon-purple hover:bg-neon-blue"
                      >
                        Submit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                          setComments('');
                          setActionType(null);
                        }}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
