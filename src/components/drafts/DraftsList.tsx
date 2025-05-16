
import React from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function DraftsList() {
  const { contentItems, loading, deleteContentItem } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState('all');

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

  const handleEdit = (id: string) => {
    // Navigate to content builder with the selected draft
    navigate(`/content-builder`, { state: { contentId: id } });
  };

  const handleView = (id: string) => {
    // Navigate to draft preview with the selected draft
    toast.info('Preview functionality will be implemented soon');
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
              {getDisplayedItems().map(item => (
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
                    
                    {item.keywords && item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.keywords.map((keyword, idx) => (
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
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
