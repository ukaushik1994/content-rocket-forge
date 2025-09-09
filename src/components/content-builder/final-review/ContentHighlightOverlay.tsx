import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Info, 
  AlertCircle,
  Target,
  Lightbulb
} from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentHighlight } from '@/services/contentHighlightingService';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentHighlightOverlayProps {
  content: string;
  className?: string;
}

export const ContentHighlightOverlay: React.FC<ContentHighlightOverlayProps> = ({
  content,
  className = ""
}) => {
  const [showHighlights, setShowHighlights] = useState(false);
  const [mockHighlights] = useState<ContentHighlight[]>([
    // Mock highlights for demonstration - in real implementation these would come from saved optimization data
    {
      id: 'highlight-1',
      text: 'keyword density',
      startIndex: content.indexOf('keyword') > -1 ? content.indexOf('keyword') : 0,
      endIndex: content.indexOf('keyword') > -1 ? content.indexOf('keyword') + 15 : 15,
      type: 'seo',
      priority: 'high',
      suggestion: {
        title: 'Optimize keyword density',
        description: 'Consider adjusting keyword frequency for better SEO',
        category: 'seo'
      }
    }
  ]);

  const { getOptimizationSelections } = useContentBuilder();
  const optimizationData = getOptimizationSelections();

  const getHighlightColor = (type: ContentHighlight['type'], priority: ContentHighlight['priority']) => {
    const baseColors = {
      'seo': 'bg-green-200 border-green-300',
      'structure': 'bg-orange-200 border-orange-300',
      'solution': 'bg-blue-200 border-blue-300',
      'ai-detection': 'bg-purple-200 border-purple-300',
      'serp': 'bg-yellow-200 border-yellow-300'
    };

    const intensityClass = priority === 'high' ? 'opacity-90' : priority === 'medium' ? 'opacity-70' : 'opacity-50';
    
    return `${baseColors[type]} ${intensityClass}`;
  };

  const getTypeIcon = (type: ContentHighlight['type']) => {
    const icons = {
      'seo': Target,
      'structure': Lightbulb,
      'solution': CheckCircle2,
      'ai-detection': AlertCircle,
      'serp': Info
    };
    
    const Icon = icons[type];
    return Icon ? <Icon className="w-3 h-3" /> : <Info className="w-3 h-3" />;
  };

  const renderHighlightedContent = () => {
    if (!showHighlights || mockHighlights.length === 0) {
      return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
    }

    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    // Sort highlights by start index
    const sortedHighlights = [...mockHighlights].sort((a, b) => a.startIndex - b.startIndex);

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.startIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, highlight.startIndex);
        if (textBefore) {
          elements.push(
            <span key={`text-${index}-before`} dangerouslySetInnerHTML={{ __html: textBefore }} />
          );
        }
      }

      // Add highlighted text
      elements.push(
        <TooltipProvider key={`highlight-${highlight.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`
                  inline-block px-1 py-0.5 rounded-sm border cursor-pointer transition-all duration-200
                  ${getHighlightColor(highlight.type, highlight.priority)}
                  hover:scale-105
                `}
              >
                {highlight.text}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(highlight.type)}
                  <span className="font-medium text-sm">{highlight.suggestion.title}</span>
                  <Badge variant="outline">
                    {highlight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {highlight.suggestion.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  Previously optimized content
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      lastIndex = highlight.endIndex;
    });

    // Add remaining text after last highlight
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      if (textAfter) {
        elements.push(
          <span key="text-after" dangerouslySetInnerHTML={{ __html: textAfter }} />
        );
      }
    }

    return (
      <div className="prose max-w-none">
        {elements}
      </div>
    );
  };

  if (!optimizationData || !optimizationData.highlights.length) {
    return (
      <div className={`relative ${className}`}>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      
      {/* Highlight Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowHighlights(!showHighlights)}
          className="gap-2 bg-background/80 backdrop-blur-sm"
        >
          {showHighlights ? (
            <>
              <EyeOff className="w-3 h-3" />
              Hide Highlights
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Show Applied Optimizations
            </>
          )}
        </Button>
      </div>

      {/* Content with optional highlights */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showHighlights ? 'highlighted' : 'normal'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderHighlightedContent()}
        </motion.div>
      </AnimatePresence>

      {/* Highlight Legend */}
      {showHighlights && mockHighlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mt-4"
        >
          <Card className="bg-muted/50">
            <CardContent className="pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Applied Optimizations</span>
                <Badge variant="outline" className="text-xs">
                  {mockHighlights.length} areas
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Highlighted areas show previously applied optimizations from your content analysis.
                Hover over highlights to see details.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};