import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Clock, 
  X,
  Eye,
  Download
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { motion } from 'framer-motion';

interface OptimizationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OptimizationHistoryModal: React.FC<OptimizationHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const { getOptimizationSelections } = useContentBuilder();
  const optimizationData = getOptimizationSelections();

  if (!optimizationData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Optimization History
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No optimization history available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { suggestions, highlights } = optimizationData;

  const exportHistory = () => {
    const historyData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalOptimizations: suggestions.length + highlights.length,
        suggestions: suggestions.length,
        highlights: highlights.length
      },
      appliedSuggestions: suggestions,
      selectedHighlights: highlights
    };

    const blob = new Blob([JSON.stringify(historyData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Optimization History
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportHistory} className="gap-2">
                <Download className="w-3 h-3" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-primary">
                  {suggestions.length + highlights.length}
                </div>
                <p className="text-xs text-muted-foreground">Total Applied</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">
                  {suggestions.length}
                </div>
                <p className="text-xs text-muted-foreground">Suggestions</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-purple-600">
                  {highlights.length}
                </div>
                <p className="text-xs text-muted-foreground">Content Highlights</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Detailed History */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-4">
              
              {/* Applied Suggestions Section */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        Applied Suggestions ({suggestions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {suggestions.map((suggestionId, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Suggestion ID: {suggestionId}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Applied
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Selected Highlights Section */}
              {highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        Selected Content Highlights ({highlights.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {highlights.map((highlightId, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <span className="text-sm">Highlight ID: {highlightId}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Selected
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Timeline Entry */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="bg-muted/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Optimization Applied</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Content was successfully optimized with the selected suggestions and highlights.
                      All changes have been integrated and saved to the content builder.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};