import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Target, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface SmartSuggestion {
  id: string;
  type: 'keyword' | 'content' | 'trend' | 'opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  data?: any;
}

interface SmartSuggestionsPanelProps {
  suggestions: SmartSuggestion[];
  onSuggestionClick: (suggestion: SmartSuggestion) => void;
  isLoading?: boolean;
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  suggestions,
  onSuggestionClick,
  isLoading = false
}) => {
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <Search className="h-4 w-4" />;
      case 'content': return <Lightbulb className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Start a SERP analysis to get intelligent suggestions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                 onClick={() => onSuggestionClick(suggestion)}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getSuggestionIcon(suggestion.type)}
                  <span className="font-medium text-sm">{suggestion.title}</span>
                </div>
                <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {suggestion.description}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSuggestionClick(suggestion);
                }}
              >
                {suggestion.action}
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};