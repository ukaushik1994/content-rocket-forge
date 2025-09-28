import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  MessageCircleQuestion, 
  Heading2, 
  TrendingUp, 
  Trophy, 
  Tag,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CategoryItem {
  content: string;
  metadata?: any;
  selected?: boolean;
}

interface SerpCategory {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: CategoryItem[];
  color: string;
}

interface SimplifiedSerpCategoriesProps {
  serpData: any;
  onToggleSelection: (type: string, content: string) => void;
  selectedItems: Set<string>;
}

export const SimplifiedSerpCategories: React.FC<SimplifiedSerpCategoriesProps> = ({
  serpData,
  onToggleSelection,
  selectedItems
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Process SERP data into categories
  const categories: SerpCategory[] = [
    {
      id: 'keywords',
      title: 'Keywords',
      icon: Search,
      color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
      items: (serpData?.keywords || []).map((kw: any) => ({
        content: typeof kw === 'string' ? kw : kw.query || kw.keyword || String(kw),
        metadata: typeof kw === 'object' ? { volume: kw.volume } : undefined
      }))
    },
    {
      id: 'questions',
      title: 'Questions',
      icon: MessageCircleQuestion,
      color: 'bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
      items: (serpData?.peopleAlsoAsk || []).map((q: any) => ({
        content: q.question || String(q),
        metadata: { source: q.source }
      }))
    },
    {
      id: 'headings',
      title: 'Headings',
      icon: Heading2,
      color: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40',
      items: (serpData?.headings || []).map((h: any) => ({
        content: h.text || String(h),
        metadata: { level: h.level, subtext: h.subtext }
      }))
    },
    {
      id: 'contentGaps',
      title: 'Content Gaps',
      icon: TrendingUp,
      color: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
      items: (serpData?.contentGaps || []).map((gap: any) => ({
        content: gap.topic || gap.description || String(gap),
        metadata: { recommendation: gap.recommendation, opportunity: gap.opportunity }
      }))
    },
    {
      id: 'topResults',
      title: 'Top Results',
      icon: Trophy,
      color: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40',
      items: (serpData?.topResults || []).map((result: any) => ({
        content: result.title || String(result),
        metadata: { position: result.position, link: result.link, snippet: result.snippet }
      }))
    },
    {
      id: 'entities',
      title: 'Entities',
      icon: Tag,
      color: 'bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40',
      items: (serpData?.entities || []).map((entity: any) => ({
        content: entity.name || String(entity),
        metadata: { type: entity.type, description: entity.description }
      }))
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleItemSelection = (categoryId: string, content: string) => {
    onToggleSelection(categoryId, content);
  };

  const isSelected = (categoryId: string, content: string) => {
    return selectedItems.has(`${categoryId}-${content}`);
  };

  return (
    <div className="space-y-4">
      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const itemCount = category.items.length;
          const selectedCount = category.items.filter(item => 
            isSelected(category.id, item.content)
          ).length;
          
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${category.color} ${
                  expandedCategory === category.id ? 'ring-2 ring-primary/50' : ''
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className="h-8 w-8 text-foreground/70" />
                    <div>
                      <h3 className="font-medium text-sm">{category.title}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {itemCount}
                        </Badge>
                        {selectedCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {selectedCount} selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Category Content */}
      {expandedCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-primary/20">
            <Collapsible open={true}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5">
                  <div className="flex items-center gap-2">
                    {React.createElement(
                      categories.find(c => c.id === expandedCategory)?.icon || Search,
                      { className: "h-5 w-5 text-primary" }
                    )}
                    <h3 className="font-medium">
                      {categories.find(c => c.id === expandedCategory)?.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategory(null);
                    }}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-2">
                  {categories
                    .find(c => c.id === expandedCategory)
                    ?.items.slice(0, 20)
                    .map((item, index) => {
                      const selected = isSelected(expandedCategory, item.content);
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                            selected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border/50 hover:border-primary/20 hover:bg-accent/5'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.content}</p>
                            {item.metadata && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {Object.entries(item.metadata)
                                  .filter(([_, value]) => value)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' • ')}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={selected ? "default" : "ghost"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemSelection(expandedCategory, item.content);
                            }}
                            className="ml-2 h-8 w-8 p-0"
                          >
                            <Plus className={`h-4 w-4 ${selected ? 'rotate-45' : ''} transition-transform`} />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>
      )}
    </div>
  );
};