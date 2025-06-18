
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Check, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractiveSelectionItemProps {
  content: string;
  type: string;
  selected?: boolean;
  onToggle: (content: string, type: string) => void;
  onAddToContent: (content: string, type: string) => void;
  apiSource?: string;
  metadata?: any;
  priority?: 'high' | 'medium' | 'low';
  freshness?: 'fresh' | 'cached' | 'stale';
  className?: string;
}

export function InteractiveSelectionItem({
  content,
  type,
  selected = false,
  onToggle,
  onAddToContent,
  apiSource,
  metadata,
  priority = 'medium',
  freshness = 'fresh',
  className = ''
}: InteractiveSelectionItemProps) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500'
  };

  const freshnessBadge = {
    fresh: 'bg-green-500/20 text-green-300',
    cached: 'bg-yellow-500/20 text-yellow-300',
    stale: 'bg-red-500/20 text-red-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        group relative p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 
        transition-all duration-200 hover:border-white/20 border-l-4 ${priorityColors[priority]}
        ${selected ? 'ring-2 ring-neon-purple/50 bg-neon-purple/10' : ''}
        ${className}
      `}
    >
      {/* Selection Checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(content, type)}
          className="mt-1 data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
        />
        
        <div className="flex-1 min-w-0">
          {/* Content */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-white/90 leading-relaxed break-words flex-1">
              {content}
            </p>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToContent(content, type)}
                className="h-7 w-7 p-0 hover:bg-neon-purple/20 hover:text-neon-purple"
              >
                {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
              
              {metadata?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(metadata.url, '_blank')}
                  className="h-7 w-7 p-0 hover:bg-white/10"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-xs">
            {/* API Source */}
            {apiSource && (
              <Badge variant="outline" className={`${freshnessBadge[freshness]} border-0 px-2 py-0.5`}>
                {apiSource}
              </Badge>
            )}
            
            {/* Type Badge */}
            <Badge variant="outline" className="bg-white/5 text-white/60 border-white/20 px-2 py-0.5">
              {type}
            </Badge>
            
            {/* Priority Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              priority === 'high' ? 'bg-red-500' : 
              priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            
            {/* Additional Metadata */}
            {metadata?.position && (
              <span className="text-white/40">#{metadata.position}</span>
            )}
            
            {metadata?.snippet && (
              <span className="text-white/40 truncate max-w-20">
                {metadata.snippet.substring(0, 20)}...
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
