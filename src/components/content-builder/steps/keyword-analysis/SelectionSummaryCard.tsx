
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { CheckCircle, Eye, ArrowRight, Settings, Sparkles } from 'lucide-react';

interface SelectionSummaryCardProps {
  serpSelections: SerpSelection[];
  onOpenSelectionManager: () => void;
  onGenerateOutline: () => void;
  isGenerating?: boolean;
}

export function SelectionSummaryCard({
  serpSelections,
  onOpenSelectionManager,
  onGenerateOutline,
  isGenerating = false
}: SelectionSummaryCardProps) {
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelected = selectedItems.length;
  
  // Group by type for summary
  const selectedByType = selectedItems.reduce((acc, item) => {
    const type = item.type === 'peopleAlsoAsk' ? 'question' : item.type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels = {
    question: 'Questions',
    heading: 'Headings',
    keyword: 'Keywords',
    relatedSearch: 'Related Terms',
    contentGap: 'Content Gaps',
    entity: 'Entities',
    snippet: 'Snippets'
  };

  return (
    <Card className="sticky top-4 card-glass border-white/20 backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-900/70 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-shift bg-300% rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-lg flex items-center gap-3">
          <div className="relative">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <div className="absolute inset-0 h-5 w-5 text-emerald-400 animate-pulse-glow opacity-50" />
          </div>
          <span className="text-holographic font-semibold">Content Selection</span>
          {totalSelected > 0 && (
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/30 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              {totalSelected} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5 relative z-10">
        {totalSelected === 0 ? (
          <div className="text-center py-8">
            <div className="relative mb-4">
              <Eye className="h-12 w-12 text-slate-400 mx-auto" />
              <div className="absolute inset-0 h-12 w-12 text-slate-400 mx-auto animate-pulse opacity-30" />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Select items from SERP analysis to include in your content generation
            </p>
          </div>
        ) : (
          <>
            {/* Selection Summary */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
                Selected for content generation:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedByType).map(([type, count]) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className="text-xs bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/50 text-slate-200 backdrop-blur-sm hover:from-slate-700/60 hover:to-slate-600/60 transition-all duration-300"
                  >
                    {count} {typeLabels[type] || type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preview of selected items */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-100 flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
                Preview:
              </p>
              <div className="custom-scrollbar text-xs text-slate-300 space-y-2 max-h-32 overflow-y-auto pr-2">
                {selectedItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item.content}</span>
                  </div>
                ))}
                {selectedItems.length > 5 && (
                  <div className="text-xs text-slate-400 p-2 text-center bg-slate-800/20 rounded-md border border-slate-700/20">
                    +{selectedItems.length - 5} more items...
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSelectionManager}
            className="w-full bg-slate-800/50 border-slate-600/50 text-slate-200 hover:bg-slate-700/60 hover:border-slate-500/60 backdrop-blur-sm transition-all duration-300"
          >
            <Settings className="h-3 w-3 mr-2" />
            Manage Selections
          </Button>
          
          {totalSelected > 0 && (
            <Button
              onClick={onGenerateOutline}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Generate Outline
                </>
              )}
            </Button>
          )}
        </div>

        {totalSelected > 0 && (
          <div className="text-xs text-slate-300 p-3 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">
                All selected items will be strategically integrated by AI to create your content outline and generate comprehensive, SEO-optimized content.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
