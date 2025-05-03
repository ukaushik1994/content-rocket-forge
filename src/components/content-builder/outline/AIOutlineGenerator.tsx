
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { ContentOutlineSection } from '@/contexts/content-builder/types';
import { v4 as uuid } from 'uuid';

interface OutlineGenerationPrompt {
  mainKeyword: string;
  selectedKeywords: string[];
  solutionName?: string;
  solutionFeatures?: string[];
  customInstructions?: string;
  contentType?: string;
}

interface OutlineSuggestion {
  id: string;
  title: string;
  description: string;
  sections: ContentOutlineSection[];
}

export function AIOutlineGenerator() {
  const { state, dispatch } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords, 
    serpSelections, 
    selectedSolution,
    contentType,
    serpData
  } = state;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<OutlineSuggestion[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  
  const generateOutlineSuggestions = async () => {
    // In a real app, this would call an AI service
    setIsGenerating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Selected SERP elements
      const selectedItems = serpSelections.filter(item => item.selected);
      const selectedQuestions = selectedItems
        .filter(item => item.type === 'question')
        .map(item => item.content);
      
      const selectedKeywordItems = selectedItems
        .filter(item => item.type === 'keyword')
        .map(item => item.content);
      
      // Create generation prompt
      const prompt: OutlineGenerationPrompt = {
        mainKeyword,
        selectedKeywords: [...selectedKeywords, ...selectedKeywordItems],
        customInstructions,
        contentType
      };
      
      // Add solution context if available
      if (selectedSolution) {
        prompt.solutionName = selectedSolution.name;
        prompt.solutionFeatures = selectedSolution.features;
      }
      
      console.log("AI Generation prompt:", prompt);
      
      // Generate mock suggestions (in a real app, this would come from an AI service)
      const mockSuggestions = generateMockOutlines(prompt, selectedQuestions);
      
      setSuggestions(mockSuggestions);
      toast.success("Outline suggestions generated!");
    } catch (error) {
      console.error("Error generating outline suggestions:", error);
      toast.error("Failed to generate outline suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const selectOutlineSuggestion = (suggestionId: string) => {
    const selectedSuggestion = suggestions.find(s => s.id === suggestionId);
    if (!selectedSuggestion) return;
    
    setSelectedSuggestionId(suggestionId);
    
    // Update outline in context
    dispatch({ type: 'SET_OUTLINE', payload: selectedSuggestion.sections });
    
    toast.success("Outline selected! You can now customize it in the editor.");
    
    // Mark step as complete
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 });
  };
  
  // Generate mock outlines for demo purposes
  const generateMockOutlines = (
    prompt: OutlineGenerationPrompt, 
    questions: string[]
  ): OutlineSuggestion[] => {
    // This is a demo function - in a real app, you'd call an AI service
    
    const formatOptions = [
      // Option 1: Problem-Solution Format
      {
        id: uuid(),
        title: `The Ultimate Guide to ${prompt.mainKeyword}`,
        description: "A comprehensive guide focusing on problems and solutions",
        sections: [
          { id: uuid(), title: `Understanding ${prompt.mainKeyword}: A Complete Overview` },
          { id: uuid(), title: "Common Challenges and Pain Points" },
          { id: uuid(), title: "Proven Solutions and Approaches" },
          ...(questions.slice(0, 3).map(q => ({ id: uuid(), title: q }))),
          { id: uuid(), title: "Implementation Strategy" },
          { id: uuid(), title: "Best Practices for Success" }
        ]
      },
      
      // Option 2: How-To Format
      {
        id: uuid(),
        title: `How to Master ${prompt.mainKeyword} in 2025`,
        description: "Step-by-step practical guide with actionable advice",
        sections: [
          { id: uuid(), title: "Introduction: Why Master " + prompt.mainKeyword },
          { id: uuid(), title: "Step 1: Getting Started with the Basics" },
          { id: uuid(), title: "Step 2: Advanced Techniques and Strategies" },
          { id: uuid(), title: "Step 3: Overcoming Common Obstacles" },
          { id: uuid(), title: "Step 4: Measuring Success and Optimization" },
          { id: uuid(), title: "FAQ: Common Questions Answered" },
          { id: uuid(), title: "Conclusion: Your Path Forward" }
        ]
      },
      
      // Option 3: Comparison Format
      {
        id: uuid(),
        title: `${prompt.mainKeyword} Compared: Finding the Best Solution`,
        description: "Comparative analysis focused on helping readers make decisions",
        sections: [
          { id: uuid(), title: "Introduction to " + prompt.mainKeyword },
          { id: uuid(), title: "Evaluation Criteria: What Matters Most" },
          { id: uuid(), title: "Top Options in the Market" },
          { id: uuid(), title: "Head-to-Head Comparisons" },
          { id: uuid(), title: "Use Case Analysis: Which Option is Best for You" },
          { id: uuid(), title: "Expert Recommendations and Final Verdict" }
        ]
      }
    ];
    
    // If a solution is selected, add a solution-specific outline
    if (prompt.solutionName) {
      formatOptions.push({
        id: uuid(),
        title: `${prompt.mainKeyword}: Why ${prompt.solutionName} is the Superior Choice`,
        description: "Solution-focused content highlighting specific benefits",
        sections: [
          { id: uuid(), title: `The State of ${prompt.mainKeyword} Today` },
          { id: uuid(), title: `Introducing ${prompt.solutionName}: A Game-Changing Solution` },
          { id: uuid(), title: "Key Features and Benefits" },
          { id: uuid(), title: "Real-World Success Stories" },
          { id: uuid(), title: "How to Get Started with " + prompt.solutionName },
          { id: uuid(), title: "Conclusion: Transform Your Results with " + prompt.solutionName }
        ]
      });
    }
    
    return formatOptions;
  };
  
  const applyCustomTitle = () => {
    if (!selectedSuggestionId || !customTitle.trim()) return;
    
    const selectedSuggestion = suggestions.find(s => s.id === selectedSuggestionId);
    if (!selectedSuggestion) return;
    
    const updatedSections = [...selectedSuggestion.sections];
    dispatch({ type: 'SET_OUTLINE', payload: updatedSections });
    
    // Set main title
    dispatch({ type: 'SET_CONTENT_TITLE', payload: customTitle });
    
    toast.success("Custom title applied!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Outline Generator</h3>
        
        <Button
          onClick={generateOutlineSuggestions}
          disabled={isGenerating || !mainKeyword}
          className="gap-1.5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Outline Options
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Custom Title (Optional)</Label>
            <div className="flex mt-1 space-x-2">
              <Input 
                id="title"
                value={customTitle} 
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="Enter your preferred title..."
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={applyCustomTitle}
                disabled={!selectedSuggestionId || !customTitle.trim()}
              >
                Apply
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
            <Textarea
              id="custom-instructions"
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="E.g., Focus on beginners, include case studies, etc."
              className="h-[70px] resize-none"
            />
          </div>
        </div>
      </div>
      
      {isGenerating ? (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Generating outline suggestions based on your SERP selections and keywords...
          </p>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Select an outline suggestion:</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <Card 
                key={suggestion.id}
                className={`cursor-pointer transition-all ${selectedSuggestionId === suggestion.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
                onClick={() => selectOutlineSuggestion(suggestion.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-2">{suggestion.title}</h4>
                    {selectedSuggestionId === suggestion.id && (
                      <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                        <ThumbsUp className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  
                  <div className="text-xs">
                    <div className="font-medium mb-1">Sections:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {suggestion.sections.slice(0, 4).map((section, i) => (
                        <li key={i} className="line-clamp-1">{section.title}</li>
                      ))}
                      {suggestion.sections.length > 4 && (
                        <li className="text-muted-foreground">
                          +{suggestion.sections.length - 4} more sections
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                setSuggestions([]);
                setSelectedSuggestionId(null);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Generate New Options
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {mainKeyword ? (
                "Click 'Generate Outline Options' to create AI-powered outline suggestions based on your selected SERP items and keywords."
              ) : (
                "Please enter a main keyword first, then select SERP items to generate outline suggestions."
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
