
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AIInstructionsInput } from './AIInstructionsInput';
import { AIGenerateButton } from './AIGenerateButton';
import { AIOutlineInfo } from './AIOutlineInfo';
import { generateOutlineFromSelections } from './outlineGenerationUtils';
import { sendChatRequest } from '@/services/aiService';

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
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  
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
      
      // Create a detailed prompt for the AI
      const selectedItemsText = selectedItems.map(item => 
        `${item.type.toUpperCase()}: ${item.content}`
      ).join('\n\n');
      
      const keywordsText = selectedKeywords.join(', ');
      
      const prompt = `
      Create a detailed content outline for an article about "${mainKeyword}".
      
      Primary keyword: ${mainKeyword}
      Secondary keywords: ${keywordsText}
      
      I've researched the topic and gathered these key points:
      ${selectedItemsText}
      
      ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
      
      Please generate a well-structured outline with these requirements:
      1. Include at least 5-7 main sections with descriptive headings
      2. Format the outline with clear hierarchy
      3. Focus on covering the topic comprehensively
      4. Ensure all selected keywords are addressed
      5. Optimize for search intent and reader value
      
      Return ONLY the outline in this exact format:
      1. [First Section Title]
      2. [Second Section Title]
      3. [Third Section Title]
      (and so on)
      `;
      
      // In a real implementation, this would call an API to generate the outline
      console.info("AI Generation prompt:", prompt);
      
      // First try using our AI API integration
      const chatResponse = await sendChatRequest(aiProvider, {
        messages: [
          { role: 'system', content: 'You are an expert content outline creator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });
      
      let outlineText: string;
      
      if (chatResponse?.choices?.[0]?.message?.content) {
        // Use the AI-generated outline
        outlineText = chatResponse.choices[0].message.content;
      } else {
        // Fall back to utility function if AI response fails
        console.warn('Falling back to local outline generation due to API failure');
        const newOutline = await generateOutlineFromSelections(
          mainKeyword,
          selectedItems,
          customInstructions
        );
        
        // Convert the outline sections to strings
        outlineText = newOutline.map((section, i) => `${i+1}. ${section.title}`).join('\n');
      }
      
      // Parse the outline into an array of strings (one per line)
      const outlineArray = outlineText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\.\s/) || line.match(/^[IVX]+\.\s/)) // Only include numbered lines
        .map(line => line.replace(/^\d+\.\s/, '').replace(/^[IVX]+\.\s/, '')); // Remove numbering
      
      // Update the outline in state
      dispatch({ type: 'SET_OUTLINE', payload: outlineArray });
      
      // Set a title if none exists
      if (!contentTitle) {
        const suggestedTitle = `Complete Guide to ${mainKeyword}: Everything You Need to Know`;
        dispatch({ type: 'SET_CONTENT_TITLE', payload: suggestedTitle });
      }
      
      // Mark the outline step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
      
      toast.success(`AI outline generated with ${outlineArray.length} sections`);
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
            {/* AI Provider Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">AI Provider:</span>
              <div className="flex items-center gap-1">
                {['openai', 'anthropic', 'gemini'].map((provider) => (
                  <button
                    key={provider}
                    className={`px-3 py-1 text-xs rounded-full ${
                      aiProvider === provider 
                        ? 'bg-neon-purple text-white' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    onClick={() => setAiProvider(provider as 'openai' | 'anthropic' | 'gemini')}
                  >
                    {provider === 'openai' ? 'OpenAI' : 
                     provider === 'anthropic' ? 'Claude' : 'Gemini'}
                  </button>
                ))}
              </div>
            </div>
            
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
