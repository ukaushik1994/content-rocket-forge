
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Filter, Search, Sparkles, Book, Images, Image, Twitter, Linkedin, Facebook, Mail, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RepurposedContentDialog from './RepurposedContentDialog';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: {
    content: string;
    formatId: string;
    contentId: string;
    title: string;
  } | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

export const ContentSelection: React.FC<ContentSelectionProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  isDeleting = false
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Filter content items based on search query
  const filteredItems = contentItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Helper function to get format icon for a format ID
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-full w-full" />;
      case 'carousel':
        return <Images className="h-full w-full" />;
      case 'meme':
        return <Image className="h-full w-full" />;
      case 'social-twitter':
        return <Twitter className="h-full w-full" />;
      case 'social-linkedin':
        return <Linkedin className="h-full w-full" />;
      case 'social-facebook':
        return <Facebook className="h-full w-full" />;
      case 'email':
        return <Mail className="h-full w-full" />;
      case 'script':
        return <FileText className="h-full w-full" />;
      case 'infographic':
        return <BarChart className="h-full w-full" />;
      case 'blog':
        return <FileText className="h-full w-full" />;
      default:
        return <FileText className="h-full w-full" />;
    }
  };
  
  // Check if a content item has been repurposed for a specific format
  const hasRepurposedFormat = (item: ContentItemType, formatId: string): boolean => {
    // Check if this content has repurposed formats stored in metadata
    const repurposedFormats = item.metadata?.repurposedFormats || [];
    return repurposedFormats.includes(formatId);
  };

  return (
    <>
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
                <TooltipProvider>
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
                        onClick={() => onSelectContent(item.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <h3 className="font-medium text-white">{item.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.content?.substring(0, 120)}...
                            </p>
                            
                            {/* Format indicators with animated, clickable icons */}
                            <div className="flex flex-wrap gap-2 mt-3 mb-2">
                              {contentFormats.map(format => {
                                const isFormatUsed = hasRepurposedFormat(item, format.id);
                                return (
                                  <Tooltip key={format.id}>
                                    <TooltipTrigger asChild>
                                      <motion.div
                                        className={`w-7 h-7 flex items-center justify-center rounded-full 
                                          ${isFormatUsed
                                            ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-lg cursor-pointer' 
                                            : 'bg-gray-800/40 text-gray-500'}`}
                                        initial={false}
                                        animate={isFormatUsed ? {
                                          scale: [1, 1.15, 1],
                                          boxShadow: ['0 0 0px rgba(155, 135, 245, 0.5)', '0 0 15px rgba(155, 135, 245, 0.8)', '0 0 5px rgba(155, 135, 245, 0.5)']
                                        } : {}}
                                        transition={{
                                          duration: 0.5,
                                          ease: "easeInOut",
                                          repeat: isFormatUsed ? Infinity : 0,
                                          repeatDelay: 4
                                        }}
                                        onClick={(e) => {
                                          if (isFormatUsed) {
                                            e.stopPropagation();
                                            onOpenRepurposedContent(item.id, format.id);
                                          }
                                        }}
                                      >
                                        {getFormatIcon(format.id)}
                                      </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p>{format.name} {isFormatUsed ? '(Click to view)' : ''}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                            
                            <div className="flex justify-end mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectContent(item.id);
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
                </TooltipProvider>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Repurposed Content Dialog with Delete Button */}
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ContentSelection;
