import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Download, FileText, Loader2, Save, Filter, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { RepurposeTab } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const ContentRepurposing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { contentItems, getContentItem, addContentItem } = useContent();
  
  const [content, setContent] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Filter content items based on search query
  const filteredItems = contentItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Load content when component mounts
  useEffect(() => {
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
  }, [location, getContentItem]);
  
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
  
  // If no content is selected yet, show the content selection view
  if (!content) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Helmet>
          <title>Content Repurposing | Content Platform</title>
        </Helmet>
        
        <Navbar />
        
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Content Repurposing</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Transform your existing content into various formats and platforms with AI assistance</p>
          </div>
          
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md border border-white/10">
            <CardHeader className="border-b border-white/10 bg-black/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-neon-purple animate-pulse-glow" />
                Available Content
              </CardTitle>
              <CardDescription>Select content to transform into different formats</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {contentItems.length === 0 ? (
                <div className="text-center p-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-white/70" />
                  </div>
                  <p className="text-muted-foreground mb-6">No content available to repurpose</p>
                  <Button onClick={() => navigate('/content-builder')} className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90">
                    Create New Content
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{contentItems.length} items available</p>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Search content..." 
                          className="pl-9 bg-black/30 border-white/10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button variant="outline" size="icon" className="border-white/10">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {filteredItems.map(item => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.01 }}
                        className="card-3d"
                      >
                        <Card 
                          key={item.id} 
                          className="cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10 transition-all duration-200"
                          onClick={() => handleContentSelection(item.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col">
                              <h3 className="font-medium text-white">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {item.content?.substring(0, 120)}...
                              </p>
                              <div className="flex justify-end mt-3">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContentSelection(item.id);
                                  }}
                                >
                                  Select for Repurposing →
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Repurposing | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6"
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setContent(null);
              navigate('/content-repurposing');
            }}
            className="gap-1 hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Content List
          </Button>
          
          <h1 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            Content Repurposing
          </h1>
          
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
      </motion.main>
    </div>
  );
};

export default ContentRepurposing;
