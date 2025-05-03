
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search, FileText, X } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';
import { QuestionsGroup, KeywordsGroup, SnippetsGroup } from '@/components/content-builder/serp/overview/SelectedItemsGroup';

interface SelectedItemsSidebarProps {
  serpSelections: SerpSelection[];
  totalSelected: number;
  selectedCounts: {
    keyword: number;
    question: number;
    snippet: number;
    competitor: number;
  };
  handleToggleSelection: (type: string, content: string) => void;
  handleContinueWithSelections: () => void;
}

export function SelectedItemsSidebar({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection,
  handleContinueWithSelections
}: SelectedItemsSidebarProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Helper function to get items by type
  function getItemsByType(type: string): SerpSelection[] {
    return serpSelections.filter(item => item.type === type);
  }
  
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 backdrop-blur-lg shadow-xl sticky top-4">
      <CardHeader className="pb-2 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/20">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full">
            <Search className="h-3.5 w-3.5 text-white" />
          </div>
          Selected Items
          {totalSelected > 0 && (
            <Badge variant="secondary" className="bg-white/10 text-xs">
              {totalSelected}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {totalSelected === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground flex flex-col items-center"
          >
            <span className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mb-2">
              <Search className="h-4 w-4 text-white/60" />
            </span>
            <p className="text-sm">
              No items selected yet
            </p>
            <p className="text-xs mt-1 text-muted-foreground/70">
              Select items from search results
            </p>
          </motion.div>
        ) : (
          <>
            <Tabs defaultValue="all" onValueChange={setSelectedTab}>
              <TabsList className="w-full bg-white/5 border border-white/10">
                <TabsTrigger value="all" className="flex-1 text-xs data-[state=active]:bg-white/10">
                  All ({totalSelected})
                </TabsTrigger>
                {selectedCounts.keyword > 0 && (
                  <TabsTrigger value="keywords" className="flex-1 text-xs data-[state=active]:bg-white/10">
                    Keywords ({selectedCounts.keyword})
                  </TabsTrigger>
                )}
                {selectedCounts.question > 0 && (
                  <TabsTrigger value="questions" className="flex-1 text-xs data-[state=active]:bg-white/10">
                    Q&A ({selectedCounts.question})
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
            
            <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
              {(selectedTab === 'all' || selectedTab === 'keywords') && 
                selectedCounts.keyword > 0 && (
                <KeywordsGroup
                  count={selectedCounts.keyword}
                  items={getItemsByType('keyword')}
                  handleToggleSelection={handleToggleSelection}
                />
              )}
              
              {(selectedTab === 'all' || selectedTab === 'questions') && 
                selectedCounts.question > 0 && (
                <QuestionsGroup
                  count={selectedCounts.question}
                  items={getItemsByType('question')}
                  handleToggleSelection={handleToggleSelection}
                />
              )}
              
              {selectedTab === 'all' && selectedCounts.snippet > 0 && (
                <SnippetsGroup
                  count={selectedCounts.snippet}
                  items={getItemsByType('snippet')}
                  handleToggleSelection={handleToggleSelection}
                />
              )}
              
              {selectedTab === 'all' && selectedCounts.competitor > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-green-400" />
                    Competitor Content ({selectedCounts.competitor})
                  </h4>
                  <div className="space-y-2">
                    {getItemsByType('competitor')
                      .filter(item => item.selected)
                      .map((item, i) => (
                        <div key={i} className="p-2 rounded-md bg-green-950/30 border border-green-500/20 text-xs group">
                          <div className="flex items-start gap-2 justify-between">
                            <div className="flex items-start gap-2">
                              <FileText className="h-3.5 w-3.5 text-green-400 mt-0.5" />
                              <span>{item.content.substring(0, 100)}...</span>
                            </div>
                            <button 
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                              onClick={() => handleToggleSelection(item.type, item.content)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              className="w-full mt-6 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
              disabled={totalSelected === 0}
              onClick={handleContinueWithSelections}
            >
              Generate Outline <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
