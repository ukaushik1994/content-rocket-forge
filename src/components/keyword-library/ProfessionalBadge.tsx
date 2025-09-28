import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Search, TrendingUp, Calendar, Target } from 'lucide-react';

interface ProfessionalBadgeProps {
  type: 'source' | 'difficulty' | 'performance';
  value: string | number;
  sourceType?: string;
  className?: string;
}

export const ProfessionalBadge: React.FC<ProfessionalBadgeProps> = ({
  type,
  value,
  sourceType,
  className = ''
}) => {
  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'manual':
        return {
          icon: <Hash className="h-3 w-3" />,
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      case 'serp':
        return {
          icon: <Search className="h-3 w-3" />,
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
      case 'glossary':
        return {
          icon: <TrendingUp className="h-3 w-3" />,
          className: 'bg-green-500/10 text-green-400 border-green-500/20'
        };
      case 'strategy':
        return {
          icon: <Calendar className="h-3 w-3" />,
          className: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        };
      default:
        return {
          icon: <Hash className="h-3 w-3" />,
          className: 'bg-muted/50 text-muted-foreground border-border'
        };
    }
  };

  const getDifficultyConfig = (difficulty: number) => {
    if (difficulty <= 30) {
      return {
        className: 'bg-success/10 text-success border-success/20',
        label: 'Easy'
      };
    }
    if (difficulty <= 60) {
      return {
        className: 'bg-warning/10 text-warning border-warning/20',
        label: 'Medium'
      };
    }
    return {
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      label: 'Hard'
    };
  };

  const getPerformanceConfig = (score: number) => {
    if (score >= 80) {
      return {
        className: 'bg-success/10 text-success border-success/20'
      };
    }
    if (score >= 60) {
      return {
        className: 'bg-info/10 text-info border-info/20'
      };
    }
    if (score >= 40) {
      return {
        className: 'bg-warning/10 text-warning border-warning/20'
      };
    }
    return {
      className: 'bg-destructive/10 text-destructive border-destructive/20'
    };
  };

  if (type === 'source' && sourceType) {
    const config = getSourceConfig(sourceType);
    return (
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${config.className} ${className}`}
      >
        {config.icon}
        <span className="ml-1 capitalize">{sourceType}</span>
      </Badge>
    );
  }

  if (type === 'difficulty' && typeof value === 'number') {
    const config = getDifficultyConfig(value);
    return (
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${config.className} ${className}`}
      >
        {value}% {config.label}
      </Badge>
    );
  }

  if (type === 'performance' && typeof value === 'number') {
    const config = getPerformanceConfig(value);
    return (
      <Badge 
        variant="outline" 
        className={`text-xs font-medium ${config.className} ${className}`}
      >
        <Target className="h-3 w-3 mr-1" />
        {value}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      {value}
    </Badge>
  );
};