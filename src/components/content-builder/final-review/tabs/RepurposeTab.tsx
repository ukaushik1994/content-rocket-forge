
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Copy, Twitter, Linkedin, Mail, Video, Headphones, Image, Save, Download, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CustomBadge } from '@/components/ui/custom-badge';

interface RepurposeTabProps {
  content: string;
  title: string;
  isGenerating?: boolean;
  onGenerateRepurposedContent?: (contentType: string) => Promise<void>;
}

export const RepurposeTab: React.FC<RepurposeTabProps> = ({
  content,
  title,
  isGenerating = false,
  onGenerateRepurposedContent = async () => {}
}) => {
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [repurposedContent, setRepurposedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const contentTypes = [
    { id: 'social-twitter', name: 'Twitter/X Post', icon: Twitter },
    { id: 'social-linkedin', name: 'LinkedIn Post', icon: Linkedin },
    { id: 'email-newsletter', name: 'Email Newsletter', icon: Mail },
    { id: 'video-script', name: 'Video Script', icon: Video },
    { id: 'podcast-script', name: 'Podcast Script', icon: Headphones },
    { id: 'infographic', name: 'Infographic Content', icon: Image },
  ];
  
  const handleContentTypeChange = (value: string) => {
    setSelectedContentType(value);
    setRepurposedContent(''); // Reset when changing type
  };
  
  const handleGenerateContent = async () => {
    if (!selectedContentType) {
      toast.error('Please select a content type first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onGenerateRepurposedContent(selectedContentType);
      
      // Mock content generation for demonstration
      // In a real implementation, this would come from the AI generation service
      const mockContent = `This is a repurposed version of "${title}" for ${
        contentTypes.find(type => type.id === selectedContentType)?.name
      }.\n\nThe original content has been transformed to fit this format...\n\n${
        content.substring(0, 200)
      }...(transformed for ${selectedContentType})`;
      
      setRepurposedContent(mockContent);
      toast.success(`Generated ${
        contentTypes.find(type => type.id === selectedContentType)?.name
      } content`);
    } catch (error) {
      console.error('Error generating repurposed content:', error);
      toast.error('Failed to generate repurposed content');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(repurposedContent);
    toast.success('Copied to clipboard');
  };
  
  const saveAsDraft = () => {
    // In a real implementation, this would save the repurposed content as a new draft
    toast.success('Saved as new draft');
  };

  // Find the selected content type object
  const selectedType = contentTypes.find(type => type.id === selectedContentType);
  
  // Create a component for the icon
  const SelectedIcon = selectedType?.icon;
  
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
                Content Repurposing Engine
              </span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Transform your content into different formats optimized for various platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <motion.div variants={itemVariants} className="w-full md:w-1/3 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Content Type</p>
                  <Select value={selectedContentType} onValueChange={handleContentTypeChange}>
                    <SelectTrigger className="bg-black/30 border-white/10 backdrop-blur-md">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      <SelectGroup>
                        <SelectLabel className="text-white/60">Social Media</SelectLabel>
                        {contentTypes.filter(type => type.id.startsWith('social')).map(type => (
                          <SelectItem key={type.id} value={type.id} className="text-white focus:bg-white/10">
                            <div className="flex items-center">
                              {React.createElement(type.icon, { className: "h-4 w-4 mr-2" })}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-white/60">Long-form</SelectLabel>
                        {contentTypes.filter(type => !type.id.startsWith('social')).map(type => (
                          <SelectItem key={type.id} value={type.id} className="text-white focus:bg-white/10">
                            <div className="flex items-center">
                              {React.createElement(type.icon, { className: "h-4 w-4 mr-2" })}
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleGenerateContent} 
                  className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 shadow-[0_0_15px_rgba(155,135,245,0.2)] transition-all duration-300"
                  disabled={isLoading || !selectedContentType}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Transform Content
                    </>
                  )}
                </Button>
                
                {selectedContentType && selectedType && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10"
                  >
                    <p className="text-sm text-white/60 mb-2">Selected format:</p>
                    <CustomBadge 
                      animated
                      className="bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border-white/10 text-white"
                      icon={SelectedIcon && React.createElement(SelectedIcon, { className: "h-3 w-3" })}
                    >
                      {selectedType.name}
                    </CustomBadge>
                    
                    <div className="mt-4">
                      <p className="text-xs text-white/40">
                        {selectedType.id === 'social-twitter' && "Perfect for short-form social sharing with hashtags and mentions."}
                        {selectedType.id === 'social-linkedin' && "Professional format optimized for business audience and engagement."}
                        {selectedType.id === 'email-newsletter' && "Designed for email campaigns with clear sections and call-to-actions."}
                        {selectedType.id === 'video-script' && "Structured for video narration with scene descriptions and timings."}
                        {selectedType.id === 'podcast-script' && "Conversational format with host notes and segment breakdowns."}
                        {selectedType.id === 'infographic' && "Visual-friendly bullet points and data optimized for graphics."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants} className="w-full md:w-2/3">
                {repurposedContent ? (
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <div className="bg-black/40 backdrop-blur-sm p-3 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-neon-purple mr-2"></div>
                        <h3 className="text-sm font-medium text-white">Generated Content</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-xs h-8 hover:bg-white/10">
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={saveAsDraft} className="text-xs h-8 hover:bg-white/10">
                          <Save className="h-3 w-3 mr-1" /> Save Draft
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-8 hover:bg-white/10">
                          <Download className="h-3 w-3 mr-1" /> Export
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-black/20 backdrop-blur-sm">
                      <div className="whitespace-pre-wrap text-sm mt-2 font-mono text-white/80 p-3 rounded bg-black/20 border border-white/5 shadow-inner">
                        {repurposedContent}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/10 rounded-lg p-10 h-full flex items-center justify-center backdrop-blur-sm bg-black/20">
                    {isLoading ? (
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-neon-purple animate-pulse-glow" />
                        <p className="text-white/60">Transforming your content...</p>
                        <p className="text-white/40 text-sm mt-2">This might take a few moments</p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="text-center max-w-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-center mx-auto mb-4">
                          {selectedContentType ? 
                            (SelectedIcon && React.createElement(SelectedIcon, { className: "h-8 w-8 text-white/40" })) : 
                            <FileText className="h-8 w-8 text-white/40" />
                          }
                        </div>
                        <p className="text-white/60 mb-2">
                          {selectedContentType 
                            ? "Ready to transform your content" 
                            : "Select a content type to get started"}
                        </p>
                        <p className="text-white/40 text-sm">
                          {selectedContentType 
                            ? "Click 'Transform Content' to generate content optimized for " + contentTypes.find(t => t.id === selectedContentType)?.name 
                            : "Choose from various content formats to repurpose your existing content"}
                        </p>
                      </motion.div>
                    )}
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
