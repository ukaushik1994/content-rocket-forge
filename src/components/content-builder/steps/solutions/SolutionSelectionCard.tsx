
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle2 } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';

interface SolutionSelectionCardProps {
  solution: Solution;
  selected: boolean;
  onClick: () => void;
}

export const SolutionSelectionCard: React.FC<SolutionSelectionCardProps> = ({
  solution,
  selected,
  onClick
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 overflow-hidden ${
        selected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'hover:border-primary/50 hover:bg-accent/5'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {solution.logoUrl ? (
              <img 
                src={solution.logoUrl} 
                alt={solution.name} 
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
            )}
            <h3 className="font-medium">{solution.name}</h3>
          </div>
          {selected && (
            <CheckCircle2 className="w-5 h-5 text-primary" />
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {solution.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {solution.category}
          </Badge>
          {solution.features.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {solution.features.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{solution.features.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className={`bg-muted/50 px-4 py-2 text-xs ${
        selected ? 'border-t border-primary/20' : 'border-t border-border'
      }`}>
        <div className="flex items-center justify-between w-full">
          <span className="text-muted-foreground">
            {solution.targetAudience?.slice(0, 1).join(", ") || "General audience"}
          </span>
          <span className="font-medium text-primary/80">
            {selected ? 'Selected' : 'Select Solution'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
