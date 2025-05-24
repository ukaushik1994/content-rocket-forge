
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEnhancedContentOptimizer } from './useEnhancedContentOptimizer';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, Wand, Brain, Search, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptimizationRecommendation } from '@/services/enhancedAutoOptimizerService';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface EnhancedAutoOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentUpdate: (newContent: string) => void;
}

export function EnhancedAutoOptimizeDialog({ isOpen, onClose, content, onContentUpdate }: EnhancedAutoOptimizeDialogProps) {
  const {
    isAnalyzing,
    isOptimizing,
    optimization,
    selectedRecommendations,
    analyzeContent,
    optimizeContent,
    toggleRecommendation
  } = useEnhancedContentOptimizer(content);

  const { state } = useContentBuilder();
  const { mainKeyword, selectedKeywords, serpSelections } = state;

  // Initialize analysis when dialog opens
  useEffect(() => {
    if (isOpen && !isAnalyzing && !optimization) {
      analyzeContent();
    }
  }, [isOpen, isAnalyzing, optimization, analyzeContent]);

  const handleApplyOptimizations = async () => {
    const optimizedContent = await optimizeContent();
    if (optimizedContent) {
      onContentUpdate(optimizedContent);
      onClose();
    }
  };

  const renderRecommendation = (rec: OptimizationRecommendation, index: number) => {
    const isSelected = selectedRecommendations.includes(rec.id);
    
    const getIcon = (category: string) => {
      switch (category) {
        case 'humanization': return <Brain className="w-4 h-4" />;
        case 'serp_integration': return <Search className="w-4 h-4" />;
        case 'content_quality': return <Zap className="w-4 h-4" />;
        default: return <Wand className="w-4 h-4" />;
      }
    };

    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'humanization': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'serp_integration': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'content_quality': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    };
    
    return (
      <div key={rec.id} className="bg-secondary/20 rounded-md p-3 my-2">
        <div className="flex items-start gap-3">
          <div 
            className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}
            onClick={() => toggleRecommendation(rec.id)}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getIcon(rec.category)}
              <h4 className="font-medium">{rec.title}</h4>
              <Badge className={`text-xs ${getCategoryColor(rec.category)}`}>
                {rec.category.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {rec.impact} impact
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{rec.description}</p>
            {rec.autoFixable && (
              <Badge variant="outline" className="text-xs mt-1">
                Auto-fixable
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalysisOverview = () => {
    if (!optimization) return null;

    const { humanizationAnalysis, serpAnalysis, recommendations } = optimization;
    
    return (
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI Content Detection */}
          {humanizationAnalysis && (
            <div className="p-3 border rounded-lg bg-blue-500/10 border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">AI Content Score</span>
              </div>
              <div className="space-y-2">
                <Progress value={humanizationAnalysis.aiLikelihoodScore} className="h-2" />
                <div className="flex justify-between text-xs">
                  <span>Human-like</span>
                  <span className="font-medium">{humanizationAnalysis.aiLikelihoodScore}%</span>
                  <span>AI-like</span>
                </div>
              </div>
            </div>
          )}

          {/* SERP Integration */}
          <div className="p-3 border rounded-lg bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium">SERP Integration</span>
            </div>
            <div className="space-y-2">
              <Progress value={serpAnalysis.integrationScore} className="h-2" />
              <div className="text-xs text-center font-medium">
                {serpAnalysis.integratedItems}/{serpAnalysis.totalSerpItems} items ({serpAnalysis.integrationScore}%)
              </div>
            </div>
          </div>

          {/* Recommendations Count */}
          <div className="p-3 border rounded-lg bg-purple-500/10 border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Wand className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Recommendations</span>
            </div>
            <div className="text-2xl font-bold text-center">
              {recommendations.length}
            </div>
            <div className="text-xs text-center text-muted-foreground">
              {selectedRecommendations.length} selected
            </div>
          </div>
        </div>
      </div>
    );
  };

  const groupedRecommendations = optimization?.recommendations.reduce((groups, rec) => {
    const category = rec.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(rec);
    return groups;
  }, {} as Record<string, OptimizationRecommendation[]>) || {};

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand className="h-5 w-5 text-neon-purple" />
            Enhanced AI Content Optimization
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis including AI detection, SERP integration, and content quality improvements
          </DialogDescription>
        </DialogHeader>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-center">Analyzing content for AI patterns, SERP integration, and optimization opportunities...</p>
          </div>
        ) : optimization ? (
          <div className="space-y-6">
            {renderAnalysisOverview()}
            
            {Object.keys(groupedRecommendations).length > 0 ? (
              <Tabs defaultValue={Object.keys(groupedRecommendations)[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {groupedRecommendations.humanization && (
                    <TabsTrigger value="humanization" className="flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      Humanization
                    </TabsTrigger>
                  )}
                  {groupedRecommendations.serp_integration && (
                    <TabsTrigger value="serp_integration" className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      SERP Integration
                    </TabsTrigger>
                  )}
                  {groupedRecommendations.content_quality && (
                    <TabsTrigger value="content_quality" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Content Quality
                    </TabsTrigger>
                  )}
                </TabsList>
                
                {Object.entries(groupedRecommendations).map(([category, recs]) => (
                  <TabsContent key={category} value={category} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize mb-2">
                      {category.replace('_', ' ')} Recommendations
                    </h3>
                    {recs.map(renderRecommendation)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-4" />
                <p className="text-center">Your content is well-optimized! No major improvements needed.</p>
              </div>
            )}
            
            {Object.keys(groupedRecommendations).length > 0 && (
              <>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleApplyOptimizations}
                    disabled={isOptimizing || selectedRecommendations.length === 0}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Wand className="w-4 h-4 mr-2" />
                        Apply {selectedRecommendations.length} Optimizations
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <Button onClick={analyzeContent} className="mt-4">
              Start Analysis
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
