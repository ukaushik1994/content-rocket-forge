
import React, { useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function DraftsList() {
  const { contentItems, loading, deleteContentItem } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');

  // Filter drafts from content items
  const drafts = contentItems.filter(item => item.status === 'draft');
  const publishedItems = contentItems.filter(item => item.status === 'published');

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Function to get displayed items based on selected tab
  const getDisplayedItems = () => {
    switch(selectedTab) {
      case 'drafts':
        return drafts;
      case 'published':
        return publishedItems;
      case 'all':
      default:
        return contentItems;
    }
  };

  // Get metadata from content item
  const getMetadata = (item: any) => {
    if (!item.metadata) return { metaTitle: null, metaDescription: null };
    
    try {
      // Handle both string and object metadata formats
      const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
      
      return {
        metaTitle: metadata.metaTitle || null,
        metaDescription: metadata.metaDescription || null
      };
    } catch (error) {
      console.error("Failed to parse metadata:", error);
      return { metaTitle: null, metaDescription: null };
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to content builder with the selected draft
    navigate(`/content-builder`, { state: { contentId: id } });
  };

  const handleView = (id: string) => {
    // Open the draft detail view
    const item = contentItems.find(item => item.id === id);
    if (item) {
      navigate(`/drafts`, { state: { selectedDraft: item } });
    } else {
      toast.info('Preview functionality will be implemented soon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContentItem(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-opacity-50 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
          <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-0">
          {getDisplayedItems().length === 0 ? (
            <div className="bg-card/40 border border-border rounded-lg p-8 text-center">
              <p className="text-lg font-medium">No {selectedTab === 'all' ? 'content items' : selectedTab} found</p>
              <p className="text-muted-foreground mt-2">
                Create content in the builder to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getDisplayedItems().map(item => {
                const { metaTitle, metaDescription } = getMetadata(item);
                
                return (
                  <Card key={item.id} className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                        <Badge variant={item.status === 'draft' ? 'outline' : 'default'}>
                          {item.status === 'draft' ? 'Draft' : 'Published'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs mt-2">
                        <span>Created: {formatDate(item.created_at)}</span>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="line-clamp-2 text-sm opacity-80 mb-2">
                        {item.content ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: item.content?.substring(0, 100) + '...'
                          }} />
                        ) : (
                          <span className="text-muted-foreground italic">No content</span>
                        )}
                      </div>
                      
                      {/* Meta information section */}
                      {(metaTitle || metaDescription) && (
                        <div className="mt-3 p-2 rounded-md bg-secondary/10 border border-secondary/20">
                          <div className="flex items-center gap-1 mb-1 text-xs font-medium">
                            <FileText className="h-3 w-3" />
                            <span>SEO Meta Information</span>
                          </div>
                          {metaTitle && (
                            <div className="text-xs mb-1">
                              <span className="font-medium">Title:</span> {metaTitle}
                            </div>
                          )}
                          {metaDescription && (
                            <div className="text-xs">
                              <span className="font-medium">Description:</span> {metaDescription.substring(0, 100)}{metaDescription.length > 100 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.keywords.map((keyword: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="pt-2 flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleView(item.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(item.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
