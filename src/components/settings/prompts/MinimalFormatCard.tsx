import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Pencil, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContentFormat } from '@/components/content-repurposing/formats';
import { getPromptTemplatesByType } from '@/services/userPreferencesService';

interface MinimalFormatCardProps {
  format: ContentFormat;
  IconComponent: React.ComponentType<{ className?: string }>;
  onEdit: (formatId: string) => void;
  onEnhance: (formatId: string) => void;
  isEnhancing: boolean;
}

export const MinimalFormatCard: React.FC<MinimalFormatCardProps> = ({
  format,
  IconComponent,
  onEdit,
  onEnhance,
  isEnhancing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const existingTemplates = getPromptTemplatesByType(format.id);
  const hasTemplate = existingTemplates.length > 0;

  const statusColor = hasTemplate 
    ? 'bg-foreground text-background' 
    : 'bg-muted text-muted-foreground';

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className={`border rounded-lg transition-all ${
        hasTemplate ? 'border-border/20 bg-transparent' : 'border-border/20 hover:border-border/40'
      }`}>
        {/* Collapsed State - Ultra Minimal */}
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{format.name}</span>
              </div>
              {hasTemplate && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Custom
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        {/* Expanded State - Show Details & Actions */}
        <CollapsibleContent className="px-3 pb-3">
          <div className="space-y-3 pt-2 border-t border-border/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {format.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onEdit(format.id)}
                variant={hasTemplate ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs h-8"
              >
                {hasTemplate ? (
                  <>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </>
                )}
              </Button>
              
              {hasTemplate && (
                <Button
                  onClick={() => onEnhance(format.id)}
                  variant="outline"
                  size="sm"
                  disabled={isEnhancing}
                  className="px-2 h-8"
                  title="Enhance with AI feedback"
                >
                  {isEnhancing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default MinimalFormatCard;