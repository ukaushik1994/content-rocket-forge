import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TitleSelectionCardProps {
  titles: string[];
  selectedTitle: string | null;
  onSelectTitle: (title: string) => void;
  onGenerateMore: () => void;
  isGenerating: boolean;
  isVisible: boolean;
}

export const TitleSelectionCard: React.FC<TitleSelectionCardProps> = ({
  titles,
  selectedTitle,
  onSelectTitle,
  onGenerateMore,
  isGenerating,
  isVisible
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-4"
      >
        <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Choose Your Perfect Title
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateMore}
                disabled={isGenerating}
                className="gap-1.5 text-xs"
              >
                {isGenerating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Generate More
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-3 text-sm text-muted-foreground">Analyzing content to generate perfect titles...</span>
              </div>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                {titles.map((title, index) => (
                  <motion.div
                    key={`${title}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                      selectedTitle === title
                        ? 'border-primary bg-primary/10 shadow-md'
                        : hoveredIndex === index
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/50 hover:bg-secondary/30'
                    }`}
                    onClick={() => onSelectTitle(title)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <p className="text-sm font-medium flex-1 pr-2">{title}</p>
                    {selectedTitle === title && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
            
            {selectedTitle && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg"
              >
                <p className="text-xs text-success-foreground/80 mb-1">Selected Title:</p>
                <p className="text-sm font-semibold text-success-foreground">{selectedTitle}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};