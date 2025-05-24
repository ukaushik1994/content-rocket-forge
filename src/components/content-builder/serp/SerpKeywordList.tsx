
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SerpSelection } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';

interface SerpKeywordListProps {
  keywords: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpKeywordList: React.FC<SerpKeywordListProps> = ({
  keywords,
  handleToggleSelection
}) => {
  // Helper function to safely extract string content from any data type
  const extractStringContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object' && content !== null) {
      // Handle objects with block_position and items
      if (content.items && Array.isArray(content.items)) {
        return content.items.map((item: any) => 
          typeof item === 'string' ? item : String(item)
        ).join(', ');
      }
      // Handle other object types
      if (content.text) return String(content.text);
      if (content.title) return String(content.title);
      if (content.query) return String(content.query);
      if (content.name) return String(content.name);
      // Fallback for other objects
      return JSON.stringify(content);
    }
    return String(content || '');
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-blue-900/5 backdrop-blur-md shadow-xl">
      <CardContent className="pt-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {keywords.map((keyword, index) => {
            // Ensure content is a string using our helper function
            const contentString = extractStringContent(keyword.content);
            
            return (
              <motion.div 
                key={`keyword-${index}-${contentString.substring(0, 20)}`} 
                variants={item}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center border rounded-md p-3 transition-all duration-200 group hover:shadow-md ${
                  keyword.selected 
                    ? "border-blue-500 bg-blue-500/10 shadow-inner" 
                    : "border-white/10 hover:border-blue-500/30 hover:bg-blue-900/20"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`keyword-${index}`} 
                    checked={keyword.selected}
                    onCheckedChange={() => handleToggleSelection(keyword.type, contentString)}
                    className={`${
                      keyword.selected 
                        ? "border-blue-500 bg-blue-500 text-white" 
                        : "border-white/40 text-transparent"
                    }`}
                  />
                  <Label 
                    htmlFor={`keyword-${index}`} 
                    className="cursor-pointer flex-1 text-sm select-none"
                  >
                    {contentString}
                  </Label>
                </div>
                
                {!keyword.selected && (
                  <span 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs bg-blue-500/10 text-blue-400 rounded-full px-2 py-0.5 flex items-center gap-1 border border-blue-500/20"
                    onClick={() => handleToggleSelection(keyword.type, contentString)}
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
        
        {keywords.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No keywords available.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
