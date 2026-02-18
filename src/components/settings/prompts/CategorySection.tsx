import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CategorySectionProps {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  configuredCount: number;
  totalCount: number;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  isOpen,
  onToggle,
  children,
  configuredCount,
  totalCount,
}) => {
  const progress = totalCount > 0 ? (configuredCount / totalCount) * 100 : 0;
  const isComplete = configuredCount === totalCount;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="space-y-3">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="font-medium text-left">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left hidden sm:block">
                {description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={isComplete ? "default" : "secondary"}
                className="text-xs"
              >
                {configuredCount}/{totalCount}
              </Badge>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isComplete ? 'bg-foreground' : 'bg-foreground/60'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-2">
          <div className="grid grid-cols-1 gap-2 ml-6">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default CategorySection;