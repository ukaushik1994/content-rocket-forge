import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  ExternalLink,
  Globe,
  FileText,
  Loader2,
  Eye,
  CheckCircle2,
  AlertCircle,
  StickyNote,
  Bookmark,
  Target
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

const getCompletenessIcon = (percentage: number) => {
  if (percentage >= 75) return <CheckCircle2 className="h-3.5 w-3.5" />;
  return <AlertCircle className="h-3.5 w-3.5" />;
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
  solutionsCount?: number;
}

export function CompetitorCard({ competitor, onDelete, onViewProfile, isAutoFilling = false, solutionsCount = 0 }: CompetitorCardProps) {
  const completeness = calculateCompleteness(competitor);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-neon border border-white/10 bg-glass h-full flex flex-col",
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
        
        {/* Header with gradient background */}
        <CardHeader className="bg-gradient-to-br from-neon-purple/20 to-transparent">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {competitor.logoUrl ? (
                <img 
                  src={competitor.logoUrl} 
                  alt={`${competitor.name} logo`}
                  className="w-12 h-12 rounded-lg object-contain bg-background/50 p-2 border border-border/50"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/20">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-gradient text-xl mb-1">
                  {competitor.name}
                </CardTitle>
                {competitor.marketPosition && (
                  <Badge variant="outline" className="text-xs">
                    {competitor.marketPosition}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Right: Completeness Badge + Bookmark */}
            <div className="flex items-center gap-2">
              {!isAutoFilling && (
                <Badge className={cn(
                  "px-2 py-1 text-xs font-semibold",
                  completeness >= 75 ? "bg-success/20 text-success border-success/30" :
                  completeness >= 60 ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-warning/20 text-warning border-warning/30"
                )}>
                  {getCompletenessIcon(completeness)}
                  {completeness}%
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Website link in header */}
          {competitor.website && (
            <div className="mt-2 pt-2 border-t border-white/5">
              <a
                href={competitor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors w-fit"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="font-medium">{getDomain(competitor.website)}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            </div>
          )}
        </CardHeader>

        {/* Content with badge-based sections */}
        <CardContent className="pt-3 grid gap-3 flex-1">
          {/* Description - Single line */}
          {competitor.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
              {competitor.description}
            </p>
          )}
          
          {/* Tech Stack */}
          {competitor.intelligenceData?.technology_stack && competitor.intelligenceData.technology_stack.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {competitor.intelligenceData.technology_stack.slice(0, 3).map((tech, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-0 h-5 border-neon-purple/20">
                    {tech}
                  </Badge>
                ))}
                {competitor.intelligenceData.technology_stack.length > 3 && (
                  <Badge variant="outline" className="text-xs py-0 h-5 border-neon-purple/20 text-muted-foreground">
                    +{competitor.intelligenceData.technology_stack.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Key Features */}
          {competitor.intelligenceData?.key_features && competitor.intelligenceData.key_features.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Key Features</h4>
              <div className="flex flex-wrap gap-1.5">
                {competitor.intelligenceData.key_features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs py-0 h-5 border-green-500/20 text-green-600">
                    {feature}
                  </Badge>
                ))}
                {competitor.intelligenceData.key_features.length > 3 && (
                  <Badge variant="outline" className="text-xs py-0 h-5 border-green-500/20 text-muted-foreground">
                    +{competitor.intelligenceData.key_features.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Target Industries */}
          {competitor.intelligenceData?.target_industries && competitor.intelligenceData.target_industries.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Target Industries</h4>
              <div className="flex flex-wrap gap-1.5">
                {competitor.intelligenceData.target_industries.slice(0, 3).map((industry, i) => (
                  <Badge key={i} variant="secondary" className="text-xs py-0 h-5 bg-secondary/40">
                    {industry}
                  </Badge>
                ))}
                {competitor.intelligenceData.target_industries.length > 3 && (
                  <Badge variant="secondary" className="text-xs py-0 h-5 bg-secondary/40 text-muted-foreground">
                    +{competitor.intelligenceData.target_industries.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Solutions */}
          {solutionsCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 px-2 py-1.5 rounded-md border border-primary/10">
              <Target className="h-3.5 w-3.5" />
              <span className="font-medium">{solutionsCount} Solution{solutionsCount > 1 ? 's' : ''} Available</span>
            </div>
          )}
          
          {/* Resources - Compact indicator */}
          {(competitor.resources.length > 0 || competitor.notes) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground/70 pt-1 border-t border-white/5">
              {competitor.resources.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {competitor.resources.length}
                </span>
              )}
              {competitor.notes && (
                <span className="flex items-center gap-1 text-primary/60">
                  <StickyNote className="h-3 w-3" />
                  Notes
                </span>
              )}
            </div>
          )}
        </CardContent>

        {/* Footer with gradient button */}
        <CardFooter className="flex justify-between border-t border-white/10 pt-4">
          {/* Left: Company Info */}
          <div className="flex items-center gap-2">
            {competitor.intelligenceData?.company_size && (
              <Badge variant="outline" className="text-xs">
                {competitor.intelligenceData.company_size}
              </Badge>
            )}
            {competitor.intelligenceData?.pricing_model && (
              <Badge variant="outline" className="text-xs">
                {competitor.intelligenceData.pricing_model}
              </Badge>
            )}
          </div>
          
          {/* Right: Action Button */}
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            onClick={() => onViewProfile(competitor)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            View Profile
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
