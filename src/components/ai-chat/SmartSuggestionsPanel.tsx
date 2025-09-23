import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  FileText, 
  Zap, 
  X,
  Search,
  BarChart3,
  Users,
  Settings,
  Star,
  ChevronRight,
  Brain,
  Sparkles
} from 'lucide-react';
import { useSerpSmartSuggestions } from '@/hooks/useSerpSmartSuggestions';
import type { SerpSmartSuggestion } from '@/hooks/useSerpSmartSuggestions';

interface SmartSuggestionsPanelProps {
  serpData?: any[];
  userContext?: any;
  conversationHistory?: any[];
  onApplySuggestion?: (suggestion: SerpSmartSuggestion) => void;
  className?: string;
}

const typeIcons = {
  keyword: Search,
  content: FileText,
  optimization: Settings,
  strategy: Target,
  competitive: BarChart3
};

const priorityColors = {
  high: 'destructive',
  medium: 'secondary', 
  low: 'outline'
} as const;

const SuggestionCard: React.FC<{
  suggestion: SerpSmartSuggestion;
  onApply: (suggestion: SerpSmartSuggestion) => void;
  onDismiss: (id: string) => void;
  index: number;
}> = ({ suggestion, onApply, onDismiss, index }) => {
  const IconComponent = typeIcons[suggestion.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -300, scale: 0.8 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <IconComponent className="h-4 w-4" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm leading-tight">{suggestion.title}</h4>
                <div className="flex items-center gap-1">
                  <Badge variant={priorityColors[suggestion.priority]} className="text-xs px-2 py-0.5">
                    {suggestion.priority}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss(suggestion.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {suggestion.description}
              </p>
              
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" />
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {suggestion.type}
                  </Badge>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => onApply(suggestion)}
                  className="gap-1 text-xs h-7"
                >
                  <Zap className="h-3 w-3" />
                  Apply
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  serpData,
  userContext,
  conversationHistory,
  onApplySuggestion,
  className = ""
}) => {
  const {
    suggestions,
    isLoading,
    refreshSuggestions,
    dismissSuggestion,
    applySuggestion
  } = useSerpSmartSuggestions({
    serpData,
    userContext,
    conversationHistory
  });

  const handleApplySuggestion = (suggestion: SerpSmartSuggestion) => {
    applySuggestion(suggestion);
    onApplySuggestion?.(suggestion);
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            Generating Smart Suggestions...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No suggestions available. Try asking about keywords, content strategy, or SEO optimization!
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSuggestions}
              className="mt-3"
            >
              <Brain className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
  const otherSuggestions = suggestions.filter(s => s.priority !== 'high');

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Smart Suggestions
            <Badge variant="secondary" className="text-xs">
              {suggestions.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSuggestions}
            className="h-8 w-8 p-0"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {/* High Priority Suggestions */}
            {highPrioritySuggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1 w-1 rounded-full bg-red-500"></div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    High Priority
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  {highPrioritySuggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                      onDismiss={dismissSuggestion}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Other Suggestions */}
            {otherSuggestions.length > 0 && (
              <div className={highPrioritySuggestions.length > 0 ? "mt-6" : ""}>
                {highPrioritySuggestions.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Additional Suggestions
                    </span>
                  </div>
                )}
                <AnimatePresence mode="popLayout">
                  {otherSuggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                      onDismiss={dismissSuggestion}
                      index={highPrioritySuggestions.length + index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Action Footer */}
        {suggestions.length > 0 && (
          <div className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Powered by AI & SERP Intelligence</span>
              <Button
                variant="ghost" 
                size="sm"
                onClick={refreshSuggestions}
                className="h-6 text-xs"
              >
                Refresh All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
