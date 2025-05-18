
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentFormats, getFormatIconComponent } from '@/components/content-repurposing/formats';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface ContentDetailsProps {
  content: ContentItemType;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content }) => {
  // Get format icon for a format ID
  const getFormatIcon = (formatId: string) => {
    const IconComponent = getFormatIconComponent(formatId);
    return <IconComponent className="h-4 w-4" />;
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-2 border-b border-white/10">
          <CardTitle className="text-lg flex items-center justify-between">
            <motion.span 
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent"
            >
              Selected Content
            </motion.span>
            <Badge variant="outline" className="ml-2 bg-white/5">
              {content.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <h3 className="text-xl font-semibold">{content.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3 opacity-80">
              {content.content?.substring(0, 150)}...
            </p>
          </div>
          
          {repurposedFormats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-sm font-medium mb-2 text-white/80">Already Repurposed As:</p>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {repurposedFormats.map((format, index) => (
                    <Tooltip key={format.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20"
                          whileHover={{ scale: 1.05 }}
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            boxShadow: ['0 0 0px rgba(155, 135, 245, 0.2)', '0 0 8px rgba(155, 135, 245, 0.4)', '0 0 4px rgba(155, 135, 245, 0.2)']
                          }}
                          transition={{ 
                            delay: 0.1 * index,
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
            </motion.div>
          )}
          
          {content.keywords && content.keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-sm font-medium mb-1 text-white/80">Keywords:</p>
              <div className="flex flex-wrap gap-1">
                {content.keywords.map((keyword, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-white/5 hover:bg-white/10 transition-all"
                    >
                      {keyword}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentDetails;
