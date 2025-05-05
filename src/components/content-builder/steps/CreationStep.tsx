
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, FileEdit, List, Sparkles, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export const CreationStep = () => {
  const { state, dispatch, updateTitle, generateOutline, generateContent } = useContentBuilder();
  const { 
    contentTitle, 
    outline, 
    isGeneratingOutline, 
    content, 
    isGeneratingContent,
    serpSelections, 
    additionalInstructions,
    selectedSolution
  } = state;
  
  const [localTitle, setLocalTitle] = useState(contentTitle);
  const [activeTab, setActiveTab] = useState('outline');
  const [customOutline, setCustomOutline] = useState(outline.join('\n'));
  const [localInstructions, setLocalInstructions] = useState(additionalInstructions);
  
  // Handle saving the title
  const handleSaveTitle = () => {
    if (localTitle.trim()) {
      updateTitle(localTitle);
      toast.success('Title updated successfully');
    }
  };
  
  // Handle outline generation
  const handleGenerateOutline = async () => {
    if (serpSelections.length === 0) {
      toast.warning('Please select items from SERP Analysis first');
      return;
    }
    
    await generateOutline();
    setCustomOutline(outline.join('\n'));
  };
  
  // Handle outline update
  const handleOutlineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomOutline(e.target.value);
    const outlineArray = e.target.value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    
    dispatch({ type: 'SET_OUTLINE', payload: outlineArray });
  };
  
  // Handle content generation
  const handleGenerateContent = async () => {
    if (!contentTitle) {
      toast.warning('Please provide a content title first');
      return;
    }
    
    if (outline.length === 0) {
      toast.warning('Please generate or create an outline first');
      return;
    }
    
    // Update additional instructions before generating
    dispatch({ 
      type: 'SET_ADDITIONAL_INSTRUCTIONS', 
      payload: localInstructions 
    });
    
    await generateContent();
  };
  
  // Handle additional instructions update
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInstructions(e.target.value);
  };
  
  // Render SERP selections summary
  const renderSerpSelectionsSummary = () => {
    const selectionCounts = {
      keyword: serpSelections.filter(s => s.type === 'keyword').length,
      question: serpSelections.filter(s => s.type === 'question').length,
      entity: serpSelections.filter(s => s.type === 'entity').length,
      heading: serpSelections.filter(s => s.type === 'heading').length,
    };
    
    const totalSelections = serpSelections.length;
    
    return (
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
        <CardHeader className="pb-2 border-b border-white/10">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-neon-purple" />
            Selected from SERP Analysis ({totalSelections})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {totalSelections > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectionCounts).map(([type, count]) => (
                  count > 0 && (
                    <div key={type} className="flex justify-between items-center p-2 rounded-md bg-white/5">
                      <span className="text-sm capitalize">{type}s</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10">{count}</span>
                    </div>
                  )
                ))}
              </div>
              
              <div className="mt-4 max-h-[200px] overflow-y-auto space-y-2">
                {serpSelections.slice(0, 5).map((selection, index) => (
                  <div key={index} className="p-2 text-xs border border-white/10 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-neon-blue capitalize">{selection.type}</span>
                      <Check className="h-3 w-3 text-green-400" />
                    </div>
                    <p className="line-clamp-2 text-white/70">{selection.content}</p>
                  </div>
                ))}
                
                {serpSelections.length > 5 && (
                  <p className="text-xs text-center text-white/50">
                    + {serpSelections.length - 5} more items selected
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-white/50">
              <p>No items selected from SERP Analysis</p>
              <p className="text-xs mt-2">Go back to SERP Analysis to select content</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
        <CardHeader className="pb-2 border-b border-white/10">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-neon-blue" />
            Content Title
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Enter a title for your content"
              className="bg-white/5 border-white/10"
            />
            <Button 
              onClick={handleSaveTitle} 
              variant="outline" 
              size="sm"
              className="bg-white/5 border-white/10"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Area - 3 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - SERP Selections Summary */}
        <div className="lg:col-span-3 space-y-4">
          {renderSerpSelectionsSummary()}
        </div>
        
        {/* Middle Column - Outline and Content Editor */}
        <div className="lg:col-span-6 space-y-4">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4 bg-glass">
              <TabsTrigger 
                value="outline"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <List className="h-4 w-4" /> Outline
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4" /> Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="outline" className="space-y-4">
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
                <CardHeader className="pb-2 border-b border-white/10 flex flex-row justify-between items-center">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <List className="h-4 w-4 text-neon-purple" />
                    Content Outline
                  </CardTitle>
                  <Button
                    onClick={handleGenerateOutline}
                    disabled={isGeneratingOutline || serpSelections.length === 0}
                    size="sm"
                    className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-blue hover:to-neon-purple"
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    {isGeneratingOutline ? 'Generating...' : 'Generate Outline'}
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    value={customOutline}
                    onChange={handleOutlineChange}
                    placeholder="Enter your outline here, one item per line"
                    className="min-h-[200px] bg-white/5 border-white/10"
                  />
                  <p className="mt-2 text-xs text-white/50">
                    The outline will guide the structure of your content. Each line represents a section.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="space-y-4">
              <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
                <CardHeader className="pb-2 border-b border-white/10 flex flex-row justify-between items-center">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neon-blue" />
                    Content Editor
                  </CardTitle>
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent || !contentTitle || outline.length === 0}
                    size="sm"
                    className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-blue hover:to-neon-purple"
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <Textarea
                    value={content}
                    onChange={(e) => dispatch({ type: 'SET_CONTENT', payload: e.target.value })}
                    placeholder="Your content will appear here"
                    className="min-h-[300px] bg-white/5 border-white/10"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Column - Additional Instructions and Selected Solution */}
        <div className="lg:col-span-3 space-y-4">
          {/* Additional Instructions */}
          <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
            <CardHeader className="pb-2 border-b border-white/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-neon-purple" />
                Additional Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Textarea
                value={localInstructions}
                onChange={handleInstructionsChange}
                placeholder="Enter additional instructions for the AI writer"
                className="min-h-[150px] bg-white/5 border-white/10"
              />
              <p className="mt-2 text-xs text-white/50">
                These instructions will guide the AI when generating content.
              </p>
            </CardContent>
          </Card>
          
          {/* Selected Solution */}
          <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-xl">
            <CardHeader className="pb-2 border-b border-white/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Selected Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {selectedSolution ? (
                <div>
                  <h3 className="font-medium">{selectedSolution.name}</h3>
                  <p className="text-sm text-white/70 mt-1">
                    The selected solution will be incorporated into the generated content.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/50">
                  No solution selected. You can select a solution from your solutions list.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
