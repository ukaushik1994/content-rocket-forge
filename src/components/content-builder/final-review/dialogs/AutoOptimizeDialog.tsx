
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { useContentOptimizer } from '@/hooks/final-review/useContentOptimizer';

interface AutoOptimizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onUpdateContent: (content: string) => void;
}

export const AutoOptimizeDialog: React.FC<AutoOptimizeDialogProps> = ({
  open,
  onOpenChange,
  content,
  onUpdateContent
}) => {
  const [activeTab, setActiveTab] = useState('quality');
  const { state } = useContentBuilder();
  const { selectedSolution } = state;
  
  const { 
    isAnalyzing,
    recommendations,
    optimizedContent,
    selectedOptimizations,
    toggleOptimization,
    analyzeContent,
    applyOptimizations,
    selectAllOptimizations,
    deselectAllOptimizations
  } = useContentOptimizer(content);
  
  // Start analysis when dialog opens
  React.useEffect(() => {
    if (open && recommendations.length === 0 && !isAnalyzing) {
      analyzeContent();
    }
  }, [open, analyzeContent, recommendations.length, isAnalyzing]);
  
  // Handle apply changes
  const handleApplyChanges = () => {
    const updatedContent = applyOptimizations();
    if (updatedContent) {
      onUpdateContent(updatedContent);
      toast.success("Content optimized successfully!");
      onOpenChange(false);
    } else {
      toast.error("No optimizations were selected to apply");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Content Optimization
          </DialogTitle>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
            <p className="text-center text-muted-foreground">
              AI is analyzing your content and preparing optimization suggestions...
            </p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="quality" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="quality">
                  Quality Checklist
                  <Badge variant="outline" className="ml-2 bg-blue-500/20 text-blue-400 border-0">
                    {recommendations.filter(rec => rec.category === 'quality').length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="solution" disabled={!selectedSolution}>
                  Solution Integration
                  <Badge variant="outline" className="ml-2 bg-purple-500/20 text-purple-400 border-0">
                    {recommendations.filter(rec => rec.category === 'solution').length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="quality" className="border rounded-md mt-4">
                <div className="p-4 bg-muted/30">
                  <h3 className="font-medium mb-1">Content Quality Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    AI has analyzed your content and suggests these improvements to enhance readability and effectiveness.
                  </p>
                </div>
                <Separator />
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm">Select improvements to apply</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => selectAllOptimizations('quality')} 
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deselectAllOptimizations('quality')} 
                        className="text-xs"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[300px] pr-4">
                    {recommendations.filter(rec => rec.category === 'quality').length > 0 ? (
                      <div className="space-y-2 p-2">
                        {recommendations
                          .filter(rec => rec.category === 'quality')
                          .map((rec) => (
                            <div
                              key={rec.id}
                              className={`flex items-start gap-2 p-3 rounded-md ${
                                selectedOptimizations.includes(rec.id)
                                  ? 'bg-blue-900/20 border border-blue-500/30'
                                  : 'bg-secondary/10 hover:bg-secondary/20'
                              }`}
                            >
                              <Checkbox 
                                id={`check-${rec.id}`}
                                checked={selectedOptimizations.includes(rec.id)}
                                onCheckedChange={() => toggleOptimization(rec.id)}
                                className="mt-1"
                              />
                              <div>
                                <label
                                  htmlFor={`check-${rec.id}`}
                                  className="text-sm font-medium block mb-1 cursor-pointer"
                                >
                                  {rec.title}
                                </label>
                                <p className="text-xs text-muted-foreground">{rec.description}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Check className="h-8 w-8 text-green-500 mb-2" />
                        <p className="font-medium">Your content looks great!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          No quality improvements needed at this time.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="solution" className="border rounded-md mt-4">
                <div className="p-4 bg-muted/30">
                  <h3 className="font-medium mb-1">Solution Integration Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Enhance how your content promotes {selectedSolution?.name || 'your solution'} with these AI suggestions.
                  </p>
                </div>
                <Separator />
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-sm">Select improvements to apply</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => selectAllOptimizations('solution')} 
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deselectAllOptimizations('solution')} 
                        className="text-xs"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[300px] pr-4">
                    {selectedSolution ? (
                      recommendations.filter(rec => rec.category === 'solution').length > 0 ? (
                        <div className="space-y-2 p-2">
                          {recommendations
                            .filter(rec => rec.category === 'solution')
                            .map((rec) => (
                              <div
                                key={rec.id}
                                className={`flex items-start gap-2 p-3 rounded-md ${
                                  selectedOptimizations.includes(rec.id)
                                    ? 'bg-purple-900/20 border border-purple-500/30'
                                    : 'bg-secondary/10 hover:bg-secondary/20'
                                }`}
                              >
                                <Checkbox 
                                  id={`check-${rec.id}`}
                                  checked={selectedOptimizations.includes(rec.id)}
                                  onCheckedChange={() => toggleOptimization(rec.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <label
                                    htmlFor={`check-${rec.id}`}
                                    className="text-sm font-medium block mb-1 cursor-pointer"
                                  >
                                    {rec.title}
                                  </label>
                                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Check className="h-8 w-8 text-green-500 mb-2" />
                          <p className="font-medium">Solution integration looks great!</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your content already effectively promotes {selectedSolution.name}.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                        <p className="font-medium">No solution selected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Select a solution first to get integration recommendations.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between gap-2 sm:justify-between">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApplyChanges}
                disabled={selectedOptimizations.length === 0}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Apply Selected Optimizations
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
