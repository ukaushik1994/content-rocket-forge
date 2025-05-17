
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentItemType } from '@/contexts/content/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, ArrowRight, CheckCircle2, PlusCircle, RefreshCw } from 'lucide-react';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InterLinkingSuggestionsProps {
  content: ContentItemType;
}

export const InterLinkingSuggestions: React.FC<InterLinkingSuggestionsProps> = ({ content }) => {
  const { contentItems } = useContent();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('relevant');
  
  // Generate interlinking suggestions based on content keywords and other content
  useEffect(() => {
    generateSuggestions();
  }, [content, contentItems]);
  
  const generateSuggestions = () => {
    setIsLoading(true);
    
    try {
      // Filter out the current content
      const otherContent = contentItems.filter(item => item.id !== content.id);
      
      // Extract keywords from the current content
      const keywords = content.metadata?.mainKeyword 
        ? [content.metadata.mainKeyword, ...(content.metadata.secondaryKeywords || [])]
        : [];
      
      // Find relevant content by matching keywords
      const relevantContent = otherContent.filter(item => {
        const itemKeywords = item.metadata?.mainKeyword 
          ? [item.metadata.mainKeyword, ...(item.metadata.secondaryKeywords || [])]
          : [];
        
        return itemKeywords.some(kw => 
          keywords.some(keyword => 
            keyword && kw && keyword.toLowerCase().includes(kw.toLowerCase()) || 
            kw.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      });
      
      // Find popular content (placeholder - in a real app this would be based on metrics)
      const popularContent = [...otherContent]
        .sort((a, b) => (b.metadata?.seoScore || 0) - (a.metadata?.seoScore || 0))
        .slice(0, 5);
      
      // Find recent content
      const recentContent = [...otherContent]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setSuggestions({
        relevant: relevantContent,
        popular: popularContent,
        recent: recentContent
      });
    } catch (error) {
      console.error('Error generating interlinking suggestions:', error);
      toast.error('Failed to generate interlinking suggestions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = () => {
    generateSuggestions();
    toast.success('Refreshed interlinking suggestions');
  };
  
  const renderContentCard = (item: ContentItemType) => {
    return (
      <Card key={item.id} className="mb-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-md font-medium mb-1">{item.title}</h3>
              <div className="flex gap-1 mb-2 flex-wrap">
                {item.metadata?.mainKeyword && (
                  <Badge variant="outline" className="bg-blue-900/30 border-blue-500/30 text-blue-300 text-xs">
                    {item.metadata.mainKeyword}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">
                {item.content?.substring(0, 120)}...
              </p>
            </div>
            <Button size="sm" className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/10">
              <Link className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Card className="border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/10">
        <CardTitle className="text-md flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
            <Link className="h-4 w-4 text-white" />
          </div>
          Content Interlinking Suggestions
        </CardTitle>
        
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-1">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="relevant" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="relevant">
              Most Relevant
            </TabsTrigger>
            <TabsTrigger value="popular">
              Popular
            </TabsTrigger>
            <TabsTrigger value="recent">
              Recent
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <TabsContent value="relevant" className="mt-0">
                  {suggestions.relevant?.length > 0 ? (
                    suggestions.relevant.map(renderContentCard)
                  ) : (
                    <div className="text-center py-8 bg-white/5 border border-white/10 rounded-lg">
                      <Link className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">No relevant content found to link to</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="popular" className="mt-0">
                  {suggestions.popular?.length > 0 ? (
                    suggestions.popular.map(renderContentCard)
                  ) : (
                    <div className="text-center py-8 bg-white/5 border border-white/10 rounded-lg">
                      <Link className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">No popular content found to link to</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0">
                  {suggestions.recent?.length > 0 ? (
                    suggestions.recent.map(renderContentCard)
                  ) : (
                    <div className="text-center py-8 bg-white/5 border border-white/10 rounded-lg">
                      <Link className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">No recent content found to link to</p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
