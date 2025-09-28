import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  Download,
  Filter,
  X,
  CheckCircle2,
  BarChart3,
  Tag,
  Target,
  HelpCircle,
  Sparkles,
  FileText,
  Heading,
  Newspaper
} from 'lucide-react';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from '@/hooks/use-toast';

interface SerpSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    title: string;
    description: string;
    count: number;
    data: any;
  };
  serpData: SerpAnalysisResult;
  onAddToContent: (content: string, type: string) => void;
}

export const SerpSectionModal: React.FC<SerpSectionModalProps> = ({
  isOpen,
  onClose,
  section,
  serpData,
  onAddToContent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSelected, setShowSelected] = useState(false);

  const getSectionIcon = (sectionId: string) => {
    const icons = {
      metrics: BarChart3,
      keywords: Tag,
      'content-gaps': Target,
      questions: HelpCircle,
      'featured-snippets': Sparkles,
      entities: FileText,
      headings: Heading,
      'top-stories': Newspaper
    };
    return icons[sectionId as keyof typeof icons] || FileText;
  };

  const getSectionData = () => {
    switch (section.id) {
      case 'keywords':
        return serpData.keywords || [];
      case 'content-gaps':
        return serpData.contentGaps || [];
      case 'questions':
        return serpData.peopleAlsoAsk || [];
      case 'featured-snippets':
        return serpData.featuredSnippets || [];
      case 'entities':
        return serpData.entities || [];
      case 'headings':
        return serpData.headings || [];
      case 'metrics':
        return [
          { 
            id: 'search-volume', 
            title: 'Search Volume', 
            value: serpData.searchVolume?.toLocaleString() || 'N/A',
            description: 'Monthly search volume'
          },
          { 
            id: 'difficulty', 
            title: 'Keyword Difficulty', 
            value: `${serpData.keywordDifficulty || 'N/A'}%`,
            description: 'Difficulty to rank for this keyword'
          },
          { 
            id: 'competition', 
            title: 'Competition Score', 
            value: serpData.competitionScore ? `${(serpData.competitionScore * 100).toFixed(0)}%` : 'N/A',
            description: 'Competition level analysis'
          }
        ];
      case 'top-stories':
        return [
          { title: 'Latest industry updates', source: 'Industry News' },
          { title: 'Trending topics', source: 'Social Media' },
          { title: 'Breaking news', source: 'News Sites' }
        ];
      default:
        return [];
    }
  };

  const formatItemContent = (item: any) => {
    if (typeof item === 'string') return item;
    if (item.question) return item.question;
    if (item.topic) return item.topic;
    if (item.text) return item.text;
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.query) return item.query;
    if (item.content) return item.content;
    return JSON.stringify(item);
  };

  const getItemId = (item: any, index: number) => {
    if (typeof item === 'string') return `${section.id}-${index}`;
    return item.id || item.question || item.topic || item.text || item.name || `${section.id}-${index}`;
  };

  const filteredData = getSectionData().filter(item => {
    if (!searchTerm) return true;
    const content = formatItemContent(item).toLowerCase();
    return content.includes(searchTerm.toLowerCase());
  }).filter(item => {
    if (!showSelected) return true;
    const itemId = getItemId(item, 0);
    return selectedItems.has(itemId);
  });

  const toggleItemSelection = (item: any, index: number) => {
    const itemId = getItemId(item, index);
    const newSelected = new Set(selectedItems);
    
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    
    setSelectedItems(newSelected);
  };

  const addSelectedToContent = () => {
    const dataItems = getSectionData();
    const selectedItemsData = dataItems.filter((item, index) => {
      const itemId = getItemId(item, index);
      return selectedItems.has(itemId);
    });

    selectedItemsData.forEach(item => {
      const content = formatItemContent(item);
      onAddToContent(content, section.id);
    });

    toast({
      title: "Items Added",
      description: `${selectedItemsData.length} items added to your content selections`,
    });

    setSelectedItems(new Set());
  };

  const addAllToContent = () => {
    const dataItems = getSectionData();
    dataItems.forEach(item => {
      const content = formatItemContent(item);
      onAddToContent(content, section.id);
    });

    toast({
      title: "All Items Added",
      description: `${dataItems.length} items added to your content selections`,
    });
  };

  const SectionIcon = getSectionIcon(section.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-border/50">
              <SectionIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {section.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {section.description} • {section.count} items found
              </DialogDescription>
            </div>
            <Badge variant="outline" className="ml-auto">
              {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </DialogHeader>

        {/* Controls */}
        <div className="p-6 pb-4 border-b border-border/50 bg-muted/30">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${section.title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant={showSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSelected(!showSelected)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showSelected ? 'Show All' : 'Show Selected'}
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
              variant="outline"
              size="sm"
              onClick={addSelectedToContent}
              disabled={selectedItems.size === 0}
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Selected ({selectedItems.size})
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={addAllToContent}
              className="whitespace-nowrap"
            >
              <Download className="h-4 w-4 mr-2" />
              Add All
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {filteredData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="text-muted-foreground">
                  {searchTerm ? `No items found matching "${searchTerm}"` : 'No items available'}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredData.map((item, index) => {
                  const itemId = getItemId(item, index);
                  const isSelected = selectedItems.has(itemId);
                  const content = formatItemContent(item);

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:border-primary/50 ${
                        isSelected 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-background/60 border-border/50'
                      }`}
                      onClick={() => toggleItemSelection(item, index)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item, index)}
                          className="mt-1"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground mb-1">
                            {content}
                          </div>
                          
                          {section.id === 'metrics' && typeof item === 'object' && 'description' in item && item.description && (
                            <div className="text-xs text-muted-foreground mb-2">
                              {item.description}
                            </div>
                          )}

                          {section.id === 'metrics' && typeof item === 'object' && 'value' in item && item.value && (
                            <Badge variant="outline" className="text-xs">
                              {item.value}
                            </Badge>
                          )}

                          {typeof item === 'object' && 'source' in item && item.source && (
                            <Badge variant="outline" className="text-xs mt-2">
                              {item.source}
                            </Badge>
                          )}

                          {typeof item === 'object' && 'type' in item && item.type && (
                            <Badge variant="outline" className="text-xs mt-2">
                              {item.type}
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToContent(content, section.id);
                            toast({
                              title: "Item Added",
                              description: "Added to your content selections",
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};