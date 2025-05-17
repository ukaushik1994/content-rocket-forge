
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Copy, Twitter, Linkedin, Mail, Video, Headphones, Image, Save, Download, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CustomBadge } from '@/components/ui/custom-badge';
import { sendChatRequest } from '@/services/aiService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RepurposeTabProps {
  content: string;
  title: string;
  isGenerating?: boolean;
  onGenerateRepurposedContent?: (contentTypes: string[]) => Promise<void>;
}

export const contentFormats = [
  { id: 'social-twitter', name: 'Twitter/X Post', icon: Twitter },
  { id: 'social-linkedin', name: 'LinkedIn Post', icon: Linkedin },
  { id: 'email-newsletter', name: 'Email Newsletter', icon: Mail },
  { id: 'video-script', name: 'Video Script', icon: Video },
  { id: 'podcast-script', name: 'Podcast Script', icon: Headphones },
  { id: 'infographic', name: 'Infographic Content', icon: Image },
];

export const RepurposeTab: React.FC<RepurposeTabProps> = ({
  content,
  title,
  isGenerating = false,
  onGenerateRepurposedContent = async () => {}
}) => {
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [repurposedContent, setRepurposedContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeContentType, setActiveContentType] = useState<string | null>(null);
  
  const handleContentTypeToggle = (contentTypeId: string) => {
    setSelectedContentTypes(prev => {
      if (prev.includes(contentTypeId)) {
        return prev.filter(id => id !== contentTypeId);
      } else {
        return [...prev, contentTypeId];
      }
    });
  };
  
  const handleGenerateContent = async () => {
    if (selectedContentTypes.length === 0) {
      toast.error('Please select at least one content type');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the parent component's handler to track that we're generating content
      await onGenerateRepurposedContent(selectedContentTypes);
      
      const newRepurposedContent: Record<string, string> = {};
      
      // Generate content for each selected type using AI API
      for (const formatId of selectedContentTypes) {
        const formatInfo = contentFormats.find(f => f.id === formatId);
        
        try {
          toast.info(`Generating ${formatInfo?.name} content...`);
          
          // Use the AI service to generate content for each format
          const response = await sendChatRequest('openai', {
            messages: [
              { 
                role: 'system', 
                content: `You are an expert at repurposing content for different formats. 
                          Take the provided content and transform it for the specified format.
                          Create high-quality, engaging content that's optimized for the target format.` 
              },
              { 
                role: 'user', 
                content: `Transform this content titled "${title}" into a ${formatInfo?.name} format.
                          Original content: ${content.substring(0, 1500)}...
                          
                          Make it appropriate for the ${formatInfo?.name} format with all necessary elements.
                          For Twitter/X, include hashtags and keep it under 280 characters. 
                          For LinkedIn, make it professional and include relevant hashtags.
                          For email newsletters, include subject line and clear sections.
                          For scripts, include proper formatting with sections for narration.
                          For infographics, organize data into clear bullet points and sections.`
              }
            ]
          });
          
          if (response?.choices?.[0]?.message?.content) {
            newRepurposedContent[formatId] = response.choices[0].message.content;
          } else {
            toast.error(`Failed to generate ${formatInfo?.name} content`);
          }
        } catch (error) {
          console.error(`Error generating content for ${formatId}:`, error);
          toast.error(`Failed to generate ${formatInfo?.name} content`);
        }
      }
      
      setRepurposedContent(newRepurposedContent);
      
      // Set the first content type as active
      if (Object.keys(newRepurposedContent).length > 0) {
        setActiveContentType(Object.keys(newRepurposedContent)[0]);
        toast.success(`Generated content for ${Object.keys(newRepurposedContent).length} format(s)`);
      }
    } catch (error) {
      console.error('Error generating repurposed content:', error);
      toast.error('Failed to generate repurposed content');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  
  const saveAsDraft = (contentType: string) => {
    // In a real implementation, this would save the repurposed content as a new draft
    toast.success(`Saved ${contentFormats.find(t => t.id === contentType)?.name} as new draft`);
  };
  
  const removeContentType = (contentTypeId: string) => {
    setSelectedContentTypes(prev => prev.filter(id => id !== contentTypeId));
    
    // If we're removing the active content type, select another one
    if (activeContentType === contentTypeId) {
      const remaining = selectedContentTypes.filter(id => id !== contentTypeId);
      setActiveContentType(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Display all generated content in a grid of tiles
  const renderContentTiles = () => {
    const formatIds = Object.keys(repurposedContent);
    
    if (formatIds.length === 0) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {formatIds.map((formatId) => {
          const format = contentFormats.find(f => f.id === formatId);
          const FormatIcon = format?.icon || FileText;
          
          return (
            <Card key={formatId} className="overflow-hidden bg-black/30 border border-white/10 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="border-b border-white/10 bg-black/40 p-3 flex flex-row justify-between items-center space-y-0">
                <div className="flex items-center">
                  <FormatIcon className="h-4 w-4 mr-2 text-neon-purple" />
                  <h4 className="font-medium text-sm">{format?.name}</h4>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => copyToClipboard(repurposedContent[formatId])}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => saveAsDraft(formatId)}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="whitespace-pre-wrap text-xs mt-1 font-mono text-white/80 p-3 rounded bg-black/20 border border-white/5 shadow-inner max-h-48 overflow-y-auto">
                  {repurposedContent[formatId]}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden backdrop-blur-lg bg-gradient-to-br from-black/40 to-black/60 border border-white/10 shadow-[0_0_15px_rgba(155,135,245,0.1)]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl flex items-center">
              <div className="h-6 w-6 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center mr-2">
                <ChevronRight className="h-3 w-3 text-white" />
              </div>
              <span className="bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                Multi-Format Content Repurposing
              </span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Transform your content into multiple formats simultaneously with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div variants={itemVariants} className="w-full md:w-1/3 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white">Select Content Types</p>
                  
                  <div className="space-y-2 p-4 rounded-md bg-black/30 border border-white/10">
                    {contentFormats.map(type => (
                      <div key={type.id} className="flex items-center space-x-2 p-2 hover:bg-white/5 rounded-md transition-colors">
                        <Checkbox 
                          id={`type-${type.id}`}
                          checked={selectedContentTypes.includes(type.id)}
                          onCheckedChange={() => handleContentTypeToggle(type.id)}
                          className="data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                        />
                        <label 
                          htmlFor={`type-${type.id}`}
                          className="flex items-center cursor-pointer text-sm font-medium flex-1"
                        >
                          {React.createElement(type.icon, { className: "h-4 w-4 mr-2 text-white/70" })}
                          {type.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/60">
                      {selectedContentTypes.length} format{selectedContentTypes.length !== 1 ? 's' : ''} selected
                    </p>
                    {selectedContentTypes.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => setSelectedContentTypes([])}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateContent} 
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 shadow-[0_0_15px_rgba(155,135,245,0.2)] transition-all duration-300"
                  disabled={isLoading || selectedContentTypes.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedContentTypes.length > 1
                        ? `Transform to ${selectedContentTypes.length} Formats`
                        : 'Transform Content'}
                    </>
                  )}
                </Button>
                
                {selectedContentTypes.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10"
                  >
                    <p className="text-sm text-white/60 mb-2">Selected formats:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContentTypes.map(typeId => {
                        const selectedType = contentFormats.find(type => type.id === typeId);
                        const SelectedIcon = selectedType?.icon;
                        
                        return (
                          <CustomBadge 
                            key={typeId}
                            animated
                            className={`bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border-white/10 text-white cursor-pointer ${activeContentType === typeId ? 'ring-1 ring-neon-purple' : ''}`}
                            icon={SelectedIcon && React.createElement(SelectedIcon, { className: "h-3 w-3" })}
                            onClick={() => {
                              if (repurposedContent[typeId]) {
                                setActiveContentType(typeId);
                              }
                            }}
                          >
                            {selectedType?.name}
                          </CustomBadge>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants} className="w-full md:w-2/3">
                {isLoading ? (
                  <div className="border border-dashed border-white/10 rounded-lg p-10 h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <motion.div 
                      className="text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-neon-purple animate-pulse-glow" />
                      <p className="text-white/60">Transforming your content...</p>
                      <p className="text-white/40 text-sm mt-2">
                        Generating {selectedContentTypes.length} format{selectedContentTypes.length !== 1 ? 's' : ''}
                      </p>
                    </motion.div>
                  </div>
                ) : Object.keys(repurposedContent).length > 0 ? (
                  <div className="space-y-4">
                    {renderContentTiles()}
                  </div>
                ) : (
                  <div className="border border-dashed border-white/10 rounded-lg p-10 h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
                    <motion.div 
                      className="text-center max-w-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-white/40" />
                      </div>
                      <p className="text-white/60 mb-2">
                        {selectedContentTypes.length > 0 
                          ? "Select content types and click 'Transform'" 
                          : "Select content types to get started"}
                      </p>
                      <p className="text-white/40 text-sm">
                        {selectedContentTypes.length > 0 
                          ? `Choose from ${selectedContentTypes.length} format${selectedContentTypes.length !== 1 ? 's' : ''} to transform your content` 
                          : "Choose from various content formats to repurpose your existing content"}
                      </p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
