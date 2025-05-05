
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search, FileText, X, ListPlus, Sparkles, CheckCircle, Tag, Heading, FileSearch } from 'lucide-react';
import { SerpSelection } from '@/contexts/content-builder/types';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionsGroup, KeywordsGroup, SnippetsGroup } from '@/components/content-builder/serp/overview/SelectedItemsGroup';

interface SelectedItemsSidebarProps {
  serpSelections: SerpSelection[];
  totalSelected: number;
  selectedCounts: {
    keyword: number;
    question: number;
    snippet: number;
    competitor: number; // Kept for backward compatibility
    entity: number;
    heading: number;
    contentGap: number;
    topRank: number;
  };
  handleToggleSelection: (type: string, content: string) => void;
}

export function SelectedItemsSidebar({
  serpSelections,
  totalSelected,
  selectedCounts,
  handleToggleSelection
}: SelectedItemsSidebarProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Helper function to get items by type
  function getItemsByType(type: string): SerpSelection[] {
    return serpSelections.filter(item => item.type === type);
  }
  
  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/10 border border-white/10 backdrop-blur-lg shadow-xl sticky top-4">
      <CardHeader className="pb-2 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full">
              <ListPlus className="h-3.5 w-3.5 text-white" />
            </div>
            Selected Items
            {totalSelected > 0 && (
              <Badge variant="secondary" className="bg-white/10 text-xs">
                {totalSelected}
              </Badge>
            )}
          </CardTitle>
          
          {totalSelected > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 text-xs text-emerald-400 font-medium"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Ready
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {totalSelected === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-muted-foreground flex flex-col items-center"
            >
              <span className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-white/40" />
              </span>
              <p className="text-sm font-medium text-white/70">
                No items selected yet
              </p>
              <p className="text-xs mt-2 text-white/50 max-w-[200px]">
                Select keywords, questions, and snippets from the search results to generate your content outline
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
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

                {/* New Entity Group */}
                {selectedTab === 'all' && selectedCounts.entity > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-indigo-400" />
                      Entities ({selectedCounts.entity})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemsByType('entity')
                        .filter(item => item.selected)
                        .map((item, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-500/30 group"
                          >
                            {item.content}
                            <button 
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                              onClick={() => handleToggleSelection(item.type, item.content)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* New Heading Group */}
                {selectedTab === 'all' && selectedCounts.heading > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Heading className="h-3.5 w-3.5 text-teal-400" />
                      Headings ({selectedCounts.heading})
                    </h4>
                    <div className="space-y-2">
                      {getItemsByType('heading')
                        .filter(item => item.selected)
                        .map((item, i) => (
                          <div key={i} className="p-2 rounded-md bg-teal-950/30 border border-teal-500/20 text-xs group">
                            <div className="flex items-start gap-2 justify-between">
                              <div className="flex items-start gap-2">
                                <Heading className="h-3.5 w-3.5 text-teal-400 mt-0.5" />
                                <span>{item.content}</span>
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

                {/* New Content Gap Group */}
                {selectedTab === 'all' && selectedCounts.contentGap > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FileSearch className="h-3.5 w-3.5 text-rose-400" />
                      Content Gaps ({selectedCounts.contentGap})
                    </h4>
                    <div className="space-y-2">
                      {getItemsByType('contentGap')
                        .filter(item => item.selected)
                        .map((item, i) => (
                          <div key={i} className="p-2 rounded-md bg-rose-950/30 border border-rose-500/20 text-xs group">
                            <div className="flex items-start gap-2 justify-between">
                              <div className="flex items-start gap-2">
                                <FileSearch className="h-3.5 w-3.5 text-rose-400 mt-0.5" />
                                <span>{item.content}</span>
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

                {/* Top Ranks Group (renamed from competitors) - updated to handle both properties */}
                {selectedTab === 'all' && (selectedCounts.topRank > 0 || selectedCounts.competitor > 0) && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-green-400" />
                      Top Ranks ({selectedCounts.topRank || selectedCounts.competitor})
                    </h4>
                    <div className="space-y-2">
                      {getItemsByType('topRank')
                        .filter(item => item.selected)
                        .map((item, i) => (
                          <div key={i} className="p-2 rounded-md bg-green-950/30 border border-green-500/20 text-xs group">
                            <div className="flex items-start gap-2 justify-between">
                              <div className="flex items-start gap-2">
                                <FileText className="h-3.5 w-3.5 text-green-400 mt-0.5" />
                                <span>{item.content}</span>
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
              
              {/* Generate Outline button has been removed */}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
