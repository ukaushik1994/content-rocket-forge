
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles, PenLine, CheckCheck, Loader2, Info } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { toast } from 'sonner';

export function AIOutlineGenerator() {
  const { state, dispatch } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords,
    serpSelections,
    contentTitle,
    additionalInstructions
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(additionalInstructions);
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const totalSelectedItems = selectedItems.length;
  
  // Group selected items by type for better organization
  const itemsByType = {
    keyword: selectedItems.filter(item => item.type === 'keyword'),
    question: selectedItems.filter(item => item.type === 'question'),
    entity: selectedItems.filter(item => item.type === 'entity'),
    heading: selectedItems.filter(item => item.type === 'heading'),
    contentGap: selectedItems.filter(item => item.type === 'contentGap'),
    topRank: selectedItems.filter(item => item.type === 'topRank')
  };
  
  // Generate an AI outline based on selections and keywords
  const handleGenerateOutline = async () => {
    if (!mainKeyword) {
      toast.error("Please set a main keyword first");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would call an API to generate the outline
      console.info("AI Generation prompt:", {
        mainKeyword,
        selectedKeywords,
        selectedSerpItems: selectedItems.map(item => ({ type: item.type, content: item.content })),
        customInstructions,
        contentType: "article"
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create an outline based on SERP selections
      const newOutline = [];
      
      // Use headings as primary structure if available
      if (itemsByType.heading.length > 0) {
        itemsByType.heading.forEach(heading => {
          newOutline.push({
            id: uuid(),
            title: heading.content,
            type: 'heading',
            notes: 'From top-ranking content headings'
          });
        });
      }
      
      // Use questions as main sections
      itemsByType.question.forEach(question => {
        newOutline.push({
          id: uuid(),
          title: question.content,
          type: 'question',
          notes: 'Based on commonly asked questions'
        });
      });
      
      // Add content gaps as sections
      itemsByType.contentGap.forEach(gap => {
        newOutline.push({
          id: uuid(),
          title: gap.content,
          notes: gap.source || 'Content opportunity from gap analysis',
          type: 'contentGap'
        });
      });
      
      // If no specific sections are selected, create a standard outline structure
      if (newOutline.length === 0) {
        newOutline.push(
          {
            id: uuid(),
            title: `Introduction to ${mainKeyword}`,
            notes: "Brief overview of the topic and why it's important"
          },
          {
            id: uuid(),
            title: `What is ${mainKeyword}?`,
            notes: "Definition and key concepts"
          },
          {
            id: uuid(),
            title: `Benefits of ${mainKeyword}`,
            notes: "List main advantages and outcomes"
          },
          {
            id: uuid(),
            title: `How to Use ${mainKeyword}`,
            notes: "Step-by-step guide with practical advice"
          },
          {
            id: uuid(),
            title: `Conclusion: Key Takeaways`,
            notes: "Summary of the most important points"
          }
        );
      }
      
      // Add a section for keywords if present
      if (itemsByType.keyword.length > 0) {
        newOutline.push({
          id: uuid(),
          title: "Key Terms & Definitions",
          type: 'keywords',
          notes: 'Define these important terms for your readers',
          relatedKeywords: itemsByType.keyword.map(k => k.content)
        });
      }
      
      // Add a section for entities if present
      if (itemsByType.entity.length > 0) {
        newOutline.push({
          id: uuid(),
          title: "Important Entities & Concepts",
          type: 'entities',
          notes: 'Cover these key topics for comprehensiveness',
          relatedKeywords: itemsByType.entity.map(e => e.content)
        });
      }
      
      // Update the outline in state
      dispatch({ type: 'SET_OUTLINE', payload: newOutline });
      
      // Set a title if none exists
      if (!contentTitle) {
        const suggestedTitle = `Complete Guide to ${mainKeyword}: Everything You Need to Know`;
        dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
      }
      
      // Mark the outline step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
      
      toast.success(`AI outline generated with ${newOutline.length} sections`);
    } catch (error) {
      console.error("Error generating AI outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveInstructions = () => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: customInstructions });
    toast.success("Instructions saved");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* AI Generator Card */}
      <Card className="border-neon-purple/20 bg-gradient-to-br from-indigo-950/20 to-black/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2.5 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">AI Outline Generator</h3>
              <p className="text-sm text-white/70">
                Generate a structured outline based on your research
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Additional Instructions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PenLine className="h-4 w-4 text-neon-purple" /> 
                Additional Instructions (Optional)
              </div>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Include specific topics, tone preferences, or structure requirements..."
                className="min-h-[100px] bg-white/5 border-white/10 focus:border-neon-purple/50"
              />
              <div className="flex justify-end">
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={handleSaveInstructions}
                  className="text-xs border-neon-purple/30 hover:bg-neon-purple/20"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Save Instructions
                </Button>
              </div>
            </div>
            
            {/* Generate Button */}
            <div className="pt-3">
              <Button 
                onClick={handleGenerateOutline}
                disabled={isGenerating || !mainKeyword}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Outline...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Outline {totalSelectedItems > 0 ? `from ${totalSelectedItems} Selected Items` : ''}
                  </>
                )}
              </Button>
              
              {totalSelectedItems === 0 && mainKeyword && (
                <p className="text-xs text-amber-400 mt-2 text-center">
                  No items selected. We'll generate a standard outline based on your keyword.
                </p>
              )}
              
              {!mainKeyword && (
                <p className="text-xs text-amber-400 mt-2 text-center">
                  Please set a main keyword before generating an outline
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Info Card */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-muted-foreground">
              After generating your outline, use the <strong>Next</strong> button at the bottom of the page to proceed to the Content Writing step.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
