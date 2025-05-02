
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  LayoutTemplate, 
  FileText, 
  Eye, 
  Settings, 
  Play, 
  Pencil, 
  Plus, 
  Info,
  HelpCircle,
  BarChart3,
  ArrowRight,
  Search,
  Check,
  Database,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SerpAnalysisPanel } from './SerpAnalysisPanel';
import { SerpKeywordSuggestions } from './SerpKeywordSuggestions';
import { analyzeKeywordSerp } from '@/services/serpApiService';

// Define Solution type
interface Solution {
  id: string;
  name: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
}

interface ContentEditorProps {
  onContentUpdate?: (data: { 
    title?: string; 
    content?: string;
    keywords?: string[];
    seoScore?: number;
  }) => void;
  initialContent?: string;
  initialTitle?: string;
  initialKeywords?: string[];
}

export function ContentEditor({
  onContentUpdate,
  initialContent = '',
  initialTitle = '',
  initialKeywords = []
}: ContentEditorProps) {
  const [editorContent, setEditorContent] = useState(initialContent || '# Best Project Management Software for Remote Teams in 2024\n\nRemote work is here to stay, but managing dispersed teams comes with unique challenges. According to recent studies, 67% of remote teams struggle with task visibility and coordination.\n\n## Top Project Management Tools for 2024\n\n### 1. TaskMaster Pro\n- **Key Features:** Gantt charts, AI analytics, real-time collaboration\n- **Best For:** Enterprise teams with complex workflows\n- **Pricing:** Starts at $29/mo per user');

  const [contentTitle, setContentTitle] = useState(initialTitle || '');
  const [seoScore, setSeoScore] = useState(78);
  const [currentStep, setCurrentStep] = useState(0);
  const [serpData, setSerpData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([]);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const [mainKeyword, setMainKeyword] = useState("best project management software");
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>(initialKeywords || []);
  const [contentSections, setContentSections] = useState<{ title: string; complete: boolean; description: string }[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  
  // Monitor editor content changes and update parent component
  useEffect(() => {
    if (onContentUpdate) {
      onContentUpdate({
        title: contentTitle,
        content: editorContent,
        keywords: relatedKeywords,
        seoScore
      });
    }
  }, [contentTitle, editorContent, relatedKeywords, seoScore, onContentUpdate]);
  
  // Update title based on H1 heading in the markdown when content changes
  useEffect(() => {
    // Extract H1 heading from the markdown if no title is set yet
    if (!contentTitle && editorContent) {
      const h1Match = editorContent.match(/^#\s+(.+)$/m);
      if (h1Match && h1Match[1]) {
        setContentTitle(h1Match[1]);
      }
    }
  }, [editorContent, contentTitle]);
  
  // Fetch the available solutions when the component mounts
  useEffect(() => {
    const fetchSolutions = async () => {
      setIsLoadingSolutions(true);
      try {
        // In a real implementation, this would fetch from the database
        // For now, we'll use mock data
        setTimeout(() => {
          setAvailableSolutions([
            {
              id: '1',
              name: 'TaskMaster Pro',
              features: ["Gantt charts", "Team collaboration", "AI analytics"],
              useCases: ["Remote teams", "Agile workflows"],
              painPoints: ["Missed deadlines", "Poor task visibility"],
              targetAudience: ["Project managers", "IT teams"],
            },
            {
              id: '2',
              name: 'EmailPro Marketing',
              features: ["Drip campaigns", "A/B testing", "Audience segmentation"],
              useCases: ["Newsletter management", "Customer retention"],
              painPoints: ["Low open rates", "Poor deliverability"],
              targetAudience: ["Marketers", "Small businesses"],
            },
            {
              id: '3',
              name: 'SalesForce CRM+',
              features: ["Pipeline management", "Lead scoring", "Analytics dashboard"],
              useCases: ["Sales teams", "Account management"],
              painPoints: ["Lost leads", "Disorganized contacts"],
              targetAudience: ["Sales representatives", "Account managers"],
            }
          ]);
          setIsLoadingSolutions(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching solutions:', error);
        setIsLoadingSolutions(false);
        toast.error("Failed to load solutions. Please try again later.");
      }
    };

    fetchSolutions();
  }, []);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    
    // Simulate SEO score changing based on content length
    const newScore = Math.min(100, Math.max(0, 
      50 + (e.target.value.length / 100) + Math.random() * 10
    ));
    setSeoScore(Math.floor(newScore));
  };

  // Handle keyword selection from SerpKeywordSuggestions
  const handleKeywordSelect = (keyword: string) => {
    setMainKeyword(keyword);
    setContentTitle(`Best ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} for 2025`);
    
    // Generate meta tags based on keyword
    setMetaTitle(`Top 10 ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} – 2025 Expert Picks`);
    setMetaDescription(`Discover the best ${keyword} in 2025, with detailed comparisons of features, pricing, and real user reviews.`);
    setUrlSlug(`best-${keyword.toLowerCase().replace(/\s+/g, '-')}-2025`);
  };

  // Handle related keywords selection
  const handleRelatedKeywordsSelect = (keywords: string[]) => {
    setRelatedKeywords(keywords);
  };

  // Updated steps with keyword research first, then solution selection
  const steps = [
    { name: "Keyword Research", icon: <Search className="h-5 w-5" /> },
    { name: "Select Solution", icon: <Briefcase className="h-5 w-5" /> },
    { name: "SERP Analysis", icon: <Database className="h-5 w-5" /> },
    { name: "Content Structure", icon: <LayoutTemplate className="h-5 w-5" /> },
    { name: "Content Writing", icon: <Pencil className="h-5 w-5" /> },
    { name: "SEO Optimization", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Publish", icon: <BookOpen className="h-5 w-5" /> },
  ];

  const fetchSerpData = async () => {
    setIsLoading(true);
    
    try {
      const result = await analyzeKeywordSerp(mainKeyword);
      setSerpData(result);
      
      // Create content sections based on the SERP data
      const recommendedSections = [
        { 
          title: "Introduction", 
          complete: true, 
          description: "Include primary keyword, define the problem" 
        },
        { 
          title: selectedSolution 
            ? `Top Alternatives to ${selectedSolution.name}` 
            : "Top 10 Options", 
          complete: true, 
          description: "List the best options with key features" 
        },
        { 
          title: "Features Comparison", 
          complete: false, 
          description: "Create a table comparing top features" 
        },
        { 
          title: "Use Case Examples", 
          complete: false, 
          description: "Real-world examples from different industries" 
        },
        { 
          title: "Pricing Analysis", 
          complete: false, 
          description: "Compare pricing tiers and value" 
        },
        { 
          title: "FAQ Section", 
          complete: false, 
          description: "Answer common questions from SERP" 
        },
        { 
          title: "Conclusion", 
          complete: false, 
          description: "Summarize findings with final recommendation" 
        },
      ];
      
      setContentSections(recommendedSections);
      toast.success("SERP analysis complete!");
    } catch (error) {
      console.error("Error fetching SERP data:", error);
      toast.error("Failed to analyze SERP data. Using fallback data.");
      
      // Use fallback data
      setSerpData({
        avgWordCount: 2500,
        commonH1Pattern: "[Number] Best [Keyword] for [Target] in [Year]",
        commonSections: ["Introduction", "Top Products", "Comparison Table", "Features", "Pricing", "FAQ"],
        peopleAlsoAsk: [
          "What is the easiest project management tool for beginners?",
          "Which project management software is best for remote teams?",
          "Is there a free project management tool?",
          "How much does project management software cost?",
          "What's better than Asana for project management?"
        ],
        serpFeatures: ["Featured Snippet", "Reviews Rich Snippet", "People Also Ask"],
        topResults: [
          { title: "10 Best Project Management Tools in 2024", domain: "example.com", wordCount: 2650 },
          { title: "Top Project Management Software for Remote Teams", domain: "competitor.com", wordCount: 2300 },
        ]
      });
      
      // Create default content sections
      setContentSections([
        { title: "Introduction", complete: true, description: "Include primary keyword, define the problem" },
        { title: "Top 10 Options", complete: true, description: "List the best options with key features" },
        { title: "Features Comparison", complete: false, description: "Create a table comparing top features" },
        { title: "Use Case Examples", complete: false, description: "Real-world examples from different industries" },
        { title: "Pricing Analysis", complete: false, description: "Compare pricing tiers and value" },
        { title: "FAQ Section", complete: false, description: "Answer common questions from SERP" },
        { title: "Conclusion", complete: false, description: "Summarize findings with final recommendation" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContentOutline = () => {
    // Generate a content outline based on the current data
    const outline = `# ${contentTitle || `Best ${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} for 2025`}

## Introduction
${mainKeyword} is essential for modern businesses looking to optimize their operations. According to recent studies, organizations using the right tools see a 30% increase in productivity.

## Top ${selectedSolution ? `Alternatives to ${selectedSolution.name}` : 'Solutions'} in 2025

${contentSections.slice(1, 4).map((section, index) => 
`### ${index + 1}. Solution Name
- **Key Features:** Feature 1, Feature 2, Feature 3
- **Best For:** ${selectedSolution?.targetAudience[0] || 'Small teams'}
- **Pricing:** Starts at $X/mo per user

`).join('')}
## Features Comparison

| Feature | Solution 1 | Solution 2 | Solution 3 |
|---------|------------|------------|------------|
| Feature 1 | ✅ | ✅ | ❌ |
| Feature 2 | ✅ | ❌ | ✅ |
| Feature 3 | ❌ | ✅ | ✅ |

## FAQ

${(serpData?.peopleAlsoAsk || []).slice(0, 3).map((question: string) => 
`### ${question}
Answer goes here.

`).join('')}

## Conclusion
Based on our analysis, the best ${mainKeyword} for most users is Solution 1, followed closely by Solution 2 for more specialized needs.
`;

    setEditorContent(outline);
    toast.success("Content outline generated!");
  };

  const getStepContent = () => {
    switch(currentStep) {
      case 0: // Keyword Research step
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Keyword Research</h3>
            
            <SerpKeywordSuggestions 
              onKeywordSelect={handleKeywordSelect}
              onRelatedKeywordsSelect={handleRelatedKeywordsSelect}
              className="mb-6"
            />
            
            {mainKeyword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-panel">
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="text-lg font-medium">Primary Keyword</h4>
                    <div className="space-y-2">
                      <div className="w-full bg-glass border border-white/10 p-3 rounded-md">
                        {mainKeyword}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Search Volume: 12,000</span>
                        <span>Keyword Difficulty: Medium</span>
                      </div>
                    </div>
                    
                    {relatedKeywords.length > 0 && (
                      <div className="space-y-2 pt-4">
                        <h5 className="font-medium">Selected Keywords</h5>
                        <div className="flex flex-wrap gap-2">
                          {relatedKeywords.map((kw, i) => (
                            <Badge key={i} className="bg-primary/20 text-primary border border-primary/30">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="glass-panel">
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="text-lg font-medium">Content Title</h4>
                    <div className="space-y-2">
                      <Input
                        value={contentTitle}
                        onChange={(e) => setContentTitle(e.target.value)}
                        placeholder="Enter content title..."
                        className="bg-glass border border-white/10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your title should include your primary keyword and be compelling
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <h5 className="font-medium mb-2">Keyword Clusters</h5>
                      <div className="space-y-4">
                        <div className="border border-white/10 rounded-md p-3 space-y-2">
                          <h5 className="font-medium text-primary">Features Cluster</h5>
                          <div className="flex flex-wrap gap-2">
                            {["gantt charts", "time tracking", "task dependencies", "collaboration features"].map((term, i) => (
                              <Badge key={i} variant="outline" className="border-primary/30">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border border-white/10 rounded-md p-3 space-y-2">
                          <h5 className="font-medium text-neon-blue">Pain Points Cluster</h5>
                          <div className="flex flex-wrap gap-2">
                            {["free project management", "affordable PM tools", "project management pricing", "cost comparison"].map((term, i) => (
                              <Badge key={i} variant="outline" className="border-neon-blue/30">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
                onClick={() => setCurrentStep(1)}
                disabled={!mainKeyword} // Disable if no keyword has been entered
              >
                Select Solution
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 1: // Solution selection step
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Select a Solution</h3>
            <p className="text-muted-foreground">Choose the business solution you want to create content for</p>
            
            {isLoadingSolutions ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading your solutions...</p>
              </div>
            ) : availableSolutions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">You don't have any solutions yet. Create one in the Solutions section first.</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-neon-purple to-neon-blue" 
                  onClick={() => window.location.href = '/solutions'}
                >
                  Create a Solution
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <RadioGroup 
                  value={selectedSolution?.id || ""} 
                  onValueChange={(value) => {
                    const solution = availableSolutions.find(s => s.id === value);
                    setSelectedSolution(solution || null);
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableSolutions.map((solution) => (
                      <div key={solution.id} className="relative">
                        <RadioGroupItem 
                          value={solution.id} 
                          id={`solution-${solution.id}`} 
                          className="peer sr-only" 
                        />
                        <Label
                          htmlFor={`solution-${solution.id}`}
                          className="flex flex-col border rounded-lg p-4 cursor-pointer bg-glass hover:bg-card peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary"
                        >
                          <div className="font-semibold text-gradient">{solution.name}</div>
                          {solution.features.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">Features:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {solution.features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="border-neon-purple/30">
                                    {feature}
                                  </Badge>
                                ))}
                                {solution.features.length > 3 && (
                                  <Badge variant="outline">+{solution.features.length - 3}</Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Target:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {solution.targetAudience.map((audience, idx) => (
                                <Badge key={idx} variant="secondary" className="bg-secondary/60">
                                  {audience}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-neon-purple to-neon-blue"
                    onClick={() => {
                      setCurrentStep(2);
                      fetchSerpData();
                    }}
                    disabled={!selectedSolution}
                  >
                    Analyze SERP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 2: // SERP Analysis Step
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">SERP Analysis</h3>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Analyzing search results...</p>
              </div>
            ) : !serpData ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Search className="h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No SERP data available. Start the analysis.</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-neon-purple to-neon-blue"
                  onClick={fetchSerpData}
                >
                  Analyze SERP
                </Button>
              </div>
            ) : (
              <SerpAnalysisPanel 
                serpData={serpData}
                isLoading={isLoading}
                mainKeyword={mainKeyword}
                onAddToContent={(content, type) => {
                  setEditorContent(editorContent + '\n\n' + content);
                  toast.success(`Added ${type} to your content`);
                }}
              />
            )}
            
            <div className="flex justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
                onClick={() => setCurrentStep(3)}
                disabled={!serpData && !isLoading}
              >
                Plan Content Structure
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 3: // Content Structure
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Content Structure</h3>
            
            <Card className="glass-panel">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">Recommended Structure</h4>
                  <Button 
                    onClick={generateContentOutline}
                    className="bg-gradient-to-r from-neon-purple to-neon-blue"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate Outline
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {contentSections.map((section, index) => (
                    <div 
                      key={index}
                      className={`flex items-start p-3 rounded-md border ${section.complete ? 'border-primary/30 bg-primary/5' : 'border-white/10'}`}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${section.complete ? 'bg-primary text-white' : 'border border-white/30'}`}>
                        {section.complete ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{section.title}</h5>
                          {section.complete && (
                            <Badge className="bg-primary/20 text-primary">Complete</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 border-t pt-4 border-white/10">
                  <h5 className="font-medium mb-3">Content Goals</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Word Count Target</span>
                      <span className="font-medium">{serpData?.avgWordCount || 2500} words</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sections</span>
                      <span className="font-medium">{contentSections.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target Keywords</span>
                      <span className="font-medium">{1 + relatedKeywords.length} keywords</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Keyword Density</span>
                      <span className="font-medium text-green-400">1.2-2.0%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
                onClick={() => setCurrentStep(4)}
              >
                Write Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 4: // Content Writing
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Content Writing</h3>
            
            <div className="flex items-center justify-end mb-4">
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                onClick={generateContentOutline}
              >
                <Play className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
            </div>
            
            <Card className="glass-panel flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue="edit" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="edit" className="flex items-center gap-1">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="suggestions" className="flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Suggestions
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="edit" className="flex-1 flex flex-col p-0 m-0">
                  <Textarea
                    className="flex-1 resize-none border-0 rounded-none focus-visible:ring-0 bg-transparent p-4"
                    value={editorContent}
                    onChange={handleContentChange}
                    placeholder="Start writing or use the generator..."
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="p-8 m-0 h-full overflow-auto">
                  <div className="prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-4">{contentTitle || (selectedSolution 
                      ? `Best ${selectedSolution.name} Alternatives for ${selectedSolution.targetAudience[0] || 'Teams'} in 2025`
                      : 'Best Project Management Software for Remote Teams in 2025')
                    }</h1>
                    <p className="mb-4">Remote work is here to stay, but managing dispersed teams comes with unique challenges. According to recent studies, 67% of remote teams struggle with task visibility and coordination.</p>
                    <h2 className="text-2xl font-bold mb-3">Top Project Management Tools for 2025</h2>
                    <h3 className="text-xl font-bold mb-2">1. TaskMaster Pro</h3>
                    <ul className="list-disc ml-6 mb-4">
                      <li><strong>Key Features:</strong> Gantt charts, AI analytics, real-time collaboration</li>
                      <li><strong>Best For:</strong> Enterprise teams with complex workflows</li>
                      <li><strong>Pricing:</strong> Starts at $29/mo per user</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="suggestions" className="p-4 m-0 h-full overflow-auto">
                  <div className="space-y-4">
                    <h4 className="font-medium">AI Content Suggestions</h4>
                    
                    <div className="space-y-3">
                      <div className="p-3 border border-neon-blue/30 bg-neon-blue/5 rounded-md">
                        <h5 className="font-medium text-neon-blue">Introduction Improvement</h5>
                        <p className="text-sm mt-1">
                          Try adding more specific statistics: "A 2023 McKinsey study found that 78% of remote teams cite visibility as their #1 challenge."
                        </p>
                      </div>
                      
                      <div className="p-3 border border-green-500/30 bg-green-500/5 rounded-md">
                        <h5 className="font-medium text-green-500">Competitor Pattern</h5>
                        <p className="text-sm mt-1">
                          Top-ranking content includes comparison tables with pricing, features, and user ratings in a easy-to-scan format.
                        </p>
                      </div>
                      
                      <div className="p-3 border border-neon-purple/30 bg-neon-purple/5 rounded-md">
                        <h5 className="font-medium text-neon-purple">FAQ Opportunity</h5>
                        <p className="text-sm mt-1">
                          Adding the "People Also Ask" questions from SERP with concise answers can help gain featured snippets.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
            
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
                onClick={() => setCurrentStep(5)}
              >
                Optimize SEO
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 5: // SEO Optimization
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">SEO Optimization</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-panel">
                <CardContent className="pt-6 space-y-4">
                  <h4 className="text-lg font-medium">On-Page SEO</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Meta Title</h5>
                      <input 
                        type="text" 
                        className="w-full bg-glass border border-white/10 p-2 rounded-md" 
                        placeholder="Enter meta title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">60 characters maximum</p>
                        <p className="text-xs">{metaTitle.length}/60</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Meta Description</h5>
                      <textarea 
                        className="w-full bg-glass border border-white/10 p-2 rounded-md resize-none h-20" 
                        placeholder="Enter meta description"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                      />
                      <div className="flex justify-between">
                        <p className="text-xs text-muted-foreground">160 characters maximum</p>
                        <p className="text-xs">{metaDescription.length}/160</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">URL Slug</h5>
                      <input 
                        type="text" 
                        className="w-full bg-glass border border-white/10 p-2 rounded-md" 
                        placeholder="Enter URL slug"
                        value={urlSlug}
                        onChange={(e) => setUrlSlug(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">SEO Score</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2 rounded-lg">
                            <Progress 
                              value={seoScore} 
                              className={cn(
                                "w-32 h-2", 
                                seoScore > 70 ? "bg-secondary [&>div]:bg-green-500" : 
                                seoScore > 50 ? "bg-secondary [&>div]:bg-yellow-500" : 
                                "bg-secondary [&>div]:bg-red-500"
                              )}
                            />
                            <Badge className={cn(
                              seoScore > 70 ? 'bg-green-500' : seoScore > 50 ? 'bg-yellow-500' : 'bg-red-500'
                            )}>
                              {seoScore}/100
                            </Badge>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your content's overall optimization score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Keyword Density</h5>
                        <Badge className="bg-green-500/20 text-green-500">
                          1.2% (Good)
                        </Badge>
                      </div>
                      <Progress value={90} className="h-1" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Readability</h5>
                        <Badge className="bg-green-500/20 text-green-500">
                          Grade 8 (Good)
                        </Badge>
                      </div>
                      <Progress value={85} className="h-1" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Content Length</h5>
                        <Badge className={editorContent.length > 1500 ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                          {editorContent.length} chars ({editorContent.length > 1500 ? 'Good' : 'Needs more'})
                        </Badge>
                      </div>
                      <Progress value={Math.min(100, (editorContent.length / 2500) * 100)} className="h-1" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Keywords Used</h5>
                        <Badge className={relatedKeywords.length > 2 ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                          {relatedKeywords.length} keywords
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className="bg-primary/20 text-primary border border-primary/30">
                          {mainKeyword}
                        </Badge>
                        {relatedKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="border-primary/30">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(4)}>
                Back
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue"
                onClick={() => setCurrentStep(6)}
              >
                Finalize & Publish
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 6: // Publish
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium">Publish Content</h3>
            
            <Card className="glass-panel">
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-6">
                  <div className="h-20 w-20 bg-gradient-to-br from-neon-purple to-neon-blue rounded-full mx-auto flex items-center justify-center">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold">Ready to Publish</h4>
                    <p className="text-muted-foreground">Your optimized content is ready to go live!</p>
                  </div>
                  
                  <div className="bg-glass border border-white/10 rounded-lg p-4 max-w-lg mx-auto">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Title:</span>
                      <span>{contentTitle || (selectedSolution 
                        ? `Best ${selectedSolution.name} Alternatives for ${selectedSolution.targetAudience[0] || 'Teams'} in 2025`
                        : 'Best Project Management Software for Remote Teams in 2025')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Solution:</span>
                      <span>{selectedSolution ? selectedSolution.name : 'None selected'}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">URL:</span>
                      <span>{urlSlug || 'best-project-management-software-2025'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SEO Score:</span>
                      <span className="text-green-500 font-medium">{seoScore}/100</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-muted-foreground">Keywords:</span>
                      <span>{mainKeyword} + {relatedKeywords.length} more</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button variant="outline">
                      Save as Draft
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-neon-purple to-neon-blue px-8"
                      onClick={() => {
                        if (onContentUpdate) {
                          onContentUpdate({
                            title: contentTitle,
                            content: editorContent,
                            keywords: [mainKeyword, ...relatedKeywords],
                            seoScore: seoScore
                          });
                        }
                        toast.success("Content ready to publish!");
                      }}
                    >
                      Publish Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setCurrentStep(5)}>
                Back to Optimization
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
      <div className="flex flex-wrap items-center justify-between">
        <h2 className="text-2xl font-bold">Content Builder</h2>
      </div>
      
      <div className="flex items-center justify-between bg-glass rounded-lg p-3 mb-2">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <div className={`h-px w-4 ${index <= currentStep ? 'bg-primary' : 'bg-white/10'}`}></div>
              )}
              <div 
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all ${index === currentStep ? 'bg-primary/20 text-primary' : index < currentStep ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => index <= currentStep && setCurrentStep(index)}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${index === currentStep ? 'bg-primary text-white' : index < currentStep ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                  {index < currentStep ? <Check className="h-3 w-3" /> : step.icon}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.name}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 flex-1 overflow-y-auto">
        {getStepContent()}
      </div>
    </div>
  );
}
