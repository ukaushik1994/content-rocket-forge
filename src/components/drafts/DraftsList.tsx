
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, RefreshCcw, List, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
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

  // Check for updates from content builder
  useEffect(() => {
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    if (contentDraftSaved === 'true') {
      refreshContent();
      sessionStorage.removeItem('content_draft_saved');
    }
  }, [refreshContent]);

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

  const handleEdit = (id: string) => {
    // Navigate to content builder with the selected draft
    navigate(`/content-builder`, { state: { contentId: id } });
  };

  const handleView = (id: string) => {
    // If we have a detail view handler, use it
    const itemToView = contentItems.find(item => item.id === id);
    if (onOpenDetailView && itemToView) {
      onOpenDetailView(itemToView);
    } else {
      // Fallback to toast
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

  const handleRefresh = () => {
    refreshContent();
    toast.info('Refreshing content...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-opacity-50 rounded-full"></div>
      </div>
    );
  }

  const displayedItems = getDisplayedItems();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedItems.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          className="ml-2 gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {renderContentItems(displayedItems)}
    </div>
  );

  // Helper function to render content items
  function renderContentItems(items: any[]) {
    if (items.length === 0) {
      return (
        <div className="bg-card/40 border border-border rounded-lg p-8 text-center">
          <p className="text-lg font-medium">No {selectedTab === 'all' ? 'content items' : selectedTab} found</p>
          <p className="text-muted-foreground mt-2">
            Create content in the builder to see it here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
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
              <div className="line-clamp-3 text-sm opacity-80">
                {item.content ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: item.content?.substring(0, 150) + '...'
                  }} />
                ) : (
                  <span className="text-muted-foreground italic">No content</span>
                )}
              </div>
              
              {/* Display keywords */}
              {item.keywords && item.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.keywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Display SERP selection count if available */}
              {item.metadata?.serpSelections && item.metadata.serpSelections.length > 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  <span>{item.metadata.serpSelections.filter((s: any) => s.selected).length} SERP selections</span>
                </div>
              )}
              
              {/* Display outline count if available */}
              {item.metadata?.outline && item.metadata.outline.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <List className="h-3 w-3" />
                  <span>{item.metadata.outline.length} outline sections</span>
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
        ))}
      </div>
    );
  }
}
