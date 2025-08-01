
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Sparkles,
  HelpCircle,
  Search,
  FileText,
  Tag,
  Wrench
} from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { motion } from 'framer-motion';

interface SerpIntegrationPanelProps {
  content: string;
  serpSelections: SerpSelection[];
  onIntegrateItem?: (item: SerpSelection) => void;
}

interface IntegrationAnalysis {
  totalSelected: number;
  totalUsed: number;
  usagePercentage: number;
  usedItems: SerpSelection[];
  unusedItems: SerpSelection[];
  suggestions: string[];
}

export const SerpIntegrationPanel: React.FC<SerpIntegrationPanelProps> = ({
  content,
  serpSelections,
  onIntegrateItem
}) => {
  // Extract key terms from content
  const extractKeyTerms = (text: string): string[] => {
    // Remove common words and extract meaningful terms
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text.match(/\b\w{4,}\b/g) || [];
    return words
      .filter(word => !commonWords.includes(word.toLowerCase()))
      .slice(0, 5); // Take first 5 meaningful words
  };

  // Check if SERP item is used in content
  const checkIfItemIsUsed = (text: string, item: SerpSelection): boolean => {
    if (!text || !item.content) return false;
    
    const itemContent = item.content.toLowerCase();
    const contentLower = text.toLowerCase();
    
    // Extract key terms from the SERP item
    const keyTerms = extractKeyTerms(itemContent);
    
    // Check if at least 2 key terms are present in content
    const foundTerms = keyTerms.filter(term => 
      contentLower.includes(term.toLowerCase())
    );
    
    return foundTerms.length >= Math.min(2, keyTerms.length);
  };

  // Generate suggestions for unused items
  const generateSuggestion = (item: SerpSelection): string => {
    const type = item.type;
    
    switch (type) {
      case 'people_also_ask':
        return `Add a FAQ section addressing: "${item.content.slice(0, 60)}..."`;
      case 'related_searches':
        return `Include content about: "${item.content}"`;
      case 'headings':
        return `Consider adding a section with heading: "${item.content}"`;
      case 'entities':
        return `Mention or explain: "${item.content}"`;
      case 'content_gaps':
        return `Address the content gap: "${item.content.slice(0, 60)}..."`;
      default:
        return `Integrate: "${item.content.slice(0, 60)}..."`;
    }
  };

  // Analyze SERP integration
  const analysis = useMemo((): IntegrationAnalysis => {
    const selectedItems = serpSelections.filter(item => item.selected);
    
    if (!selectedItems.length) {
      return {
        totalSelected: 0,
        totalUsed: 0,
        usagePercentage: 100,
        usedItems: [],
        unusedItems: [],
        suggestions: []
      };
    }

    const usedItems: SerpSelection[] = [];
    const unusedItems: SerpSelection[] = [];
    const suggestions: string[] = [];

    selectedItems.forEach(item => {
      const isUsed = checkIfItemIsUsed(content, item);
      if (isUsed) {
        usedItems.push(item);
      } else {
        unusedItems.push(item);
        suggestions.push(generateSuggestion(item));
      }
    });

    const usagePercentage = selectedItems.length > 0 
      ? Math.round((usedItems.length / selectedItems.length) * 100) 
      : 100;

    return {
      totalSelected: selectedItems.length,
      totalUsed: usedItems.length,
      usagePercentage,
      usedItems,
      unusedItems,
      suggestions: suggestions.slice(0, 3) // Limit to 3 suggestions
    };
  }, [content, serpSelections]);

  // Get color for integration status
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get icon for SERP type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'people_also_ask': 
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
      case 'related_searches': 
        return <Search className="h-4 w-4 text-green-500" />;
      case 'headings': 
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'entities': 
        return <Tag className="h-4 w-4 text-orange-500" />;
      case 'content_gaps': 
        return <Wrench className="h-4 w-4 text-red-500" />;
      default: 
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col bg-background/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            SERP Integration
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(analysis.usagePercentage)} font-medium`}
          >
            {analysis.usagePercentage}%
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{analysis.totalUsed} of {analysis.totalSelected} items used</span>
          </div>
          <Progress 
            value={analysis.usagePercentage} 
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div 
            className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-green-500">{analysis.totalUsed}</div>
            <div className="text-xs text-muted-foreground">Used</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-red-500">{analysis.unusedItems.length}</div>
            <div className="text-xs text-muted-foreground">Unused</div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-primary">{analysis.usagePercentage}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </motion.div>
        </div>

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Integration Suggestions</span>
            </div>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {suggestion}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Unused Items */}
        {analysis.unusedItems.length > 0 && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Unused Items</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {analysis.unusedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 group hover:bg-orange-500/15 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-2">
                      {getTypeIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          {item.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-sm font-medium line-clamp-2">
                          {item.content.slice(0, 100)}
                          {item.content.length > 100 && '...'}
                        </div>
                      </div>
                      {onIntegrateItem && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onIntegrateItem(item)}
                        >
                          <Sparkles className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Perfect Integration Message */}
        {analysis.usagePercentage === 100 && analysis.totalSelected > 0 && (
          <motion.div
            className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-500">Perfect Integration!</div>
            <div className="text-xs text-muted-foreground">
              All selected SERP items are being used effectively
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
