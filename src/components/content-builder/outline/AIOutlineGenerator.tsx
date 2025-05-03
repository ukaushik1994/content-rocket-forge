
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sparkles, PenLine, ChevronRight, CheckCheck, Loader2, FileType } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { Badge } from '@/components/ui/badge';
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
        customInstructions,
        contentType: "article"
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a sample outline based on the keyword
      const newOutline = [
        {
          id: uuid(),
          title: `Introduction to ${mainKeyword}`,
          notes: "Brief overview of the topic and why it's important"
        },
        {
          id: uuid(),
          title: `What are ${mainKeyword}?`,
          notes: "Definition and key concepts"
        },
        {
          id: uuid(),
          title: `Benefits of ${mainKeyword}`,
          notes: "List main advantages and business outcomes"
        },
        {
          id: uuid(),
          title: `Top ${mainKeyword} Strategies`,
          notes: "Explore effective approaches and methodologies"
        },
        {
          id: uuid(),
          title: `How to Implement ${mainKeyword}`,
          notes: "Step-by-step guide with practical advice"
        },
        {
          id: uuid(),
          title: `${mainKeyword} Case Studies`,
          notes: "Real-world examples of successful implementation"
        },
        {
          id: uuid(),
          title: `Common Challenges with ${mainKeyword}`,
          notes: "Address potential obstacles and solutions"
        },
        {
          id: uuid(),
          title: `Tools and Resources for ${mainKeyword}`,
          notes: "List of helpful tools and additional resources"
        },
        {
          id: uuid(),
          title: `Conclusion: Future of ${mainKeyword}`,
          notes: "Summary and forward-looking perspective"
        }
      ];
      
      // Update the outline in state
      dispatch({ type: 'SET_OUTLINE', payload: newOutline });
      
      // Set a title if none exists
      if (!contentTitle) {
        const suggestedTitle = `Complete Guide to ${mainKeyword}: Benefits, Strategies, and Implementation`;
        dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
      }
      
      // Mark the outline step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
      
      toast.success("AI outline generated successfully!");
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
      <div className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 border border-white/10 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-r from-neon-purple to-neon-blue p-2.5 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">AI Outline Generator</h3>
            <p className="text-sm text-white/70">
              Let AI create a structured outline based on your keyword research and SERP selections
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="bg-white/10">
                Main Keyword: {mainKeyword || "Not set"}
              </Badge>
              
              {totalSelectedItems > 0 && (
                <Badge variant="secondary" className="bg-white/10">
                  {totalSelectedItems} SERP items selected
                </Badge>
              )}
              
              {selectedKeywords.length > 0 && (
                <Badge variant="secondary" className="bg-white/10">
                  {selectedKeywords.length} keywords
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Card className="bg-white/5 border border-white/10">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <PenLine className="h-4 w-4" /> 
                Additional Instructions (Optional)
              </div>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Include specific topics, tone preferences, or structure requirements..."
                className="min-h-[100px] bg-white/5 border-white/10"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={handleSaveInstructions}
                  className="text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Save Instructions
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
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
                    Generate AI Outline
                  </>
                )}
              </Button>
              
              {!mainKeyword && (
                <p className="text-xs text-amber-400 mt-2 text-center">
                  Please set a main keyword before generating an outline
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white/70">
          <FileType className="h-4 w-4" />
          Alternative: Create outline manually with drag & drop
        </div>
        
        <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_ACTIVE_STEP', payload: 3 })}>
          Switch to Manual Editor <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}
