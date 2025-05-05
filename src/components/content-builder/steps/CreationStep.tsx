
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContentTitleCard } from '../outline/ContentTitleCard';
import { SelectedSerpItemsCard } from '../outline/SelectedSerpItemsCard';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { ContentEditor } from '@/components/content/ContentEditor';
import { ContentSidebar } from './writing/ContentSidebar';
import { Sparkles, Edit, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { generateDemoContent } from './writing/contentGenerationUtils';

export const CreationStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    mainKeyword, 
    outline, 
    content, 
    additionalInstructions, 
    selectedSolution,
    contentTitle,
    serpSelections
  } = state;
  
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showOutline, setShowOutline] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('outline');
  const [expandedSections, setExpandedSections] = React.useState({
    serpItems: true,
    outline: true,
    content: true,
    instructions: true
  });

  // Mark this step as complete when we have content
  useEffect(() => {
    if (content && content.trim().length > 100) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 3 }); // Using outline step ID (3)
    }
  }, [content, dispatch]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
  };

  // Handle toggling section visibility
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle generating content
  const handleGenerateContent = async () => {
    if (outline.length === 0) {
      toast.error("Please generate an outline first");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Convert outline to ContentOutlineSection[] if it's a string[]
      const processedOutline = Array.isArray(outline) 
        ? outline.map(item => {
            if (typeof item === 'string') {
              return { id: Math.random().toString(), title: item };
            }
            return item;
          })
        : [];
      
      // Generate demo content
      const generatedContent = generateDemoContent(contentTitle, mainKeyword, processedOutline, selectedSolution);
      
      dispatch({ type: 'SET_CONTENT', payload: generatedContent });
      toast.success('Content generated successfully');
      
      // Switch to content tab
      setActiveTab('content');
      
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle instructions change
  const handleInstructionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_ADDITIONAL_INSTRUCTIONS', payload: e.target.value });
  };
  
  // Get total number of selected SERP items
  const totalSelectedItems = serpSelections.filter(item => item.selected).length;

  return (
    <div className="space-y-6">
      <motion.div 
        className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Content Creation</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Outline your content and write your article with AI assistance
          </p>
        </div>
      </motion.div>

      {/* Content Title Card */}
      <ContentTitleCard />

      {/* Main 3-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - SERP Selections (Condensed) */}
        <div className="lg:col-span-1">
          <Card className="border border-white/10 bg-gradient-to-br from-blue-900/20 to-purple-900/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded-full">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  SERP Selections
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => toggleSection('serpItems')}
                >
                  {expandedSections.serpItems ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {expandedSections.serpItems && (
                <div className="text-xs text-muted-foreground">
                  {totalSelectedItems > 0 ? (
                    <p>{totalSelectedItems} items selected from SERP analysis</p>
                  ) : (
                    <p>No items selected from SERP analysis</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Show the condensed version of selected SERP items */}
          {expandedSections.serpItems && <SelectedSerpItemsCard condensed={true} />}
          
          {/* Instructions and Solutions */}
          <div className="mt-6">
            <ContentSidebar
              outline={Array.isArray(outline) 
                ? outline.map(item => {
                    if (typeof item === 'string') {
                      return { id: Math.random().toString(), title: item };
                    }
                    return item;
                  })
                : []}
              selectedSolution={selectedSolution}
              additionalInstructions={additionalInstructions}
              handleInstructionsChange={handleInstructionsChange}
              condensed={true}
            />
          </div>
        </div>
        
        {/* Middle and Right Columns - Outline and Content Editor */}
        <div className="lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="outline" className="space-y-6 mt-0">
              {/* AI Outline Generator */}
              <AIOutlineGenerator />
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6 mt-0">
              {/* Content Generation Button */}
              {(!content || content.trim().length === 0) && (
                <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
                  <CardContent className="pt-6 flex flex-col items-center justify-center p-8 text-center">
                    <Sparkles className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">Generate Content</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create content based on your outline with AI assistance
                    </p>
                    <Button 
                      onClick={handleGenerateContent}
                      disabled={isGenerating || outline.length === 0}
                      className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300"
                    >
                      {isGenerating ? (
                        <>Generating... <Sparkles className="ml-2 h-4 w-4 animate-pulse" /></>
                      ) : (
                        <>Generate Content <Sparkles className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Content Editor */}
              {content && content.trim().length > 0 && (
                <ContentEditor
                  content={content}
                  onContentChange={handleContentChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
