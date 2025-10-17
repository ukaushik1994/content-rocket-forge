import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Calendar,
  TrendingUp,
  FileText,
  Sparkles,
  Eye,
  GitBranch,
  Clock,
  Target,
  BarChart3,
  Plus
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

export interface AIProposalCardProps {
  proposal: {
    id?: string;
    title: string;
    description?: string;
    primary_keyword: string;
    related_keywords?: string[];
    content_type?: string;
    priority_tag?: string;
    estimated_impressions?: number;
    created_at?: string;
    is_historical?: boolean;
    serp_data?: any;
  };
  isSelected?: boolean;
  isNew?: boolean;
  onToggleSelect?: (proposalId: string) => void;
  onScheduleToCalendar?: (proposal: any) => void;
  onAddToPipeline?: (proposal: any) => void;
  onViewDetails?: (proposal: any) => void;
  showActions?: boolean;
}

const priorityConfig = {
  'quick_win': { 
    label: 'Quick Win', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    gradient: 'from-green-500/10 to-emerald-600/10',
    icon: '⚡'
  },
  'high_return': { 
    label: 'High Return', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    gradient: 'from-yellow-500/10 to-amber-600/10',
    icon: '💰'
  },
  'evergreen': { 
    label: 'Evergreen', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gradient: 'from-blue-500/10 to-blue-600/10',
    icon: '🌲'
  }
};

const contentTypeConfig = {
  'blog': { label: 'Blog Post', icon: '📝' },
  'article': { label: 'Article', icon: '📄' },
  'social': { label: 'Social Media', icon: '📱' },
  'video': { label: 'Video', icon: '🎬' },
  'email': { label: 'Email', icon: '✉️' }
};

export const AIProposalCard: React.FC<AIProposalCardProps> = ({
  proposal,
  isSelected = false,
  isNew = false,
  onToggleSelect,
  onScheduleToCalendar,
  onAddToPipeline,
  onViewDetails,
  showActions = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
  const priority = proposal.priority_tag || 'evergreen';
  const contentType = proposal.content_type || 'blog';
  
  const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.evergreen;
  const typeInfo = contentTypeConfig[contentType as keyof typeof contentTypeConfig] || contentTypeConfig.blog;
  
  const estimatedTraffic = proposal.estimated_impressions || 0;
  const searchVolume = proposal.serp_data?.[proposal.primary_keyword]?.searchVolume || 0;
  
  const handleToggleSelect = () => {
    if (onToggleSelect) {
      onToggleSelect(proposalId);
    }
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
    >
      <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 group">
        {/* Animated Background Gradient */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${priorityInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          initial={false}
        />
        
        {/* New Badge */}
        {isNew && (
          <motion.div
            className="absolute top-4 left-4 z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-primary text-primary-foreground font-bold text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              NEW
            </Badge>
          </motion.div>
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 text-primary">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs font-bold">Selected</span>
            </div>
          </motion.div>
        )}

        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{priorityInfo.icon}</span>
                <Badge className={priorityInfo.color}>
                  {priorityInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {typeInfo.icon} {typeInfo.label}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                {proposal.title}
              </CardTitle>
            </div>
          </div>
          
          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="text-primary font-medium">{proposal.primary_keyword}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{estimatedTraffic.toLocaleString()} est. views</span>
            </div>
            {proposal.created_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Description */}
          {proposal.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {proposal.description}
            </p>
          )}

          {/* Keywords Section */}
          {proposal.related_keywords && proposal.related_keywords.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-background/40 border border-border/30">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">RELATED KEYWORDS</h4>
              <div className="flex flex-wrap gap-1">
                {proposal.related_keywords.slice(0, 4).map((keyword: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary">
                    {typeof keyword === 'string' ? keyword : keyword?.keyword || String(keyword)}
                  </Badge>
                ))}
                {proposal.related_keywords.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{proposal.related_keywords.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Metrics Section */}
          {(estimatedTraffic > 0 || searchVolume > 0) && (
            <motion.div
              className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-primary">TRAFFIC POTENTIAL</h4>
                <BarChart3 className="h-3 w-3 text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Estimated Traffic</div>
                  <div className="font-bold text-primary">{estimatedTraffic.toLocaleString()}</div>
                </div>
                {searchVolume > 0 && (
                  <div>
                    <div className="text-muted-foreground">Search Volume</div>
                    <div className="font-bold text-green-400">{searchVolume.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2 flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleSelect}
                      className={isSelected ? 
                        "bg-primary hover:bg-primary/80" : 
                        "bg-background/40 hover:bg-background/60 border-border/50"
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">{isSelected ? 'Deselect' : 'Select'} Proposal</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onViewDetails && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(proposal)}
                        className="bg-background/40 hover:bg-background/60 border-border/50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">View Details</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onAddToPipeline && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddToPipeline(proposal)}
                        className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-400"
                      >
                        <GitBranch className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">Add to Pipeline</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onScheduleToCalendar && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onScheduleToCalendar(proposal)}
                        className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">Schedule to Calendar</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
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