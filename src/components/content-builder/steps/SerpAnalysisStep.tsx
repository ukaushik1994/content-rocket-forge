
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';
import { Loader2, Check, BookOpen, ListChecks, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const SerpAnalysisStep = () => {
  const { state, dispatch, analyzeKeyword, addContentFromSerp, generateOutlineFromSelections, navigateToStep } = useContentBuilder();
  const { mainKeyword, serpData, isAnalyzing, serpSelections } = state;
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Automatically start analysis if we have a mainKeyword but no serpData
    if (mainKeyword && !serpData && !isAnalyzing) {
      analyzeKeyword(mainKeyword);
    }
    
    // Mark as complete if we have serpData
    if (serpData) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    }
  }, [mainKeyword, serpData, isAnalyzing]);
  
  const handleReanalyze = () => {
    if (mainKeyword) {
      analyzeKeyword(mainKeyword);
    } else {
      toast.error('No keyword selected for analysis');
    }
  };

  const handleToggleSelection = (type: string, content: string) => {
    dispatch({ 
      type: 'TOGGLE_SERP_SELECTION', 
      payload: { type, content } 
    });
  };

  const handleContinueWithSelections = () => {
    const selectedCount = serpSelections.filter(item => item.selected).length;
    
    if (selectedCount === 0) {
      toast.warning('Please select at least one item to continue');
      return;
    }
    
    generateOutlineFromSelections();
  };
  
  // Count selected items by type
  const selectedCounts = {
    question: serpSelections.filter(s => s.type === 'question' && s.selected).length,
    keyword: serpSelections.filter(s => s.type === 'keyword' && s.selected).length,
    snippet: serpSelections.filter(s => s.type === 'snippet' && s.selected).length,
    competitor: serpSelections.filter(s => s.type === 'competitor' && s.selected).length,
  };

  const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0);

  // Get serp data by type
  const getItemsByType = (type: string) => {
    return serpSelections.filter(item => item.type === type);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">SERP Analysis for: {mainKeyword}</h3>
          <p className="text-sm text-muted-foreground">
            Analyze search engine results to optimize your content.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleReanalyze}
            variant="outline"
            disabled={isAnalyzing || !mainKeyword}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Refresh Analysis'
            )}
          </Button>
          
          <Button
            onClick={handleContinueWithSelections}
            disabled={totalSelected === 0 || isAnalyzing}
            className={`gap-2 ${totalSelected > 0 ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''}`}
          >
            <ListChecks className="h-4 w-4" />
            Continue with Selections ({totalSelected})
          </Button>
        </div>
      </div>
      
      {isAnalyzing ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h3 className="font-medium">Analyzing search results for "{mainKeyword}"</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This may take a moment. We're gathering valuable data to help optimize your content.
            </p>
          </div>
        </div>
      ) : serpData ? (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">
              Questions
              {selectedCounts.question > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.question}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="keywords">
              Keywords
              {selectedCounts.keyword > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.keyword}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="snippets">
              Snippets
              {selectedCounts.snippet > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.snippet}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="competitors">
              Competitors
              {selectedCounts.competitor > 0 && (
                <Badge variant="secondary" className="ml-2">{selectedCounts.competitor}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Keyword Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Search Volume:</span>
                      <span className="font-medium">{serpData.searchVolume || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Difficulty:</span>
                      <span className="font-medium">{serpData.keywordDifficulty || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Competition:</span>
                      <span className="font-medium">{serpData.competitionScore || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Content Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {serpData.recommendations && serpData.recommendations.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {serpData.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm">{recommendation}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recommendations available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Selected Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {totalSelected > 0 ? (
                    <div className="space-y-4">
                      {selectedCounts.question > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Questions ({selectedCounts.question})</h4>
                          <div className="flex flex-wrap gap-2">
                            {getItemsByType('question').filter(item => item.selected).map((item, i) => (
                              <Badge key={i} variant="outline" className="flex items-center gap-1">
                                {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                                <button 
                                  onClick={() => handleToggleSelection(item.type, item.content)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedCounts.keyword > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Keywords ({selectedCounts.keyword})</h4>
                          <div className="flex flex-wrap gap-2">
                            {getItemsByType('keyword').filter(item => item.selected).map((item, i) => (
                              <Badge key={i} variant="outline" className="flex items-center gap-1 bg-blue-50">
                                {item.content}
                                <button 
                                  onClick={() => handleToggleSelection(item.type, item.content)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedCounts.snippet > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Snippets ({selectedCounts.snippet})</h4>
                          <div className="flex flex-wrap gap-2">
                            {getItemsByType('snippet').filter(item => item.selected).map((item, i) => (
                              <Badge key={i} variant="outline" className="flex items-center gap-1 bg-green-50">
                                {item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content}
                                <button 
                                  onClick={() => handleToggleSelection(item.type, item.content)}
                                  className="ml-1 text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No items selected yet. Browse through the tabs to select content for your outline.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardContent className="pt-6">
                {serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0 ? (
                  <div className="space-y-4">
                    {getItemsByType('question').map((item, index) => (
                      <div key={index} className="flex items-start gap-3 border-b pb-4 last:border-0">
                        <Checkbox 
                          id={`question-${index}`} 
                          checked={item.selected}
                          onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={`question-${index}`}
                            className="font-medium cursor-pointer"
                          >
                            {item.content}
                          </Label>
                          {item.source && (
                            <p className="text-xs text-muted-foreground">Source: {item.source}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No questions available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keywords">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getItemsByType('keyword').map((item, index) => (
                    <div key={index} className="flex items-center border rounded-md p-3">
                      <Checkbox 
                        id={`keyword-${index}`} 
                        checked={item.selected}
                        onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                        className="mr-3"
                      />
                      <Label htmlFor={`keyword-${index}`} className="cursor-pointer flex-1">
                        {item.content}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {getItemsByType('keyword').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No keywords available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="snippets">
            <Card>
              <CardContent className="pt-6">
                {getItemsByType('snippet').length > 0 ? (
                  <div className="space-y-4">
                    {getItemsByType('snippet').map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start mb-3">
                          <Checkbox 
                            id={`snippet-${index}`} 
                            checked={item.selected}
                            onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="text-sm mb-2">{item.content}</div>
                            {item.source && (
                              <div className="text-xs text-muted-foreground">Source: {item.source}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addContentFromSerp(item.content, "snippet")}
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add to Content
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No snippets available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="competitors">
            <Card>
              <CardContent className="pt-6">
                {getItemsByType('competitor').length > 0 ? (
                  <div className="space-y-4">
                    {getItemsByType('competitor').map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start mb-3">
                          <Checkbox 
                            id={`competitor-${index}`} 
                            checked={item.selected}
                            onCheckedChange={() => handleToggleSelection(item.type, item.content)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="text-sm mb-2">{item.content}</div>
                            {item.source && (
                              <div className="text-xs text-muted-foreground">Source: {item.source}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No competitor data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No SERP data available yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Enter your primary keyword and run an analysis to get insights from search results.
            </p>
            <Button onClick={() => navigateToStep(0)}>Enter Keywords</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
