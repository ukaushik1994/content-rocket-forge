
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw, Sparkles, Star, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TitleSuggestionsCardProps {
  currentTitle: string | null;
  mainKeyword: string;
  selectedKeywords: string[];
  onSelectTitle: (title: string) => void;
  generateNewTitles: () => void;
  suggestions: string[];
  isGenerating: boolean;
}

export const TitleSuggestionsCard = ({
  currentTitle,
  mainKeyword,
  selectedKeywords,
  onSelectTitle,
  generateNewTitles,
  suggestions,
  isGenerating
}: TitleSuggestionsCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Effect to preselect a title that matches the current title if it exists
  useEffect(() => {
    if (currentTitle && suggestions.length > 0) {
      const currentTitleIndex = suggestions.findIndex(
        suggestion => suggestion === currentTitle
      );
      
      if (currentTitleIndex !== -1) {
        setSelected(currentTitleIndex);
      }
    }
  }, [currentTitle, suggestions]);

  const handleSelectTitle = (index: number) => {
    setSelected(index);
    const selectedTitle = suggestions[index];
    onSelectTitle(selectedTitle);
    console.log("[TitleSuggestionsCard] Title selected:", selectedTitle);
    toast.success("Title updated successfully");
  };

  const handleRegenerateTitles = () => {
    console.log("[TitleSuggestionsCard] Regenerating titles");
    generateNewTitles();
    toast.success("Generating new title suggestions");
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Card className="h-full shadow-xl bg-gradient-to-br from-background to-purple-950/5 border border-purple-500/20">
      <CardHeader className="pb-2 border-b border-purple-500/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          Title Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Current Title */}
        {currentTitle && (
          <motion.div 
            className="mb-4 pb-3 border-b border-border/50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Current Title:</p>
            <p className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {currentTitle}
            </p>
          </motion.div>
        )}

        {/* Title Suggestions */}
        <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-2">
          <AnimatePresence>
            {suggestions.length > 0 ? (
              <motion.div
                className="space-y-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div 
                    key={index}
                    className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                      selected === index 
                        ? 'border-blue-500 bg-blue-500/10 shadow-md' 
                        : hoveredIndex === index
                        ? 'border-purple-500/40 bg-purple-500/5'
                        : 'border-border/50 hover:bg-secondary/30'
                    }`}
                    onClick={() => handleSelectTitle(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    variants={item}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-sm">
                        {suggestion}
                      </p>
                      {selected === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Check className="h-4 w-4 text-blue-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="text-center py-12 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="h-10 w-10 text-blue-500/70 animate-spin mb-3" />
                    <p className="text-muted-foreground">Generating title suggestions...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-3">
                      <Star className="h-8 w-8 text-blue-500/70" />
                    </div>
                    <p className="text-muted-foreground">No title suggestions generated yet.</p>
                    <p className="text-muted-foreground text-xs mt-1">Click the button below to generate suggestions.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          {/* Regenerate Button - only show when we already have suggestions or a current title */}
          {(suggestions.length > 0 || currentTitle) && (
            <Button
              onClick={handleRegenerateTitles}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCw className="h-3.5 w-3.5" />
                  Regenerate
                </>
              )}
            </Button>
          )}

          {/* Generate New Button - always show */}
          <Button
            onClick={generateNewTitles}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className="gap-2 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Generate Titles
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
