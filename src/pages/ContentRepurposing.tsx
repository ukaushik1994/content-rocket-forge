
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '@/contexts/content';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Download, FileText, Loader2, Save, Filter, Search, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { RepurposeTab, contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { 
  generateContentByFormatType, 
  generateContentWithTemplate 
} from '@/services/contentTemplateService';
import { ContentItemType } from '@/contexts/content/types';

const ContentRepurposing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { contentItems, getContentItem, addContentItem } = useContent();
  
  const [content, setContent] = useState<ContentItemType | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [generatedContents, setGeneratedContents] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  
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
  
  const handleGenerateContent = async (contentTypeIds: string[]) => {
    if (contentTypeIds.length === 0) {
      toast.error('Please select at least one content format');
      return;
    }
    
    if (!content) {
      toast.error('Please select content to repurpose');
      return;
    }
    
    setIsGenerating(true);
    setSelectedFormats(contentTypeIds);
    
    try {
      const newGeneratedContents: Record<string, string> = {};
      
      // Generate content for each selected format using templates
      for (const formatId of contentTypeIds) {
        const formatInfo = contentFormats.find(f => f.id === formatId);
        
        try {
          toast.info(`Generating ${formatInfo?.name} content...`);
          
          // Use our template service to generate content
          const generatedContent = await generateContentByFormatType(
            formatId,
            content.title,
            {
              content: content.content.substring(0, 1500) || '',
              keyword: content.keywords ? content.keywords[0] : ''
            }
          );
          
          if (generatedContent) {
            newGeneratedContents[formatId] = generatedContent;
          } else {
            toast.error(`Failed to generate ${formatInfo?.name} content`);
          }
        } catch (error) {
          console.error('Error generating content:', error);
          toast.error(`Failed to generate ${formatInfo?.name} content`);
        }
      }
      
      setGeneratedContents(newGeneratedContents);
      
      if (Object.keys(newGeneratedContents).length > 0) {
        setActiveFormat(Object.keys(newGeneratedContents)[0]);
        toast.success(`Generated content for ${Object.keys(newGeneratedContents).length} format(s)`);
      } else {
        toast.error('Failed to generate any content');
      }
    } catch (error) {
      console.error('Error in content generation process:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };
  
  const downloadAsText = (content: string, formatName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content?.title ? content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'content'}_${formatName.toLowerCase().replace(' ', '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${a.download}`);
  };
  
  const saveAsNewContent = async (formatId: string, generatedContent: string) => {
    if (!content) return;
    
    try {
      const formatInfo = contentFormats.find(f => f.id === formatId);
      const formatName = formatInfo?.name || 'Repurposed';
      
      // Add as new content item
      await addContentItem({
        title: `${content.title} (${formatName})`,
        content: generatedContent,
        status: 'draft',
        seo_score: 0, // Adding the required property
        keywords: [], // Adding the required property
        metadata: {
          originalContentId: content.id,
          repurposedType: formatId,
          repurposedFrom: content.title
        }
      });
      
      toast.success(`Saved as new content item`);
    } catch (error) {
      console.error('Error saving as new content:', error);
      toast.error('Failed to save content');
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
                <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
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

        {/* Selection of content formats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                  <p className="font-medium">{content.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Content Preview</h3>
                  <p className="text-sm line-clamp-4">{content.content?.substring(0, 200)}...</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Content Formats</CardTitle>
                <CardDescription>Select formats to transform your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contentFormats.map((format) => (
                    <div
                      key={format.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedFormats.includes(format.id)
                          ? 'bg-primary/20 border border-primary/50'
                          : 'hover:bg-accent/10 border border-transparent'
                      }`}
                      onClick={() => {
                        if (selectedFormats.includes(format.id)) {
                          setSelectedFormats(selectedFormats.filter(f => f !== format.id));
                        } else {
                          setSelectedFormats([...selectedFormats, format.id]);
                        }
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded mr-2 flex items-center justify-center ${
                          selectedFormats.includes(format.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-muted-foreground'
                        }`}
                      >
                        {selectedFormats.includes(format.id) && <Check className="h-3 w-3" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{format.name}</span>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  disabled={selectedFormats.length === 0 || isGenerating}
                  onClick={() => handleGenerateContent(selectedFormats)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate ${selectedFormats.length} Format${selectedFormats.length !== 1 ? 's' : ''}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated Content</CardTitle>
                  <CardDescription>
                    {Object.keys(generatedContents).length > 0
                      ? `${Object.keys(generatedContents).length} format(s) generated`
                      : 'Select formats and generate content'}
                  </CardDescription>
                </div>

                {Object.keys(generatedContents).length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {Object.keys(generatedContents).map((formatId) => {
                      const format = contentFormats.find(f => f.id === formatId);
                      return (
                        <Button
                          key={formatId}
                          size="sm"
                          variant={activeFormat === formatId ? "default" : "outline"}
                          onClick={() => setActiveFormat(formatId)}
                          className={activeFormat === formatId 
                            ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none" 
                            : "border-white/10"
                          }
                        >
                          {format?.name || formatId}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-4 h-[500px] flex flex-col">
                {Object.keys(generatedContents).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Select content formats from the left panel and click "Generate" to transform your content
                    </p>
                  </div>
                ) : activeFormat ? (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {generatedContents[activeFormat]}
                      </pre>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContents[activeFormat])}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const format = contentFormats.find(f => f.id === activeFormat);
                          downloadAsText(
                            generatedContents[activeFormat],
                            format?.name || 'content'
                          );
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveAsNewContent(activeFormat, generatedContents[activeFormat])}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save as Content
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <p>Select a content format to view</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ContentRepurposing;
