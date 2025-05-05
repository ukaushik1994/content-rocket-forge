
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AIInstructionsInput } from './AIInstructionsInput';
import { AIGenerateButton } from './AIGenerateButton';
import { AIOutlineInfo } from './AIOutlineInfo';
import { generateOutlineFromSelections } from './outlineGenerationUtils';

export function AIOutlineGenerator() {
  const { state, dispatch, setAdditionalInstructions } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords,
    serpSelections,
    contentTitle,
    additionalInstructions
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [customInstructions, setCustomInstructions] = useState(additionalInstructions || '');
  
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
        selectedSerpItems: selectedItems.map(item => ({ type: item.type, content: item.content })),
        customInstructions,
        contentType: "article"
      });
      
      // Generate outline based on selections
      const newOutline = await generateOutlineFromSelections(
        mainKeyword,
        selectedItems,
        customInstructions
      );
      
      // Convert the outline sections to strings for compatibility
      const outlineStrings = newOutline.map(section => section.title);
      
      // Update the outline in state
      dispatch({ type: 'SET_OUTLINE', payload: outlineStrings });
      
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
    setAdditionalInstructions(customInstructions);
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
            <AIInstructionsInput 
              customInstructions={customInstructions}
              setCustomInstructions={setCustomInstructions}
              onSave={handleSaveInstructions}
            />
            
            {/* Generate Button */}
            <AIGenerateButton
              isGenerating={isGenerating}
              onGenerate={handleGenerateOutline}
              disabled={!mainKeyword}
              totalSelectedItems={totalSelectedItems}
              mainKeyword={mainKeyword}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Info Card */}
      <AIOutlineInfo />
    </motion.div>
  );
}
