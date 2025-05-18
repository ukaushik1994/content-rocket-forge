
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Twitter, FileText, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  contentFormats, 
  getFormatIconComponent,
  formatCategories,
  getAllCategories,
  FormatCategory,
  getFormatsByCategory
} from './formats';

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
  const [activeCategory, setActiveCategory] = useState<FormatCategory>('social');
  
  const handleFormatClick = (formatId: string) => {
    if (selectedFormats.includes(formatId)) {
      setSelectedFormats(selectedFormats.filter(f => f !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };
  
  const categories = getAllCategories();
  
  return (
    <Card className="glass-panel border-white/10 bg-black/40 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-base">Content Formats</CardTitle>
        <CardDescription>Select formats to transform your content</CardDescription>
      </CardHeader>
      
      <div className="p-3 border-b border-white/10">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const categoryInfo = formatCategories[category];
            let CategoryIcon;
            
            switch(category) {
              case 'social': CategoryIcon = Twitter; break;
              case 'document': CategoryIcon = FileText; break;
              case 'visual': CategoryIcon = Image; break;
              case 'audio-video': CategoryIcon = Video; break;
              default: CategoryIcon = FileText;
            }
            
            return (
              <Button
                key={category}
                size="sm"
                variant={activeCategory === category ? "default" : "outline"}
                className={`
                  ${activeCategory === category 
                    ? `bg-gradient-to-r ${categoryInfo.color} border-none text-white` 
                    : 'bg-black/20 border-white/10 hover:bg-white/10'}
                `}
                onClick={() => setActiveCategory(category)}
              >
                <CategoryIcon className="h-4 w-4 mr-2" />
                {categoryInfo.name}
              </Button>
            );
          })}
        </div>
      </div>
      
      <CardContent className="pt-4">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getFormatsByCategory(activeCategory).map((format) => {
            const IconComponent = getFormatIconComponent(format.id);
            const isSelected = selectedFormats.includes(format.id);
            const categoryColor = formatCategories[format.category].color;
            
            return (
              <motion.div
                key={format.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
                  flex items-center p-3 rounded-md cursor-pointer transition-all duration-200
                  ${isSelected
                    ? `bg-gradient-to-r ${categoryColor} bg-opacity-20 border border-white/20`
                    : 'hover:bg-white/5 border border-transparent'}
                `}
                onClick={() => handleFormatClick(format.id)}
              >
                <div
                  className={`
                    w-5 h-5 rounded-md mr-3 flex items-center justify-center
                    ${isSelected
                      ? `bg-gradient-to-r ${categoryColor} text-white`
                      : 'border border-white/20 bg-black/40'}
                  `}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <IconComponent className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {format.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{format.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
      
      <CardFooter className="border-t border-white/10 pt-4">
        <Button
          className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
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
  );
};

export default ContentFormatSelection;
