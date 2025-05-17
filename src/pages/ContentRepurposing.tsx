
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, Download, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const ContentRepurposing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getContentItem, addContentItem } = useContent();
  
  const [content, setContent] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('transform');
  
  // Available content formats for repurposing
  const contentFormats = [
    { id: 'social-twitter', name: 'Twitter/X Post', description: 'Short posts with max 280 characters' },
    { id: 'social-linkedin', name: 'LinkedIn Post', description: 'Professional content optimized for LinkedIn' },
    { id: 'social-facebook', name: 'Facebook Post', description: 'Engaging social content for Facebook' },
    { id: 'email-newsletter', name: 'Email Newsletter', description: 'Email-friendly version for newsletters' },
    { id: 'blog-post', name: 'Blog Post', description: 'Longer format optimized for blogs' },
    { id: 'video-script', name: 'Video Script', description: 'Script formatted for video production' },
    { id: 'podcast-script', name: 'Podcast Script', description: 'Audio-friendly script for podcasts' },
    { id: 'infographic', name: 'Infographic Content', description: 'Visual-friendly bullet points' }
  ];
  
  // Load content when component mounts
  useEffect(() => {
    const contentId = new URLSearchParams(location.search).get('id');
    if (contentId) {
      const contentItem = getContentItem(contentId);
      if (contentItem) {
        console.log('Loaded content for repurposing:', contentItem.title);
        setContent(contentItem);
      } else {
        toast.error('Content not found');
        navigate('/drafts');
      }
    } else {
      toast.error('No content ID provided');
      navigate('/drafts');
    }
  }, [location, getContentItem, navigate]);
  
  const handleGenerateContent = async () => {
    if (!selectedFormat) {
      toast.error('Please select a content format');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI service to transform the content
      // For now, we'll simulate a delay and return a mock transformation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const formatInfo = contentFormats.find(f => f.id === selectedFormat);
      
      let mockContent = '';
      
      if (selectedFormat.startsWith('social')) {
        mockContent = `${content.title}\n\n${content.content.substring(0, 200)}...\n\n#ContentRepurposed #${formatInfo?.name.replace(/\s+/g, '')}`;
      } else if (selectedFormat === 'email-newsletter') {
        mockContent = `Subject: ${content.title}\n\nHello,\n\nI hope this email finds you well. Here's our latest content:\n\n${content.content.substring(0, 300)}...\n\nRead more on our website.\n\nBest regards,\nThe Team`;
      } else if (selectedFormat.includes('script')) {
        mockContent = `TITLE: ${content.title.toUpperCase()}\n\nINTRO:\n[Greeting and introduction]\n\nMAIN CONTENT:\n${content.content.substring(0, 400)}...\n\nCLOSING:\n[Call to action and sign off]`;
      } else {
        mockContent = `# ${content.title}\n\n${content.content}\n\n## Key Points\n- Point 1\n- Point 2\n- Point 3\n\n## Conclusion\nRepurposed for ${formatInfo?.name}.`;
      }
      
      setGeneratedContent(mockContent);
      toast.success(`Generated ${formatInfo?.name} content`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveAsDraft = async () => {
    if (!generatedContent) {
      toast.error('No content to save');
      return;
    }
    
    try {
      const formatInfo = contentFormats.find(f => f.id === selectedFormat);
      
      // Create a new draft with the repurposed content
      await addContentItem({
        title: `${formatInfo?.name}: ${content.title}`,
        content: generatedContent,
        status: 'draft',
        seo_score: content.seo_score || 0,
        keywords: content.keywords || [],
        metadata: {
          ...content.metadata,
          repurposedFrom: content.id,
          repurposedFormat: selectedFormat,
          originalTitle: content.title
        }
      });
      
      toast.success('Saved as new draft');
      
      // Redirect to drafts after a short delay
      setTimeout(() => {
        navigate('/drafts');
      }, 1500);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Copied to clipboard');
  };
  
  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-opacity-50 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Repurposing | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/drafts')}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Drafts
          </Button>
          
          <h1 className="text-2xl font-bold text-center flex-1">Content Repurposing</h1>
          
          <div className="w-24"></div> {/* For balance */}
        </div>
        
        {/* Content title and information */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Original Content</CardTitle>
            <CardDescription>Repurposing "{content.title}"</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Original content: {content.content?.substring(0, 150)}...
            </p>
          </CardContent>
        </Card>
        
        {/* Main repurposing interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Format selection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select Format</CardTitle>
              <CardDescription>Choose a format to repurpose your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Social Media</SelectLabel>
                    {contentFormats.filter(format => format.id.startsWith('social')).map(format => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Long-form</SelectLabel>
                    {contentFormats.filter(format => !format.id.startsWith('social')).map(format => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              {selectedFormat && (
                <p className="text-sm text-muted-foreground">
                  {contentFormats.find(f => f.id === selectedFormat)?.description}
                </p>
              )}
              
              <Button 
                className="w-full"
                onClick={handleGenerateContent}
                disabled={!selectedFormat || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Right column: Generated content and actions */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <Tabs defaultValue="transform" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="transform">Transform</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {activeTab === 'transform' ? (
                <div className="space-y-4">
                  {generatedContent ? (
                    <Textarea 
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[300px] font-mono"
                    />
                  ) : (
                    <div className="border border-dashed rounded-md p-8 flex items-center justify-center min-h-[300px]">
                      {isGenerating ? (
                        <div className="text-center">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                          <p>Generating {contentFormats.find(f => f.id === selectedFormat)?.name}...</p>
                          <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-muted-foreground">
                            {selectedFormat 
                              ? "Select Generate Content to begin" 
                              : "Select a content format to get started"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {generatedContent && (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" onClick={handleSaveAsDraft}>
                        <Save className="h-4 w-4 mr-2" />
                        Save as Draft
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-4 min-h-[300px]">
                  {generatedContent ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">
                        {generatedContent}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        No content to preview yet
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ContentRepurposing;
