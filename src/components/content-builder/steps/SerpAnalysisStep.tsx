
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpSelection } from '@/contexts/content-builder/types';
import { SerpAnalysisHeader } from '@/components/content-builder/serp/SerpAnalysisHeader';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, HelpCircle, Text, FileText, ChevronRight } from 'lucide-react';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, generateOutlineFromSelections } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [selectedTab, setSelectedTab] = useState('all');
  
  // Calculate selected counts
  const selectedCounts = {
    keyword: getSelectedCountByType('keyword'),
    question: getSelectedCountByType('question'),
    snippet: getSelectedCountByType('snippet'),
    competitor: getSelectedCountByType('competitor')
  };
  
  const totalSelected = Object.values(selectedCounts).reduce((acc, count) => acc + count, 0);
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };
  
  // Handle continuing with selected items
  const handleContinueWithSelections = () => {
    if (totalSelected === 0) return;
    
    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    
    // Generate outline from selections
    generateOutlineFromSelections();
  };
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Helper function to get selected count by type
  function getSelectedCountByType(type: string): number {
    return serpSelections.filter(item => item.type === type && item.selected).length;
  }
  
  // Helper function to get items by type
  function getItemsByType(type: string): SerpSelection[] {
    return serpSelections.filter(item => item.type === type);
  }
  
  return (
    <div className="space-y-6">
      <SerpAnalysisHeader
        mainKeyword={mainKeyword}
        isAnalyzing={isAnalyzing}
        totalSelected={totalSelected}
        handleReanalyze={handleReanalyze}
        handleContinueWithSelections={handleContinueWithSelections}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <SerpAnalysisPanel 
            serpData={serpData}
            isLoading={isAnalyzing}
            mainKeyword={mainKeyword}
            onAddToContent={(content, type) => {
              // Toggle item as selected
              handleToggleSelection(type, content);
            }}
          />
        </div>
        
        <div className="space-y-6">
          <Card className="bg-gray-950/50 border border-white/10 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Selected Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {totalSelected === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center mb-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <p className="text-sm">
                    No items selected yet
                  </p>
                  <p className="text-xs mt-1">
                    Select items from search results
                  </p>
                </div>
              ) : (
                <>
                  <Tabs defaultValue="all" onValueChange={setSelectedTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1 text-xs">
                        All ({totalSelected})
                      </TabsTrigger>
                      {selectedCounts.keyword > 0 && (
                        <TabsTrigger value="keywords" className="flex-1 text-xs">
                          Keywords ({selectedCounts.keyword})
                        </TabsTrigger>
                      )}
                      {selectedCounts.question > 0 && (
                        <TabsTrigger value="questions" className="flex-1 text-xs">
                          Q&A ({selectedCounts.question})
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                  
                  <div className="mt-4 space-y-4">
                    {(selectedTab === 'all' || selectedTab === 'keywords') && 
                     selectedCounts.keyword > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {getItemsByType('keyword')
                            .filter(item => item.selected)
                            .map((item, i) => (
                              <Badge 
                                key={i} 
                                variant="outline" 
                                className="bg-blue-950/30 hover:bg-blue-950/50 border-blue-500/30"
                              >
                                {item.content}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {(selectedTab === 'all' || selectedTab === 'questions') && 
                     selectedCounts.question > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Questions</h4>
                        <div className="space-y-2">
                          {getItemsByType('question')
                            .filter(item => item.selected)
                            .map((item, i) => (
                              <div key={i} className="p-2 rounded-md bg-purple-950/30 border border-purple-500/20 text-xs">
                                <div className="flex items-start gap-2">
                                  <HelpCircle className="h-3.5 w-3.5 text-purple-400 mt-0.5" />
                                  <span>{item.content}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTab === 'all' && selectedCounts.snippet > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Featured Snippets</h4>
                        <div className="space-y-2">
                          {getItemsByType('snippet')
                            .filter(item => item.selected)
                            .map((item, i) => (
                              <div key={i} className="p-2 rounded-md bg-amber-950/30 border border-amber-500/20 text-xs">
                                <div className="flex items-start gap-2">
                                  <Text className="h-3.5 w-3.5 text-amber-400 mt-0.5" />
                                  <span>{item.content.substring(0, 100)}...</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedTab === 'all' && selectedCounts.competitor > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Competitor Content</h4>
                        <div className="space-y-2">
                          {getItemsByType('competitor')
                            .filter(item => item.selected)
                            .map((item, i) => (
                              <div key={i} className="p-2 rounded-md bg-green-950/30 border border-green-500/20 text-xs">
                                <div className="flex items-start gap-2">
                                  <FileText className="h-3.5 w-3.5 text-green-400 mt-0.5" />
                                  <span>{item.content.substring(0, 100)}...</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                    disabled={totalSelected === 0}
                    onClick={handleContinueWithSelections}
                  >
                    Generate Outline <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
