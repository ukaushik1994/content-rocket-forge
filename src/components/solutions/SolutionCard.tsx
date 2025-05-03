
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkIcon } from 'lucide-react';

interface SolutionCardProps {
  name: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  cta?: string;
  onUseInContent?: () => void;
}

export function SolutionCard({ 
  name, 
  features, 
  useCases, 
  painPoints, 
  targetAudience, 
  cta = "Use in Content",
  onUseInContent 
}: SolutionCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-neon border border-white/10 bg-glass">
      <CardHeader className="bg-gradient-to-br from-neon-purple/20 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gradient">{name}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BookmarkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 grid gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Key Features</h4>
          <div className="flex flex-wrap gap-2">
            {features.map((feature, i) => (
              <Badge key={i} variant="outline" className="border-neon-purple/30 text-foreground">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Use Cases</h4>
          <div className="flex flex-wrap gap-2">
            {useCases.map((useCase, i) => (
              <Badge key={i} variant="outline" className="border-neon-blue/30 text-foreground">
                {useCase}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Pain Points Solved</h4>
          <div className="flex flex-wrap gap-2">
            {painPoints.map((painPoint, i) => (
              <Badge key={i} className="bg-green-500/10 text-green-500">
                {painPoint}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Target Audience</h4>
          <div className="flex flex-wrap gap-2">
            {targetAudience.map((audience, i) => (
              <Badge key={i} variant="secondary" className="bg-secondary/60">
                {audience}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-white/10 pt-4">
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          onClick={onUseInContent}
        >
          {cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
