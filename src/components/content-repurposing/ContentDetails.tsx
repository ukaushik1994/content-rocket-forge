
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Book, Images, Image, Twitter, Linkedin, Facebook, Mail, BarChart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentDetailsProps {
  content: ContentItemType;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content }) => {
  // Get format icon for a format ID
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-4 w-4" />;
      case 'carousel':
        return <Images className="h-4 w-4" />;
      case 'meme':
        return <Image className="h-4 w-4" />;
      case 'social-twitter':
        return <Twitter className="h-4 w-4" />;
      case 'social-linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'social-facebook':
        return <Facebook className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'script':
        return <FileText className="h-4 w-4" />;
      case 'infographic':
        return <BarChart className="h-4 w-4" />;
      case 'blog':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Check if a content has been repurposed for a specific format
  const hasRepurposedFormat = (formatId: string): boolean => {
    // Check if metadata exists
    if (!content.metadata) return false;
    
    // Check if there are repurposed formats listed
    const repurposedFormats = content.metadata.repurposedFormats || [];
    return repurposedFormats.includes(formatId);
  };
  
  // Get all repurposed formats
  const getRepurposedFormats = () => {
    if (!content.metadata?.repurposedFormats) return [];
    return contentFormats.filter(format => 
      content.metadata?.repurposedFormats?.includes(format.id)
    );
  };
  
  const repurposedFormats = getRepurposedFormats();

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Selected Content</span>
          <Badge variant="outline" className="ml-2">
            {content.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{content.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
            {content.content?.substring(0, 150)}...
          </p>
        </div>
        
        {repurposedFormats.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Already Repurposed As:</p>
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {repurposedFormats.map(format => (
                  <Tooltip key={format.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0.8 }}
                        animate={{ 
                          opacity: 1,
                          boxShadow: ['0 0 0px rgba(155, 135, 245, 0.2)', '0 0 8px rgba(155, 135, 245, 0.4)', '0 0 4px rgba(155, 135, 245, 0.2)']
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: "reverse", 
                          duration: 2 
                        }}
                      >
                        <span className="text-white/90">{getFormatIcon(format.id)}</span>
                        <span className="text-xs">{format.name}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This content has been repurposed as {format.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
        )}
        
        {content.keywords && content.keywords.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Keywords:</p>
            <div className="flex flex-wrap gap-1">
              {content.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentDetails;
