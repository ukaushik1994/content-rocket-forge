
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { searchKeywords } from '@/services/serpApiService';
import { KeywordsList } from '@/components/keywords/KeywordsList';
import { ContentCluster } from '@/contexts/ContentBuilderContext';

// Mock data for clusters until we integrate with backend
const mockClusters: ContentCluster[] = [
  {
    id: '1',
    name: 'SEO Optimization',
    keywords: ['seo strategy', 'keyword research', 'backlink building', 'content optimization']
  },
  {
    id: '2',
    name: 'Content Marketing',
    keywords: ['blog strategy', 'content planning', 'editorial calendar', 'content distribution']
  },
  {
    id: '3',
    name: 'Social Media',
    keywords: ['social media marketing', 'engagement strategies', 'social analytics', 'platform optimization']
  }
];

export const KeywordSelectionStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { mainKeyword, selectedKeywords, selectedCluster } = state;
  
  const [keyword, setKeyword] = useState(mainKeyword || '');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>(mockClusters);
  const [activeTab, setActiveTab] = useState('research');

  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
    }
  }, [mainKeyword, selectedKeywords]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error('Please enter a keyword to search');
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchKeywords({ query: keyword });
      // Extract keywords from search results
      const extractedKeywords = results.map(result => 
        result.title
          .replace(/Best|Top|Guide to|How to|Why|What is|[0-9]+/gi, '')
          .trim()
          .split(' ')
          .slice(0, 3)
          .join(' ')
      );
      
      // Filter out duplicates and very short keywords
      const filteredKeywords = [...new Set(extractedKeywords)]
        .filter(k => k.length > 3)
        .slice(0, 10);
      
      setSuggestions(filteredKeywords);
      
      // Set the main keyword
      dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
      
      // Add it to selected keywords if not already there
      if (!selectedKeywords.includes(keyword)) {
        dispatch({ type: 'ADD_KEYWORD', payload: keyword });
      }
      
      toast.success('Keyword search complete');
    } catch (error) {
      console.error('Error searching keywords:', error);
      toast.error('Failed to search keywords');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddKeyword = (kw: string) => {
    dispatch({ type: 'ADD_KEYWORD', payload: kw });
  };

  const handleRemoveKeyword = (kw: string) => {
    dispatch({ type: 'REMOVE_KEYWORD', payload: kw });
  };

  const handleSelectCluster = (cluster: ContentCluster) => {
    dispatch({ type: 'SELECT_CLUSTER', payload: cluster });
    toast.success(`Selected cluster: ${cluster.name}`);
  };

  const handleClearCluster = () => {
    dispatch({ type: 'SELECT_CLUSTER', payload: null });
    toast.success('Cluster selection cleared');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="research">Keyword Research</TabsTrigger>
          <TabsTrigger value="clusters">My Clusters</TabsTrigger>
          <TabsTrigger value="saved">Saved Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="main-keyword">Main Keyword</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="main-keyword"
                    placeholder="Enter your main keyword..."
                    className="pl-9"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !keyword.trim()}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Suggested Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                        onClick={() => handleAddKeyword(suggestion)}
                      >
                        {suggestion}
                        <Plus className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No keywords selected yet.</p>
                  ) : (
                    selectedKeywords.map((kw, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {kw}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveKeyword(kw)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cluster) => (
              <Card 
                key={cluster.id} 
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedCluster?.id === cluster.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleSelectCluster(cluster)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex justify-between">
                    <span>{cluster.name}</span>
                    {selectedCluster?.id === cluster.id && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearCluster();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cluster.keywords.map((kw, idx) => (
                      <Badge key={idx} variant="outline">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="pt-4">
          <KeywordsList selectMode={true} onSelect={handleAddKeyword} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
