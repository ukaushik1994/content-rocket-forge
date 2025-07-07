
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SerpSelection } from '@/contexts/content-builder/types';
import { CheckCircle, X, Eye } from 'lucide-react';

interface SelectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
  onClearAll: () => void;
  onGenerateOutline: () => void;
}

export function SelectionManagerModal({
  isOpen,
  onClose,
  serpSelections,
  onToggleSelection,
  onClearAll,
  onGenerateOutline
}: SelectionManagerModalProps) {
  const [activeTab, setActiveTab] = useState('all');
  
  const selectedItems = serpSelections.filter(item => item.selected);
  const itemsByType = selectedItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, SerpSelection[]>);

  const tabs = [
    { id: 'all', label: 'All Selected', count: selectedItems.length },
    { id: 'question', label: 'Questions', count: (itemsByType.question || []).length + (itemsByType.peopleAlsoAsk || []).length },
    { id: 'heading', label: 'Headings', count: (itemsByType.heading || []).length },
    { id: 'keyword', label: 'Keywords', count: (itemsByType.keyword || []).length + (itemsByType.relatedSearch || []).length },
    { id: 'contentGap', label: 'Content Gaps', count: (itemsByType.contentGap || []).length }
  ];

  const renderSelectionItem = (item: SerpSelection) => (
    <Card key={`${item.type}-${item.content}`} className="mb-3">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
            <p className="text-sm">{item.content}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleSelection(item.type, item.content)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const getItemsForTab = (tabId: string) => {
    switch (tabId) {
      case 'all':
        return selectedItems;
      case 'question':
        return [...(itemsByType.question || []), ...(itemsByType.peopleAlsoAsk || [])];
      case 'heading':
        return itemsByType.heading || [];
      case 'keyword':
        return [...(itemsByType.keyword || []), ...(itemsByType.relatedSearch || [])];
      case 'contentGap':
        return itemsByType.contentGap || [];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Selection Manager
            </div>
            <Badge variant="secondary">
              {selectedItems.length} items
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items selected</h3>
            <p className="text-muted-foreground">
              Select items from the SERP analysis to include in your content generation
            </p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-5">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                    {tab.label}
                    {tab.count > 0 && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <div className="space-y-3">
                      {getItemsForTab(tab.id).map(renderSelectionItem)}
                    </div>
                  </TabsContent>
                ))}
              </ScrollArea>
            </Tabs>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClearAll}
                className="text-red-500 hover:text-red-700"
              >
                Clear All
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onGenerateOutline}>
                  Generate Outline
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
