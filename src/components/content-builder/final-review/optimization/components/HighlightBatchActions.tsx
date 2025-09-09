import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2, 
  Download, 
  Eye, 
  EyeOff,
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { ContentHighlight } from '@/services/contentHighlightingService';
import { toast } from 'sonner';

interface HighlightBatchActionsProps {
  highlights: ContentHighlight[];
  onHighlightToggle: (highlightId: string, visible: boolean) => void;
  onBulkAction: (action: string, highlightIds: string[]) => void;
}

export const HighlightBatchActions: React.FC<HighlightBatchActionsProps> = ({
  highlights,
  onHighlightToggle,
  onBulkAction
}) => {
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const toggleHighlight = (highlightId: string) => {
    setSelectedHighlights(prev => 
      prev.includes(highlightId)
        ? prev.filter(id => id !== highlightId)
        : [...prev, highlightId]
    );
  };

  const selectAll = () => {
    setSelectedHighlights(highlights.map(h => h.id));
  };

  const clearSelection = () => {
    setSelectedHighlights([]);
  };

  const selectByPriority = (priority: ContentHighlight['priority']) => {
    const priorityHighlights = highlights
      .filter(h => h.priority === priority)
      .map(h => h.id);
    setSelectedHighlights(priorityHighlights);
  };

  const selectByType = (type: ContentHighlight['type']) => {
    const typeHighlights = highlights
      .filter(h => h.type === type)
      .map(h => h.id);
    setSelectedHighlights(typeHighlights);
  };

  const exportSelectedHighlights = () => {
    const selectedData = highlights
      .filter(h => selectedHighlights.includes(h.id))
      .map(h => ({
        type: h.type,
        priority: h.priority,
        title: h.suggestion.title,
        description: h.suggestion.description,
        text: h.text.trim(),
        position: `${h.startIndex}-${h.endIndex}`
      }));

    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-highlights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedData.length} selected highlights`);
  };

  const markAsCompleted = () => {
    onBulkAction('complete', selectedHighlights);
    toast.success(`Marked ${selectedHighlights.length} highlights as completed`);
    setSelectedHighlights([]);
  };

  const getPriorityColor = (priority: ContentHighlight['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: ContentHighlight['type']) => {
    switch (type) {
      case 'seo': return <Target className="w-3 h-3" />;
      case 'structure': return <Lightbulb className="w-3 h-3" />;
      case 'solution': return <CheckCircle2 className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Batch Actions ({selectedHighlights.length} selected)</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCompleted(!showCompleted)}
              className="gap-1"
            >
              {showCompleted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showCompleted ? 'Hide' : 'Show'} All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>
            Select All
          </Button>
          <Button size="sm" variant="outline" onClick={clearSelection}>
            Clear
          </Button>
          <Button size="sm" variant="outline" onClick={() => selectByPriority('high')}>
            High Priority
          </Button>
          <Button size="sm" variant="outline" onClick={() => selectByPriority('medium')}>
            Medium Priority
          </Button>
          <Button size="sm" variant="outline" onClick={() => selectByType('seo')}>
            SEO Issues
          </Button>
        </div>

        {/* Action Buttons */}
        {selectedHighlights.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
            <Button size="sm" onClick={markAsCompleted} className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Mark Complete ({selectedHighlights.length})
            </Button>
            <Button size="sm" variant="outline" onClick={exportSelectedHighlights} className="gap-1">
              <Download className="w-3 h-3" />
              Export Selected
            </Button>
          </div>
        )}

        {/* Highlight List */}
        {showCompleted && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="flex items-start gap-3 p-2 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={selectedHighlights.includes(highlight.id)}
                  onCheckedChange={() => toggleHighlight(highlight.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(highlight.type)}
                    <span className="text-sm font-medium">{highlight.suggestion.title}</span>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(highlight.priority)}`}>
                      {highlight.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    "{highlight.text.slice(0, 60)}..."
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};