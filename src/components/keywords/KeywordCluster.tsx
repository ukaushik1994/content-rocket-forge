
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface KeywordProps {
  primary: string;
  volume: string;
  difficulty: string;
  cpc: string;
  intent: string;
  secondaryKeywords: string[];
  semanticTerms: string[];
  longTailKeywords: string[];
  onUse?: (keyword: string) => void;
}

export function KeywordCluster({ 
  primary, 
  volume, 
  difficulty, 
  cpc, 
  intent,
  secondaryKeywords,
  semanticTerms,
  longTailKeywords,
  onUse
}: KeywordProps) {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Map difficulty to color
  const difficultyColor = {
    'Low': 'bg-green-500/20 text-green-500 hover:bg-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30',
    'High': 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
  };

  // Map intent to appropriate badge
  const intentBadge = {
    'Informational': 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/30',
    'Navigational': 'bg-purple-500/20 text-purple-500 hover:bg-purple-500/30',
    'Commercial': 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30',
    'Transactional': 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
  };

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 neon-border ${expanded ? 'shadow-neon' : ''} ${isHovered ? 'scale-[1.01]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gradient font-bold">
            {primary}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-accent/30 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="transition-transform duration-200" /> : <ChevronDown className="transition-transform duration-200" />}
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="border-primary/30">
            {volume} searches/mo
          </Badge>
          <Badge variant="outline" className={difficultyColor[difficulty as keyof typeof difficultyColor] || "bg-gray-500/20 text-gray-500"}>
            {difficulty} difficulty
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            {cpc} CPC
          </Badge>
          <Badge variant="outline" className={intentBadge[intent as keyof typeof intentBadge] || "bg-gray-500/20 text-gray-500"}>
            {intent} intent
          </Badge>
        </CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className={`pb-2 space-y-4 animate-fade-in`}>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Secondary Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {secondaryKeywords.map((keyword, i) => (
                <Badge 
                  key={i} 
                  className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer hover:scale-105"
                  onClick={() => onUse && onUse(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Semantic Terms</h4>
            <div className="flex flex-wrap gap-2">
              {semanticTerms.map((term, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="border-neon-blue/30 text-neon-blue hover:border-neon-blue/60 transition-colors cursor-pointer hover:scale-105"
                  onClick={() => onUse && onUse(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Long-tail Variations</h4>
            <div className="flex flex-wrap gap-2">
              {longTailKeywords.map((keyword, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="border-neon-purple/30 text-neon-purple hover:border-neon-purple/60 transition-colors cursor-pointer hover:scale-105"
                  onClick={() => onUse && onUse(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto gap-1 hover:text-primary transition-colors"
          onClick={() => onUse && onUse(primary)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Use Keyword</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
