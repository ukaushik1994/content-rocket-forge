import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import {
  BookmarkIcon, CheckCircle, ExternalLink, Target, Users, Zap, Star, Link, FileText,
} from 'lucide-react';

interface SolutionDetailDialogProps {
  solution: EnhancedSolution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onUseInContent?: () => void;
}

export const SolutionDetailDialog: React.FC<SolutionDetailDialogProps> = ({
  solution,
  open,
  onOpenChange,
  onEdit,
  onUseInContent,
}) => {
  if (!solution) return null;

  const sections = [
    {
      icon: Zap,
      title: 'Features',
      items: solution.features,
      color: 'text-primary',
      badgeClass: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      icon: CheckCircle,
      title: 'Use Cases',
      items: solution.useCases,
      color: 'text-green-400',
      badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    {
      icon: Target,
      title: 'Pain Points',
      items: solution.painPoints,
      color: 'text-orange-400',
      badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    {
      icon: Users,
      title: 'Target Audience',
      items: solution.targetAudience,
      color: 'text-blue-400',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 glass-card border-border/50">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <DialogHeader>
              <div className="flex items-start gap-4">
                {solution.logoUrl ? (
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted/50 flex items-center justify-center shrink-0">
                    <img
                      src={solution.logoUrl}
                      alt={`${solution.name} logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookmarkIcon className="h-7 w-7 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-title text-foreground">{solution.name}</DialogTitle>
                  {solution.positioningStatement && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{solution.positioningStatement}"
                    </p>
                  )}
                  {solution.category && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {solution.category}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Description */}
            {solution.description && (
              <div className="glass-card p-4">
                <p className="text-sm text-foreground leading-relaxed">{solution.description}</p>
              </div>
            )}

            {/* Sections */}
            {sections.map((section) =>
              section.items && section.items.length > 0 ? (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className={`h-4 w-4 ${section.color}`} />
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item, i) => (
                      <Badge key={i} variant="outline" className={section.badgeClass}>
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null
            )}

            {/* Metrics */}
            {solution.metrics && Object.values(solution.metrics).some(Boolean) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-foreground">Key Metrics</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {solution.metrics.customerSatisfaction && (
                    <div className="glass-card p-3 text-center">
                      <p className="text-lg font-bold text-green-400">{solution.metrics.customerSatisfaction}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                  {solution.metrics.adoptionRate && (
                    <div className="glass-card p-3 text-center">
                      <p className="text-lg font-bold text-primary">{solution.metrics.adoptionRate}</p>
                      <p className="text-xs text-muted-foreground">Adoption</p>
                    </div>
                  )}
                  {solution.metrics.implementationTime && (
                    <div className="glass-card p-3 text-center">
                      <p className="text-lg font-bold text-blue-400">{solution.metrics.implementationTime}</p>
                      <p className="text-xs text-muted-foreground">Setup</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Integrations */}
            {solution.integrations && solution.integrations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Link className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {solution.integrations.map((item, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* UVPs */}
            {solution.uniqueValuePropositions && solution.uniqueValuePropositions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-foreground">Why Choose {solution.name}</h3>
                </div>
                <ul className="space-y-2">
                  {solution.uniqueValuePropositions.map((uvp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">✓</span>
                      <span>{uvp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {solution.resources && solution.resources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Resources</h3>
                </div>
                <div className="space-y-2">
                  {solution.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-border/30">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onUseInContent && (
                <Button size="sm" onClick={onUseInContent}>
                  Use in Content
                </Button>
              )}
              {solution.externalUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-muted-foreground"
                  onClick={() => window.open(solution.externalUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
