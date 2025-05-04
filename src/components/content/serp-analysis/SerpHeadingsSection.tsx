
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Heading, ChevronDown, ChevronUp } from 'lucide-react';

export interface SerpHeadingsSectionProps {
  serpData: SerpAnalysisResult;
  expanded: boolean;
  onAddToContent?: (content: string, type: string) => void;
}

export function SerpHeadingsSection({ 
  serpData, 
  expanded,
  onAddToContent = () => {}
}: SerpHeadingsSectionProps) {
  const [expandedHeading, setExpandedHeading] = useState<number | null>(null);
  
  if (!expanded) return null;
  
  // Use headings from data or fallback to empty array
  const headings = serpData.headings || [];
  
  if (headings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <Heading className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No headings data available for this keyword.</p>
      </motion.div>
    );
  }
  
  const toggleHeading = (index: number) => {
    setExpandedHeading(expandedHeading === index ? null : index);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-teal-500/20 shadow-lg bg-gradient-to-br from-teal-900/20 via-black/20 to-black/30 backdrop-blur-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="space-y-3">
            {headings.map((heading, index) => (
              <div 
                key={index}
                className="border border-teal-500/20 rounded-lg overflow-hidden"
              >
                <div 
                  className={`flex justify-between items-center p-3 cursor-pointer hover:bg-teal-900/10 
                             ${heading.level === 'h1' ? 'font-bold text-base' : 
                               heading.level === 'h2' ? 'font-semibold' : 
                               heading.level === 'h3' ? 'font-medium text-sm' : 'text-xs'}`}
                  onClick={() => toggleHeading(index)}
                >
                  <h4 className="flex-1">
                    <span className="text-teal-400 mr-2">{heading.level.toUpperCase()}</span>
                    {heading.text}
                  </h4>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 hover:bg-teal-500/20 mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToContent(`${heading.text}`, 'heading');
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="text-xs">Add</span>
                    </Button>
                    {expandedHeading === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                
                {expandedHeading === index && heading.subtext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-3 pb-3 pt-1 border-t border-teal-500/10 bg-teal-900/5"
                  >
                    <p className="text-sm text-muted-foreground">{heading.subtext}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline"
          size="sm"
          className="text-xs border-teal-500/30 hover:bg-teal-500/20"
          onClick={() => {
            const allHeadings = headings.map(h => h.text).join('\n');
            onAddToContent(allHeadings, 'allHeadings');
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add all headings
        </Button>
      </div>
    </motion.div>
  );
}
