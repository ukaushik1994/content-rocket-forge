
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SerpAnalysisResult, SerpSelection } from '@/contexts/content-builder/types';
import { MetricsTab } from './tabs/MetricsTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { HeadingsTab } from './tabs/HeadingsTab';
import { ContentGapsTab } from './tabs/ContentGapsTab';
import { KeywordsTab } from './tabs/KeywordsTab';
import { TrendingUp, HelpCircle, Heading, Star, Tag, CheckCircle } from 'lucide-react';

interface SerpAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  serpData: SerpAnalysisResult | null;
  serpSelections: SerpSelection[];
  onToggleSelection: (type: string, content: string) => void;
  keyword: string;
}

export function SerpAnalysisModal({
  isOpen,
  onClose,
  serpData,
  serpSelections,
  onToggleSelection,
  keyword
}: SerpAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('metrics');
  
  if (!serpData) {
    return null;
  }

  const selectedCount = serpSelections.filter(item => item.selected).length;
  
  const tabs = [
    { id: 'metrics', label: 'Metrics', icon: TrendingUp, count: null },
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: serpData.peopleAlsoAsk?.length || 0 },
    { id: 'headings', label: 'Headings', icon: Heading, count: serpData.headings?.length || 0 },
    { id: 'gaps', label: 'Content Gaps', icon: Star, count: serpData.contentGaps?.length || 0 },
    { id: 'keywords', label: 'Keywords', icon: Tag, count: serpData.keywords?.length || 0 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              SERP Analysis: {keyword}
            </div>
            {selectedCount > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {selectedCount} selected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                <tab.icon className="h-3 w-3" />
                {tab.label}
                {tab.count !== null && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="metrics" className="mt-0">
              <MetricsTab serpData={serpData} />
            </TabsContent>
            
            <TabsContent value="questions" className="mt-0">
              <QuestionsTab 
                questions={serpData.peopleAlsoAsk || []}
                serpSelections={serpSelections}
                onToggleSelection={onToggleSelection}
              />
            </TabsContent>
            
            <TabsContent value="headings" className="mt-0">
              <HeadingsTab 
                headings={serpData.headings || []}
                serpSelections={serpSelections}
                onToggleSelection={onToggleSelection}
              />
            </TabsContent>
            
            <TabsContent value="gaps" className="mt-0">
              <ContentGapsTab 
                contentGaps={serpData.contentGaps || []}
                serpSelections={serpSelections}
                onToggleSelection={onToggleSelection}
              />
            </TabsContent>
            
            <TabsContent value="keywords" className="mt-0">
              <KeywordsTab 
                keywords={serpData.keywords || []}
                relatedSearches={serpData.relatedSearches || []}
                serpSelections={serpSelections}
                onToggleSelection={onToggleSelection}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedCount} items selected for content generation
          </div>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
