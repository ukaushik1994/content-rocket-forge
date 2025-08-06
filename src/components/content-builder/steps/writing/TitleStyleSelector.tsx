import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, List, HelpCircle, TrendingUp, Zap, Users } from 'lucide-react';

export interface TitleStyle {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string[];
}

const titleStyles: TitleStyle[] = [
  {
    id: 'how-to',
    name: 'How-to Guide',
    description: 'Step-by-step instructional titles',
    icon: BookOpen,
    examples: ['How to Master [Keyword]', 'Step-by-Step [Keyword] Guide']
  },
  {
    id: 'listicle',
    name: 'Numbered Lists',
    description: 'List-based titles with specific counts',
    icon: List,
    examples: ['7 Essential [Keyword] Tips', 'Top 10 [Keyword] Strategies']
  },
  {
    id: 'question',
    name: 'Question-Based',
    description: 'Titles that pose relevant questions',
    icon: HelpCircle,
    examples: ['Why is [Keyword] Important?', 'What Makes [Keyword] Effective?']
  },
  {
    id: 'benefit',
    name: 'Benefit-Driven',
    description: 'Focus on outcomes and results',
    icon: TrendingUp,
    examples: ['Boost Your Results with [Keyword]', 'Transform Your [Area] with [Keyword]']
  },
  {
    id: 'action',
    name: 'Action-Oriented',
    description: 'Compelling calls to action',
    icon: Zap,
    examples: ['Master [Keyword] Today', 'Unlock the Power of [Keyword]']
  },
  {
    id: 'audience',
    name: 'Audience-Specific',
    description: 'Targeted to specific user groups',
    icon: Users,
    examples: ['[Keyword] for Beginners', 'Professional [Keyword] Guide']
  }
];

interface TitleStyleSelectorProps {
  selectedStyles: string[];
  onStyleToggle: (styleId: string) => void;
  onGenerateWithStyles: () => void;
  isGenerating: boolean;
}

export const TitleStyleSelector: React.FC<TitleStyleSelectorProps> = ({
  selectedStyles,
  onStyleToggle,
  onGenerateWithStyles,
  isGenerating
}) => {
  return (
    <Card className="border-purple-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-500" />
          Title Style Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {titleStyles.map((style) => {
            const IconComponent = style.icon;
            const isSelected = selectedStyles.includes(style.id);
            
            return (
              <div
                key={style.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10 shadow-md'
                    : 'border-border/50 hover:border-purple-400/50 hover:bg-purple-500/5'
                }`}
                onClick={() => onStyleToggle(style.id)}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-purple-500' : 'text-muted-foreground'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{style.name}</h4>
                      {isSelected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{style.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium mb-1">Examples:</div>
                      <ul className="space-y-0.5">
                        {style.examples.slice(0, 2).map((example, idx) => (
                          <li key={idx} className="italic">• {example}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {selectedStyles.length === 0 
              ? 'Select preferred styles for better title generation'
              : `${selectedStyles.length} style${selectedStyles.length === 1 ? '' : 's'} selected`
            }
          </div>
          <Button
            size="sm"
            onClick={onGenerateWithStyles}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {isGenerating ? 'Generating...' : 'Generate with Styles'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};