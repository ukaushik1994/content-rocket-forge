import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ExternalLink,
  Globe,
  FileText,
  DollarSign,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCode,
  BookOpen,
  MoreVertical,
  StickyNote
} from 'lucide-react';
import { CompanyCompetitor } from '@/contexts/content-builder/types/company-types';
import { cn } from '@/lib/utils';

const calculateCompleteness = (competitor: CompanyCompetitor): number => {
  const fields = [
    competitor.description,
    competitor.marketPosition,
    competitor.strengths.length > 0,
    competitor.weaknesses.length > 0,
    competitor.resources.length > 0,
    competitor.notes,
    competitor.intelligenceData?.company_size,
    competitor.intelligenceData?.founded_year,
    competitor.intelligenceData?.pricing_model,
    competitor.intelligenceData?.key_features?.length > 0,
    competitor.intelligenceData?.target_industries?.length > 0,
    competitor.intelligenceData?.notable_customers?.length > 0
  ];
  
  const filledFields = fields.filter(Boolean).length;
  return Math.round((filledFields / fields.length) * 100);
};

const getCompletenessColor = (percentage: number): string => {
  if (percentage >= 75) return 'from-success/20 to-success/5 border-success/30';
  if (percentage >= 60) return 'from-primary/20 to-primary/5 border-primary/30';
  if (percentage >= 40) return 'from-warning/20 to-warning/5 border-warning/30';
  return 'from-destructive/20 to-destructive/5 border-destructive/30';
};

const getCompletenessIcon = (percentage: number) => {
  if (percentage >= 75) return <CheckCircle2 className="h-4 w-4 text-success" />;
  return <AlertCircle className="h-4 w-4 text-warning" />;
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    website: <Globe className="h-4 w-4" />,
    pricing: <DollarSign className="h-4 w-4" />,
    documentation: <BookOpen className="h-4 w-4" />,
    features: <FileCode className="h-4 w-4" />,
    default: <FileText className="h-4 w-4" />
  };
  return iconMap[category] || iconMap.default;
};

const getDomain = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
};

interface CompetitorCardProps {
  competitor: CompanyCompetitor;
  onDelete: (id: string) => void;
  onViewProfile: (competitor: CompanyCompetitor) => void;
  isAutoFilling?: boolean;
}

export function CompetitorCard({ competitor, onDelete, onViewProfile, isAutoFilling = false }: CompetitorCardProps) {
  const completeness = calculateCompleteness(competitor);
  const completenessGradient = getCompletenessColor(completeness);
  const visibleResources = competitor.resources.slice(0, 3);
  const remainingCount = competitor.resources.length - 3;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <GlassCard className={cn(
        "group relative h-full flex flex-col overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30",
        isAutoFilling && "animate-pulse border-primary/50"
      )}>
        {/* Auto-fill loading overlay */}
        {isAutoFilling && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-10 pointer-events-none">
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse backdrop-blur-sm">
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Analyzing...
              </Badge>
            </div>
          </div>
        )}
        
        {/* Completeness indicator - Top Right */}
        {!isAutoFilling && (
          <div className="absolute top-3 right-3 z-10">
            <div className={cn(
              "px-3 py-1.5 rounded-full border backdrop-blur-md",
              "bg-gradient-to-br shadow-sm",
              "flex items-center gap-1.5 text-xs font-semibold transition-all duration-300",
              "hover:scale-105",
              completenessGradient
            )}>
              {getCompletenessIcon(completeness)}
              <span>{completeness}%</span>
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="p-5 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            {competitor.logoUrl ? (
              <div className="relative">
                <img 
                  src={competitor.logoUrl} 
                  alt={`${competitor.name} logo`}
                  className="w-14 h-14 rounded-xl object-contain bg-background/50 p-2.5 border border-border/50 shadow-sm"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center border border-primary/20">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
            )}
            
            <div className="flex-1 min-w-0 pt-0.5">
              <h3 className="text-lg font-semibold mb-1.5 text-gradient group-hover:opacity-90 transition-opacity">
                {competitor.name}
              </h3>
              {competitor.marketPosition && (
                <Badge variant="outline" className="text-xs font-medium">
                  {competitor.marketPosition}
                </Badge>
              )}
            </div>
          </div>

          {/* Website Link */}
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group/link w-fit"
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium underline-offset-4 group-hover/link:underline">
                {getDomain(competitor.website)}
              </span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          )}
        </div>

        {/* Description Section */}
        <div className="px-5 pb-4">
          {competitor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {competitor.description}
            </p>
          )}
        </div>
        
        {/* Resources Section */}
        {competitor.resources.length > 0 && (
          <div className="px-5 pb-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <FileText className="h-3.5 w-3.5" />
              Resources
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleResources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    "bg-background/50 border border-border/50",
                    "hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm",
                    "transition-all duration-200 group/resource",
                    "text-xs font-medium truncate"
                  )}
                >
                  <span className="text-primary group-hover/resource:scale-110 transition-transform">
                    {getCategoryIcon(resource.category)}
                  </span>
                  <span className="truncate flex-1">{resource.title}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover/resource:opacity-50 transition-opacity" />
                </a>
              ))}
              {remainingCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(competitor);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg",
                    "bg-muted/30 border border-dashed border-border/50",
                    "hover:bg-muted/50 hover:border-border",
                    "transition-all duration-200",
                    "text-xs font-medium text-muted-foreground"
                  )}
                >
                  +{remainingCount} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-auto pt-4 px-5 pb-5 border-t border-border/30 bg-gradient-to-b from-transparent to-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span className="font-medium">{competitor.resources.length} resources</span>
              </div>
              
              {competitor.notes && (
                <div className="flex items-center gap-1.5 text-primary">
                  <StickyNote className="h-3.5 w-3.5" />
                  <span className="font-medium">Has notes</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(competitor)}
                className="h-8 px-3 hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-1.5" />
                View
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(competitor.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
