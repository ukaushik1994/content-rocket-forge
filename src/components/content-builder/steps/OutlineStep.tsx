
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Sparkles, Tag, HelpCircle, FileText, Heading, FileSearch, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { Badge } from '@/components/ui/badge';

export const OutlineStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    outline, 
    serpData, 
    mainKeyword, 
    serpSelections, 
    additionalInstructions,
    contentTitle
  } = state;
  
  const [instructions, setInstructions] = useState(additionalInstructions);
  const [isAddingInstructions, setIsAddingInstructions] = useState(false);
  
  useEffect(() => {
    // Mark as complete if we have an outline with at least 3 sections
    if (outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
    }
  }, [outline]);
  
  const handleSaveInstructions = () => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: instructions });
    setIsAddingInstructions(false);
    toast.success('Additional instructions saved');
  };
  
  // Filter selected items from SERP analysis
  const selectedItems = serpSelections.filter(item => item.selected);
  
  // Group selected items by type
  const itemsByType = {
    keyword: selectedItems.filter(item => item.type === 'keyword'),
    question: selectedItems.filter(item => item.type === 'question'),
    entity: selectedItems.filter(item => item.type === 'entity'),
    heading: selectedItems.filter(item => item.type === 'heading'),
    contentGap: selectedItems.filter(item => item.type === 'contentGap'),
    topRank: selectedItems.filter(item => item.type === 'topRank')
  };
  
  // Get counts for each type
  const counts = {
    keyword: itemsByType.keyword.length,
    question: itemsByType.question.length,
    entity: itemsByType.entity.length,
    heading: itemsByType.heading.length,
    contentGap: itemsByType.contentGap.length,
    topRank: itemsByType.topRank.length
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Content Outline</h3>
          <p className="text-sm text-muted-foreground">
            Create your content structure using AI.
          </p>
        </div>
        
        <div>
          <Dialog open={isAddingInstructions} onOpenChange={setIsAddingInstructions}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Lightbulb className="h-4 w-4 mr-2" />
                Add Instructions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Additional Instructions</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Add any additional instructions or notes for the content creation process.
                </p>
                <Textarea 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., Include case studies, use a conversational tone, target beginners..."
                  className="min-h-[150px]"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSaveInstructions}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                >
                  Save Instructions
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current content title display if it exists */}
      {contentTitle && (
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Suggested Title
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
              {contentTitle}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              This title was generated based on your keyword and SERP selections. You can update it in the final review.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Outline Generator */}
      <AIOutlineGenerator />
      
      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <Card className="border border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Selected from SERP Analysis ({selectedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                The AI will use these selected items to generate your content outline:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keywords Section */}
                {counts.keyword > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-blue-400" />
                        Keywords ({counts.keyword})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {itemsByType.keyword.map((item, i) => (
                          <Badge key={i} variant="outline" className="bg-blue-900/30 border-blue-500/30 text-xs">
                            {item.content}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Questions Section */}
                {counts.question > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                        Questions ({counts.question})
                      </p>
                      <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                        {itemsByType.question.map((item, i) => (
                          <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                            {item.content}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Entities Section */}
                {counts.entity > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-indigo-400" />
                        Entities ({counts.entity})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {itemsByType.entity.map((item, i) => (
                          <Badge key={i} variant="outline" className="bg-indigo-900/30 border-indigo-500/30 text-xs">
                            {item.content}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Headings Section */}
                {counts.heading > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <Heading className="h-3.5 w-3.5 text-teal-400" />
                        Headings ({counts.heading})
                      </p>
                      <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                        {itemsByType.heading.map((item, i) => (
                          <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                            {item.content}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Gaps Section */}
                {counts.contentGap > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <FileSearch className="h-3.5 w-3.5 text-rose-400" />
                        Content Gaps ({counts.contentGap})
                      </p>
                      <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                        {itemsByType.contentGap.map((item, i) => (
                          <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                            {item.content}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Ranks Section */}
                {counts.topRank > 0 && (
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-green-400" />
                        Top Ranks ({counts.topRank})
                      </p>
                      <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                        {itemsByType.topRank.map((item, i) => (
                          <div key={i} className="pb-1 border-b border-white/5 last:border-0 last:pb-0">
                            {item.content}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
