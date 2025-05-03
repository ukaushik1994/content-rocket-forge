
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentEditor } from '@/components/content/ContentEditor';
import { ContentRepository } from '@/components/content/ContentRepository';
import { SerpKeywordSuggestions } from '@/components/content/SerpKeywordSuggestions';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

// Define step interface
interface ContentStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
}

const ContentPage: React.FC = () => {
  // State for steps and active step
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState<ContentStep[]>([
    { id: 0, name: 'Keywords', description: 'Select your target keywords', completed: false },
    { id: 1, name: 'SERP Analysis', description: 'Analyze search results', completed: false },
    { id: 2, name: 'Content Structure', description: 'Structure your content', completed: false },
    { id: 3, name: 'Write Content', description: 'Create your content', completed: false },
    { id: 4, name: 'Optimize', description: 'Improve SEO score', completed: false },
    { id: 5, name: 'Publish', description: 'Publish and share', completed: false },
  ]);

  // State for content data
  const [content, setContent] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [serpData, setSerpData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainKeyword, setMainKeyword] = useState("");
  const [outline, setOutline] = useState<{ heading: string; content: string }[]>([]);
  const [seoScore, setSeoScore] = useState(0);

  // Calculate progress percentage
  const progressPercentage = 
    (steps.filter(step => step.completed).length / steps.length) * 100;

  // Mark a step as completed
  const markStepCompleted = (stepId: number) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  // Navigate to a specific step
  const navigateToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setActiveStep(step);
    }
  };

  // Handle keyword selection
  const handleKeywordSelect = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
      setMainKeyword(keyword);
      // Mark the keyword step as completed when at least one keyword is selected
      markStepCompleted(0);
    }
  };

  const handleKeywordsSelect = (keywords: string[]) => {
    const newKeywords = keywords.filter(k => !selectedKeywords.includes(k));
    if (newKeywords.length > 0) {
      setSelectedKeywords([...selectedKeywords, ...newKeywords]);
      markStepCompleted(0);
    }
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // If content has some minimum length, mark the writing step as completed
    if (newContent.length > 50) {
      markStepCompleted(3);
    }
  };
  
  // Function to handle adding content from SERP analysis
  const handleAddToContent = (contentToAdd: string, type: string) => {
    setContent(prev => prev + contentToAdd);
    // Mark SERP analysis step as completed when content is added
    markStepCompleted(1);
  };

  // Function to handle adding outline items
  const handleAddOutlineItem = (heading: string) => {
    setOutline([...outline, { heading, content: '' }]);
    // Mark structure step as completed when outline has items
    markStepCompleted(2);
  };

  // Check if can proceed to next step
  const canGoNext = activeStep < steps.length - 1 && steps[activeStep].completed;

  // Render the current step component
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Keywords
        return (
          <div className="space-y-6">
            <SerpKeywordSuggestions 
              onKeywordSelect={handleKeywordSelect}
              onRelatedKeywordsSelect={handleKeywordsSelect}
            />
            
            {selectedKeywords.length > 0 && (
              <div className="bg-glass p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Selected Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map((keyword, index) => (
                    <div 
                      key={index}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-md text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 1: // SERP Analysis
        return (
          <SerpAnalysisPanel 
            serpData={serpData}
            isLoading={isAnalyzing}
            mainKeyword={mainKeyword}
            onAddToContent={handleAddToContent}
          />
        );
      
      case 2: // Content Structure
        return (
          <div className="space-y-6">
            <div className="bg-glass p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Content Structure</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <h4 className="text-sm font-medium">Title</h4>
                  <input 
                    type="text" 
                    className="bg-background border border-white/10 p-2 rounded-md"
                    placeholder="Enter your content title..."
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddOutlineItem("Introduction");
                        handleAddOutlineItem("Conclusion");
                      }
                    }}
                  />
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-medium mb-2">Outline</h4>
                  
                  {outline.length > 0 ? (
                    <div className="space-y-2">
                      {outline.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-background p-2 rounded-md">
                          <span>{item.heading}</span>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => handleAddOutlineItem(`Section ${outline.length + 1}`)}
                      >
                        Add Section
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Start by adding a title to create your outline</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3: // Write Content
        return (
          <ContentEditor 
            content={content}
            onContentChange={handleContentChange}
          />
        );
      
      case 4: // Optimize
        return (
          <div className="space-y-6">
            <div className="bg-glass p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Content Optimization</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>SEO Score</span>
                    <span className="font-medium">{seoScore}/100</span>
                  </div>
                  <Progress value={seoScore} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recommendations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Include main keyword in title</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Add more related keywords</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Increase content length (recommended: 1500+ words)</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  onClick={() => {
                    setSeoScore(78);
                    markStepCompleted(4);
                  }}
                >
                  Optimize Content
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 5: // Publish
        return (
          <div className="space-y-6">
            <div className="bg-glass p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">Publish Content</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Publication Date</h4>
                    <input 
                      type="date" 
                      className="bg-background border border-white/10 p-2 rounded-md w-full"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status</h4>
                    <select className="bg-background border border-white/10 p-2 rounded-md w-full">
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-sm font-medium">Tags</h4>
                    <input 
                      type="text" 
                      className="bg-background border border-white/10 p-2 rounded-md"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue">
                    Publish Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Content Creator | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Creator</h1>
            <div className="space-x-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Publish</Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Content Builder</h2>
              <div className="text-sm text-muted-foreground">
                Step {activeStep + 1} of {steps.length}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="w-full overflow-x-auto">
            <Tabs 
              value={activeStep.toString()} 
              onValueChange={(value) => navigateToStep(parseInt(value))}
              className="w-full"
            >
              <TabsList className="w-full justify-start">
                {steps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id.toString()} 
                    disabled={!step.completed && step.id !== activeStep}
                    className="gap-1.5"
                  >
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                    {step.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Step Content */}
          <div className="bg-glass rounded-lg border border-white/10 p-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-bold">{steps[activeStep].name}</h3>
              <p className="text-muted-foreground">{steps[activeStep].description}</p>
            </div>
            
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigateToStep(activeStep - 1)}
              disabled={activeStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={() => navigateToStep(activeStep + 1)}
              disabled={!canGoNext}
              className={`gap-1 ${canGoNext ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''}`}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentPage;
