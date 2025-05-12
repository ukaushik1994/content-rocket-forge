
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useContent } from '@/contexts/content';
import { KeywordUsage } from '@/contexts/content-builder/types/content-types';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtendedKeywordUsage {
  keyword: string;
  count: number;
  density: string;
  usageCount: number;
  isPrimary: boolean;
  usedIn: Array<{
    contentId: string;
    contentTitle: string;
    isPrimary: boolean;
    status: string;
  }>;
}

export function KeywordRepository() {
  const { contentItems, refreshContent } = useContent();
  const [keywordUsage, setKeywordUsage] = useState<ExtendedKeywordUsage[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');

  // Process content items to extract keywords and their usage
  useEffect(() => {
    const keywordMap = new Map<string, ExtendedKeywordUsage>();
    
    // Process each content item
    contentItems.forEach(item => {
      const mainKeyword = item.metadata?.mainKeyword;
      const secondaryKeywords = item.metadata?.secondaryKeywords || [];
      const contentTitle = item.title;
      const contentId = item.id;
      const contentStatus = item.status;
      
      // Add main keyword to the map if it exists
      if (mainKeyword) {
        if (!keywordMap.has(mainKeyword)) {
          keywordMap.set(mainKeyword, {
            keyword: mainKeyword,
            count: 0,
            density: "0%",
            usageCount: 0,
            isPrimary: true,
            usedIn: []
          });
        }
        
        const keywordData = keywordMap.get(mainKeyword)!;
        keywordData.usageCount++;
        keywordData.usedIn.push({
          contentId,
          contentTitle,
          isPrimary: true,
          status: contentStatus
        });
      }
      
      // Add secondary keywords to the map if they exist
      secondaryKeywords.forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, {
            keyword,
            count: 0,
            density: "0%",
            usageCount: 0,
            isPrimary: false,
            usedIn: []
          });
        }
        
        const keywordData = keywordMap.get(keyword)!;
        keywordData.usageCount++;
        keywordData.usedIn.push({
          contentId,
          contentTitle,
          isPrimary: false,
          status: contentStatus
        });
      });
    });
    
    // Convert map to array and sort by usage count (descending)
    const sortedKeywords = Array.from(keywordMap.values())
      .sort((a, b) => b.usageCount - a.usageCount);
    
    setKeywordUsage(sortedKeywords);
  }, [contentItems]);

  // Filter keywords based on selected tab
  const getFilteredKeywords = () => {
    switch(selectedTab) {
      case 'primary':
        return keywordUsage.filter(k => k.isPrimary);
      case 'secondary':
        return keywordUsage.filter(k => !k.isPrimary);
      case 'all':
      default:
        return keywordUsage;
    }
  };

  const handleRefresh = () => {
    refreshContent();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Keyword Repository</CardTitle>
            <CardDescription>
              Track keywords used across your content
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Keywords ({keywordUsage.length})</TabsTrigger>
            <TabsTrigger value="primary">Primary ({keywordUsage.filter(k => k.isPrimary).length})</TabsTrigger>
            <TabsTrigger value="secondary">Secondary ({keywordUsage.filter(k => !k.isPrimary).length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab}>
            {getFilteredKeywords().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No {selectedTab !== 'all' ? selectedTab : ''} keywords found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredKeywords().map((keyword) => (
                  <div key={keyword.keyword} className="border border-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{keyword.keyword}</h4>
                        <Badge variant={keyword.isPrimary ? "default" : "outline"}>
                          {keyword.isPrimary ? 'Primary' : 'Secondary'}
                        </Badge>
                      </div>
                      <Badge variant="secondary">Used {keyword.usageCount} times</Badge>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Used in:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {keyword.usedIn.map((usage, idx) => (
                          <div 
                            key={`${usage.contentId}-${idx}`} 
                            className="text-sm flex items-center gap-1"
                          >
                            <Badge 
                              variant="outline" 
                              className="text-xs font-normal"
                            >
                              {usage.status}
                            </Badge>
                            <span className="truncate">{usage.contentTitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
