
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, Wand2, Brain, Search, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { 
  analyzeContentForEnhancedOptimization,
  applyEnhancedOptimizations,
  EnhancedOptimizationSuggestion,
  EnhancedOptimizationResult
} from './EnhancedAutoOptimizer';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedAutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export function EnhancedAutoOptimizeDialog({ 
  isOpen, 
  onClose, 
  content, 
  onContentUpdate 
}: EnhancedAutoOptimizeDialogProps) {
  const { state } = useContentBuilder();
  const { mainKeyword, selectedKeywords, serpSelections } = state;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationData, setOptimizationData] = useState<EnhancedOptimizationResult | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize analysis when dialog opens
  useEffect(() => {
    if (isOpen && !isAnalyzing && !optimizationData) {
      analyzeContent();
    }
  }, [isOpen]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      const keywords = [mainKeyword, ...selectedKeywords].filter(Boolean);
      const result = await analyzeContentForEnhancedOptimization(
        content,
        serpSelections || [],
        keywords
      );
      setOptimizationData(result);
      
      // Auto-select high priority suggestions
      const highPrioritySuggestions = [
        ...result.humanizationSuggestions,
        ...result.serpIntegrationSuggestions,
        ...result.contentSuggestions
      ].filter(s => s.priority === 'high' && s.autoFixable);
      
      setSelectedSuggestions(new Set(highPrioritySuggestions.map(s => s.id)));
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyOptimizations = async () => {
    if (!optimizationData) return;

    setIsOptimizing(true);
    try {
      const keywords = [mainKeyword, ...selectedKeywords].filter(Boolean);
      const optimizedContent = await applyEnhancedOptimizations(
        content,
        Array.from(selectedSuggestions),
        optimizationData,
        serpSelections || [],
        keywords
      );

      if (optimizedContent) {
        onContentUpdate(optimizedContent);
        toast.success('Content optimized successfully');
        onClose();
      } else {
        toast.error('Failed to optimize content');
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleSuggestion = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const renderSuggestion = (suggestion: EnhancedOptimizationSuggestion) => {
    const isSelected = selectedSuggestions.has(suggestion.id);
    const icon = suggestion.type === 'humanization' ? Brain : 
                suggestion.type === 'serp_integration' ? Search : Eye;
    const IconComponent = icon;
    
    return (
      <div key={suggestion.id} className="bg-secondary/20 rounded-md p-3 my-2">
        <div className="flex items-start gap-3">
          <div 
            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
            }`}
            onClick={() => toggleSuggestion(suggestion.id)}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className="h-4 w-4" />
              <h4 className="font-medium text-sm">{suggestion.title}</h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  suggestion.priority === 'high' ? 'border-red-500 text-red-500' :
                  suggestion.priority === 'medium' ? 'border-amber-500 text-amber-500' :
                  'border-green-500 text-green-500'
                }`}
              >
                {suggestion.priority}
              </Badge>
              {suggestion.autoFixable && (
                <Badge variant="outline" className="text-xs">Auto-fixable</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
            <p className="text-xs text-muted-foreground mt-1 italic">{suggestion.impact}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderKeywordReference = () => {
    const keywords = [mainKeyword, ...selectedKeywords].filter(Boolean);
    if (keywords.length === 0) return null;
    
    return (
      <div className="mb-4 p-3 border border-dashed rounded-md bg-secondary/10">
        <h4 className="text-sm font-medium mb-2">Target Keywords</h4>
        <div className="flex flex-wrap gap-1.5">
          {mainKeyword && (
            <Badge className="bg-blue-600 hover:bg-blue-700">{mainKeyword} (main)</Badge>
          )}
          {selectedKeywords.map((keyword, idx) => (
            <Badge key={idx} className="bg-blue-500/70 hover:bg-blue-500">{keyword}</Badge>
          ))}
        </div>
      </div>
    );
  };

  const allSuggestions = optimizationData ? [
    ...optimizationData.humanizationSuggestions,
    ...optimizationData.serpIntegrationSuggestions,
    ...optimizationData.contentSuggestions
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Enhanced AI Content Optimization
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis including SERP integration, content humanization, and quality improvements
          </DialogDescription>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center mb-2">Analyzing content comprehensively...</p>
            <p className="text-xs text-muted-foreground text-center">
              Checking SERP integration, AI patterns, and quality metrics
            </p>
          </div>
        ) : optimizationData && allSuggestions.length > 0 ? (
          <div className="flex-1 flex flex-col">
            {renderKeywordReference()}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  Overview ({allSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="humanization">
                  <Brain className="h-4 w-4 mr-1" />
                  AI Detection ({optimizationData.humanizationSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="serp">
                  <Search className="h-4 w-4 mr-1" />
                  SERP Integration ({optimizationData.serpIntegrationSuggestions.length})
                </TabsTrigger>
                <TabsTrigger value="quality">
                  <Eye className="h-4 w-4 mr-1" />
                  Quality ({optimizationData.contentSuggestions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="flex-1">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {optimizationData.humanizationSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Content Humanization
                        </h3>
                        {optimizationData.humanizationSuggestions.map(renderSuggestion)}
                      </div>
                    )}
                    
                    {optimizationData.serpIntegrationSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Search className="h-5 w-5" />
                          SERP Integration
                        </h3>
                        {optimizationData.serpIntegrationSuggestions.map(renderSuggestion)}
                      </div>
                    )}
                    
                    {optimizationData.contentSuggestions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Content Quality
                        </h3>
                        {optimizationData.contentSuggestions.map(renderSuggestion)}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="humanization" className="flex-1">
                <ScrollArea className="h-[400px]">
                  {optimizationData.humanizationSuggestions.length > 0 ? (
                    optimizationData.humanizationSuggestions.map(renderSuggestion)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No humanization issues detected</p>
                      <p className="text-sm">Your content appears naturally written</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="serp" className="flex-1">
                <ScrollArea className="h-[400px]">
                  {optimizationData.serpIntegrationSuggestions.length > 0 ? (
                    optimizationData.serpIntegrationSuggestions.map(renderSuggestion)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>SERP integration looks good</p>
                      <p className="text-sm">Selected SERP items are well integrated</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="quality" className="flex-1">
                <ScrollArea className="h-[400px]">
                  {optimizationData.contentSuggestions.length > 0 ? (
                    optimizationData.contentSuggestions.map(renderSuggestion)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Content quality is excellent</p>
                      <p className="text-sm">No quality improvements needed</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedSuggestions.size} of {allSuggestions.length} optimizations selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleApplyOptimizations}
                  disabled={isOptimizing || selectedSuggestions.size === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    'Apply Selected Optimizations'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
            <p className="text-center font-medium">Content is already well-optimized!</p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              No significant improvements needed for SERP integration or humanization
            </p>
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
