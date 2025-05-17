
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
import { ArrowLeft, Copy, Download, FileText, Loader2, Save, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { RepurposeTab } from '@/components/content-builder/final-review/tabs/RepurposeTab';

const ContentRepurposing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getContentItem, getAllContentItems, addContentItem } = useContent();
  
  const [content, setContent] = useState<any>(null);
  const [contentItems, setContentItems] = useState<any[]>([]);
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
    // Load all content items for selection
    const items = getAllContentItems();
    setContentItems(items);
    
    // Check if we have a specific content ID from URL param
    const contentId = new URLSearchParams(location.search).get('id');
    if (contentId) {
      const contentItem = getContentItem(contentId);
      if (contentItem) {
        console.log('Loaded content for repurposing:', contentItem.title);
        setContent(contentItem);
      } else {
        toast.error('Content not found');
      }
    }
  }, [location, getContentItem, getAllContentItems]);
  
  const handleContentSelection = (contentId: string) => {
    const selectedContent = getContentItem(contentId);
    if (selectedContent) {
      setContent(selectedContent);
      // Update the URL without page reload
      navigate(`/content-repurposing?id=${contentId}`, { replace: true });
    }
  };
  
  const handleGenerateContent = async () => {
    if (!selectedFormat) {
      toast.error('Please select a content format');
      return;
    }
    
    if (!content) {
      toast.error('Please select content to repurpose');
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
      
      // Reset the form
      setGeneratedContent('');
      setSelectedFormat('');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Copied to clipboard');
  };

  // If no content is selected yet, show the content selection view
  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Helmet>
          <title>Content Repurposing | Content Platform</title>
        </Helmet>
        
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Content Repurposing</h1>
            <p className="text-muted-foreground">Select content to repurpose into different formats</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Content</CardTitle>
              <CardDescription>Select a piece of content to repurpose</CardDescription>
            </CardHeader>
            <CardContent>
              {contentItems.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">No content available to repurpose</p>
                  <Button onClick={() => navigate('/content-builder')}>
                    Create New Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{contentItems.length} items available</p>
                    <Button variant="outline" size="sm" className="flex gap-1">
                      <Filter className="h-3 w-3" />
                      Filter
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    {contentItems.map(item => (
                      <Card key={item.id} className="cursor-pointer hover:bg-accent/5" onClick={() => handleContentSelection(item.id)}>
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.content?.substring(0, 120)}...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
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
            onClick={() => {
              setContent(null);
              navigate('/content-repurposing');
            }}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content List
          </Button>
          
          <h1 className="text-2xl font-bold text-center flex-1">Content Repurposing</h1>
          
          <div className="w-24"></div> {/* For balance */}
        </div>

        {/* Use the RepurposeTab component for the main repurposing interface */}
        <RepurposeTab 
          content={content.content} 
          title={content.title}
          isGenerating={isGenerating}
          onGenerateRepurposedContent={async (contentType) => {
            setSelectedFormat(contentType);
            await handleGenerateContent();
          }}
        />
      </main>
    </div>
  );
};

export default ContentRepurposing;
