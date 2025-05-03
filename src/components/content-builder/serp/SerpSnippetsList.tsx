
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SerpSelection } from '@/contexts/content-builder/types';
import { FileText, Plus } from 'lucide-react';

interface SerpSnippetsListProps {
  snippets: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
  addContentFromSerp?: (content: string, type: string) => void;
}

export const SerpSnippetsList: React.FC<SerpSnippetsListProps> = ({
  snippets,
  handleToggleSelection,
  addContentFromSerp = () => {}
}) => {
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
    <Card className="border-green-500/20 bg-gradient-to-br from-green-900/10 to-green-900/5 backdrop-blur-md shadow-xl">
      <CardContent className="pt-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {snippets.map((snippet, index) => (
            <motion.div 
              key={index} 
              variants={item}
              whileHover={{ scale: 1.01 }}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                snippet.selected 
                  ? "border-green-500 bg-green-500/10 shadow-inner" 
                  : "border-white/10 hover:border-green-500/30 hover:bg-green-900/20"
              }`}
            >
              <div className="flex items-start mb-3">
                <Checkbox 
                  id={`snippet-${index}`} 
                  checked={snippet.selected}
                  onCheckedChange={() => handleToggleSelection(snippet.type, snippet.content)}
                  className={`mt-1 mr-3 ${
                    snippet.selected 
                      ? "border-green-500 bg-green-500 text-white" 
                      : "border-white/40 text-transparent"
                  }`}
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={`snippet-${index}`} 
                    className="cursor-pointer flex-1 text-sm select-none mb-2 block"
                  >
                    {snippet.content.length > 100 
                      ? `${snippet.content.substring(0, 100)}...` 
                      : snippet.content
                    }
                  </Label>
                  
                  {snippet.source && (
                    <div className="text-xs text-muted-foreground">Source: {snippet.source}</div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/20"
                    onClick={() => addContentFromSerp(snippet.content, 'snippet')}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add directly to content
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {snippets.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No featured snippets available.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
