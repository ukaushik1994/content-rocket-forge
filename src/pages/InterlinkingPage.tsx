
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useContent } from '@/contexts/content';
import { ContentItemType } from '@/contexts/content/types';
import { Link, Search, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { InterLinkingSuggestions } from '@/components/approval/interlinking/InterLinkingSuggestions';

const InterlinkingPage: React.FC = () => {
  const { contentItems, updateContentItem } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredContent = contentItems.filter(item => {
    // Apply status filter
    if (filter !== 'all' && item.status !== filter) return false;
    
    // Apply search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleContentSelect = (item: ContentItemType) => {
    setSelectedContent(item);
  };
  
  const handleApplyInterlinking = async (sourceContent: ContentItemType, targetContent: ContentItemType, anchorText: string) => {
    try {
      setIsUpdating(true);
      
      // Create link using markdown syntax
      const linkMarkdown = `[${anchorText}](/content/${targetContent.id})`;
      
      // Simple approach: just append the link to the content
      // In a real implementation, this would be more sophisticated to insert at the right position
      const updatedContent = sourceContent.content + `\n\nRelated: ${linkMarkdown}`;
      
      await updateContentItem(sourceContent.id, { content: updatedContent });
      
      toast.success('Interlink added successfully');
    } catch (error) {
      toast.error('Failed to add interlink');
      console.error('Error adding interlink:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Content Interlinking | SEO Platform</title>
      </Helmet>
      
      <Navbar />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Content Interlinking</h1>
            <p className="text-muted-foreground mt-1">
              Connect your content to improve SEO and user navigation
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Selection Panel */}
          <Card className="lg:col-span-1 border border-white/10 bg-gradient-to-b from-gray-900/60 to-gray-800/60">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-white/10">
              <CardTitle className="text-md flex items-center">
                <Link className="h-4 w-4 mr-2 text-blue-400" />
                Your Content
              </CardTitle>
              
              <Tabs defaultValue={filter} onValueChange={setFilter} className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">All</TabsTrigger>
                  <TabsTrigger value="published" className="text-xs px-3">Published</TabsTrigger>
                  <TabsTrigger value="draft" className="text-xs px-3">Drafts</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  className="pl-8 bg-white/5 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {filteredContent.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredContent.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${selectedContent?.id === item.id ? 'bg-white/10' : ''}`}
                      onClick={() => handleContentSelect(item)}
                    >
                      <h3 className="font-medium mb-1 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.status === 'published' ? 'success' : 'outline'} className="text-xs">
                          {item.status}
                        </Badge>
                        {item.keywords && item.keywords.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {item.keywords[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No content found</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Interlinking Suggestions Panel */}
          <div className="lg:col-span-2">
            {selectedContent ? (
              <InterLinkingSuggestions content={selectedContent} />
            ) : (
              <Card className="h-full flex items-center justify-center border border-white/10 bg-gradient-to-br from-gray-900/60 to-gray-800/60">
                <CardContent className="text-center py-16">
                  <div className="rounded-full bg-white/5 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Link className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Select Content to See Interlinking Suggestions</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose a piece of content from the sidebar to get relevant interlinking suggestions
                    based on keywords and content similarity.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InterlinkingPage;
