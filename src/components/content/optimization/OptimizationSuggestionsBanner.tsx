import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Check, 
  X,
  Loader2,
  Lightbulb,
  Target,
  FileText,
  Megaphone
} from 'lucide-react';
import { useOptimizationSuggestions, OptimizationSuggestion } from '@/hooks/useOptimizationSuggestions';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizationSuggestionsBannerProps {
  contentId: string;
  currentContent: string;
  onContentUpdate?: (newContent: string) => void;
}

const getSuggestionIcon = (type: string) => {
  switch (type) {
    case 'headline':
      return Lightbulb;
    case 'cta':
      return Megaphone;
    case 'seo':
    case 'meta_description':
      return Target;
    default:
      return FileText;
  }
};

const getSuggestionLabel = (type: string) => {
  switch (type) {
    case 'headline':
      return 'Headline';
    case 'cta':
      return 'Call to Action';
    case 'seo':
      return 'SEO';
    case 'meta_description':
      return 'Meta Description';
    case 'content_structure':
      return 'Content Structure';
    case 'content_depth':
      return 'Content Depth';
    default:
      return type.replace('_', ' ');
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'low':
      return 'bg-muted text-muted-foreground border-border';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const OptimizationSuggestionsBanner: React.FC<OptimizationSuggestionsBannerProps> = ({
  contentId,
  currentContent,
  onContentUpdate
}) => {
  const { suggestions, isLoading, applySuggestions, dismissSuggestions } = useOptimizationSuggestions(contentId);
  const [isOpen, setIsOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewSuggestion, setPreviewSuggestion] = useState<OptimizationSuggestion | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (isLoading) {
    return null;
  }

  if (suggestions.length === 0) {
    return null;
  }

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplySelected = async () => {
    if (selectedIds.length === 0) return;
    
    setIsApplying(true);
    try {
      const selectedSuggestions = suggestions.filter(s => selectedIds.includes(s.id));
      const newContent = await applySuggestions(selectedSuggestions, currentContent);
      onContentUpdate?.(newContent);
      setSelectedIds([]);
    } finally {
      setIsApplying(false);
    }
  };

  const handleDismissAll = async () => {
    await dismissSuggestions(suggestions.map(s => s.id));
  };

  return (
    <>
      <Card className="bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-amber-500/5 transition-colors rounded-t-lg py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-foreground">AI Suggestions</span>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">
                    {suggestions.length}
                  </Badge>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground">
                Based on recent performance, here's what we recommend:
              </p>
              
              <div className="space-y-2">
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => {
                    const Icon = getSuggestionIcon(suggestion.suggestion_type);
                    const priority = (suggestion.metadata as any)?.priority || 'medium';
                    
                    return (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-amber-500/30 transition-colors"
                      >
                        <Checkbox
                          id={suggestion.id}
                          checked={selectedIds.includes(suggestion.id)}
                          onCheckedChange={() => handleToggleSelection(suggestion.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-amber-400" />
                            <span className="font-medium text-sm text-foreground">
                              {getSuggestionLabel(suggestion.suggestion_type)}
                            </span>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(priority)}`}>
                              {priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {suggestion.reason}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewSuggestion(suggestion)}
                          className="shrink-0"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Button
                  size="sm"
                  onClick={handleApplySelected}
                  disabled={selectedIds.length === 0 || isApplying}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isApplying ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1" />
                  )}
                  Apply Selected ({selectedIds.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissAll}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Dismiss All
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewSuggestion} onOpenChange={() => setPreviewSuggestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-400" />
              Preview Change: {previewSuggestion && getSuggestionLabel(previewSuggestion.suggestion_type)}
            </DialogTitle>
          </DialogHeader>
          
          {previewSuggestion && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2 font-medium">Why this change?</p>
                <p className="text-sm text-foreground">{previewSuggestion.reason}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                      Original
                    </Badge>
                  </div>
                  <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20 text-sm text-muted-foreground max-h-60 overflow-y-auto">
                    {previewSuggestion.original_content || 'No original content to compare'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                      Suggested
                    </Badge>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20 text-sm text-foreground max-h-60 overflow-y-auto">
                    {previewSuggestion.suggested_content}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPreviewSuggestion(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleToggleSelection(previewSuggestion.id);
                    setPreviewSuggestion(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {selectedIds.includes(previewSuggestion.id) ? 'Deselect' : 'Select for Apply'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
