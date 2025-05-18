
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { contentFormats, getFormatIconComponent } from './formats';
import { motion } from 'framer-motion';

interface ContentFormatSelectionProps {
  selectedFormats: string[];
  setSelectedFormats: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerateContent: (formatIds: string[]) => void;
  isGenerating: boolean;
}

export const ContentFormatSelection: React.FC<ContentFormatSelectionProps> = ({
  selectedFormats,
  setSelectedFormats,
  onGenerateContent,
  isGenerating
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-black/60 to-black/40 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-3 border-b border-white/10">
          <CardTitle className="text-base bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Content Formats</CardTitle>
          <CardDescription>Select formats to transform your content</CardDescription>
        </CardHeader>
        <CardContent className="py-4">
          <div className="space-y-2">
            {contentFormats.map((format, index) => {
              const IconComponent = getFormatIconComponent(format.id);
              const isSelected = selectedFormats.includes(format.id);
              
              return (
                <motion.div
                  key={format.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  onClick={() => {
                    if (selectedFormats.includes(format.id)) {
                      setSelectedFormats(selectedFormats.filter(f => f !== format.id));
                    } else {
                      setSelectedFormats([...selectedFormats, format.id]);
                    }
                  }}
                >
                  <motion.div
                    animate={isSelected ? {
                      scale: [1, 1.2, 1],
                      transition: { duration: 0.3 }
                    } : {}}
                    className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white'
                        : 'border border-white/30'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {format.name}
                      <IconComponent className="h-4 w-4 text-white/70" />
                    </span>
                    <p className="text-xs text-white/60">{format.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t border-white/10">
          <Button
            className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/90 hover:to-neon-blue/90 text-white"
            disabled={selectedFormats.length === 0 || isGenerating}
            onClick={() => onGenerateContent(selectedFormats)}
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
    </motion.div>
  );
};

export default ContentFormatSelection;
