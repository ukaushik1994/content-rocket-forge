import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Edit2,
  Trash2,
  ExternalLink,
  Globe,
  Users,
  FileText,
  Target,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { CompanyCompetitor } from '@/contexts/content-builder/types/company-types';
import { cn } from '@/lib/utils';

const categoryIcons = {
  website: Globe,
  social_media: Users,
  documentation: FileText,
  case_studies: Target,
  marketing: TrendingUp,
  other: ExternalLink
};

interface CompetitorCardProps {
  competitor: CompanyCompetitor;
  onEdit: (competitor: CompanyCompetitor) => void;
  onDelete: (id: string) => void;
  isAutoFilling?: boolean;
}

const getResourceColor = (category: string): string => {
  const colors = {
    website: 'border-blue-400/30 text-blue-400',
    social_media: 'border-purple-400/30 text-purple-400',
    documentation: 'border-yellow-400/30 text-yellow-400',
    case_studies: 'border-green-400/30 text-green-400',
    marketing: 'border-orange-400/30 text-orange-400',
    other: 'border-border text-muted-foreground'
  };
  return colors[category as keyof typeof colors] || colors.other;
};

export function CompetitorCard({ competitor, onEdit, onDelete, isAutoFilling = false }: CompetitorCardProps) {
  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-neon border-border bg-card/60 backdrop-blur-xl relative",
      isAutoFilling && "animate-pulse border-primary/50"
    )}>
      {/* Auto-fill loading badge */}
      {isAutoFilling && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Analyzing...
          </Badge>
        </div>
      )}
      {/* Header with gradient - neon-blue theme for competitors */}
      <CardHeader className="relative bg-gradient-to-br from-neon-blue/20 via-transparent to-transparent pb-4">
        <div className="flex items-start space-x-3">
          {/* Large avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-neon-blue/20 to-neon-blue/5 rounded-lg flex items-center justify-center border border-border shrink-0">
            {competitor.logoUrl ? (
              <img 
                src={competitor.logoUrl} 
                alt={competitor.name} 
                className="w-12 h-12 object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-gradient text-lg leading-tight mb-1">
              {competitor.name}
            </CardTitle>
            {competitor.marketPosition && (
              <Badge variant="outline" className="mt-1 border-primary/30 text-xs">
                {competitor.marketPosition}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons - show on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-primary/10"
            onClick={() => onEdit(competitor)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(competitor.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 pt-2">
        {/* Website Link */}
        {competitor.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 truncate"
            >
              {new URL(competitor.website).hostname}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        )}

        {/* Description */}
        {competitor.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {competitor.description}
          </p>
        )}

        {/* Strengths */}
        {competitor.strengths.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Strengths
            </h4>
            <div className="flex flex-wrap gap-2">
              {competitor.strengths.slice(0, 3).map((strength, i) => (
                <Badge
                  key={i}
                  className="bg-success/10 text-success border-success/20 hover:bg-success/20"
                >
                  {strength}
                </Badge>
              ))}
              {competitor.strengths.length > 3 && (
                <Badge variant="outline" className="text-xs border-border">
                  +{competitor.strengths.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {competitor.weaknesses.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Weaknesses
            </h4>
            <div className="flex flex-wrap gap-2">
              {competitor.weaknesses.slice(0, 3).map((weakness, i) => (
                <Badge
                  key={i}
                  className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                >
                  {weakness}
                </Badge>
              ))}
              {competitor.weaknesses.length > 3 && (
                <Badge variant="outline" className="text-xs border-border">
                  +{competitor.weaknesses.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Resources */}
        {competitor.resources.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
              Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              {competitor.resources.slice(0, 4).map((resource, i) => {
                const Icon = categoryIcons[resource.category];
                const colorClass = getResourceColor(resource.category);
                return (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn('text-xs', colorClass)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {resource.title}
                  </Badge>
                );
              })}
              {competitor.resources.length > 4 && (
                <Badge variant="outline" className="text-xs border-border">
                  +{competitor.resources.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          {competitor.resources.length} resource{competitor.resources.length !== 1 ? 's' : ''} tracked
        </span>
        <div className="flex items-center gap-2">
          {competitor.notes && (
            <Badge variant="secondary" className="text-xs">
              Has Notes
            </Badge>
          )}
          {/* Manual retry button when no description but has website */}
          {!competitor.description && competitor.website && !isAutoFilling && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(competitor)}
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Auto-fill
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
