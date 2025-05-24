
import React from 'react';
import { CheckCircle2, Bot, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizationSuggestion } from '../types';

interface SuggestionSectionProps {
  title: string;
  suggestions: OptimizationSuggestion[];
  selectedSuggestions: string[];
  onToggleSuggestion: (suggestionId: string) => void;
}

export function SuggestionSection({ 
  title, 
  suggestions, 
  selectedSuggestions, 
  onToggleSuggestion 
}: SuggestionSectionProps) {
  if (suggestions.length === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'humanization': return <Bot className="w-4 h-4 text-purple-500" />;
      case 'serp_integration': return <Target className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getTypeBadgeText = (type: string) => {
    switch (type) {
      case 'content': return 'Content Quality';
      case 'humanization': return 'AI Humanization';
      case 'serp_integration': return 'SERP Integration';
      case 'solution': return 'Solution Integration';
      default: return type;
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {suggestions.map((suggestion) => {
        const isSelected = selectedSuggestions.includes(suggestion.id);
        
        return (
          <div key={suggestion.id} className="bg-secondary/20 rounded-md p-3 my-2">
            <div className="flex items-start gap-3">
              <div 
                className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
                onClick={() => onToggleSuggestion(suggestion.id)}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(suggestion.type)}
                    <Badge variant="outline" className="text-xs">
                      {getTypeBadgeText(suggestion.type)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
