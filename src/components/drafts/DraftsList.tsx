
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Edit, Trash2, RefreshCcw, List, Tag, Calendar, 
  Layers, Filter, Search, SortDesc, Grid2X2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RepurposeButton } from './RepurposeButton';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshCount, setRefreshCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    const timestamp = sessionStorage.getItem('content_save_timestamp');
    
    if (contentDraftSaved === 'true') {
      const toastId = toast.loading('Updating drafts list...');
      refreshContent().then(() => {
        toast.success('Drafts list updated', { id: toastId });
        setRefreshCount(prev => prev + 1);
      });
      
      sessionStorage.removeItem('content_draft_saved');
    }
  }, [refreshContent, contentItems.length]);

  // Function to get displayed items based on selected tab
  const getDisplayedItems = () => {
    let items;
    switch(selectedTab) {
      case 'drafts':
        items = drafts;
        break;
      case 'published':
        items = publishedItems;
        break;
      case 'all':
      default:
        items = contentItems;
        break;
    }
    
    // Apply search filter if there's a query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.content && item.content.toLowerCase().includes(query)) ||
        (item.keywords && item.keywords.some(k => k.toLowerCase().includes(query)))
      );
    }
    
    // Apply sorting
    return [...items].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      } else if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
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
    const toastId = toast.loading('Refreshing content...');
    refreshContent().then(() => {
      toast.success('Content refreshed successfully', { id: toastId });
      setRefreshCount(prev => prev + 1);
    });
  };

  // Check if an item has repurposed content
  const hasRepurposedContent = (item: any) => {
    return contentItems.some(content => 
      content.metadata?.originalContentId === item.id || 
      (content.metadata?.repurposedFrom && content.title.includes(item.title))
    );
  };

  // Get count of repurposed content for an item
  const getRepurposedCount = (item: any) => {
    return contentItems.filter(content => 
      content.metadata?.originalContentId === item.id || 
      (content.metadata?.repurposedFrom && content.title.includes(item.title))
    ).length;
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
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedItems.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full md:w-auto gap-2 items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Sort options">
                <SortDesc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('alpha')}>
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid2X2 className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            title="Refresh content"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
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
            {searchQuery ? 'Try a different search term or' : 'Create content in the builder to see it here.'}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
              Clear Search
            </Button>
          )}
        </div>
      );
    }

    return viewMode === 'grid' ? renderGridView(items) : renderListView(items);
  }

  function renderGridView(items: any[]) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card key={item.id} className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                <Badge variant={item.status === 'draft' ? 'outline' : 'default'}>
                  {item.status === 'draft' ? 'Draft' : 'Published'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs mt-2">
                <Calendar className="h-3 w-3" />
                <span>Updated: {formatDate(item.updated_at)}</span>
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
              
              {/* Metadata indicators */}
              <div className="flex flex-wrap gap-y-3 mt-3 text-xs">
                {/* Keywords */}
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 w-full">
                    {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {item.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.keywords.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* SERP and outline indicators */}
                <div className="flex gap-3 w-full">
                  {item.metadata?.serpSelections && item.metadata.serpSelections.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      <span>{item.metadata.serpSelections.filter((s: any) => s.selected).length} SERP</span>
                    </div>
                  )}
                  
                  {item.metadata?.outline && item.metadata.outline.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <List className="h-3 w-3" />
                      <span>{item.metadata.outline.length} sections</span>
                    </div>
                  )}
                  
                  {hasRepurposedContent(item) && (
                    <div className="flex items-center gap-1 text-primary">
                      <Layers className="h-3 w-3" />
                      <span>{getRepurposedCount(item)} repurposed</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-2 flex justify-end gap-2 border-t">
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
              <RepurposeButton contentId={item.id} />
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  function renderListView(items: any[]) {
    return (
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex border border-border rounded-lg p-3 bg-card/50 hover:border-primary/20 transition-colors">
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium line-clamp-1">{item.title}</h3>
                <Badge variant={item.status === 'draft' ? 'outline' : 'default'} className="ml-2">
                  {item.status === 'draft' ? 'Draft' : 'Published'}
                </Badge>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Updated: {formatDate(item.updated_at)}</span>
                
                {hasRepurposedContent(item) && (
                  <div className="flex items-center gap-1 ml-3 text-primary">
                    <Layers className="h-3 w-3" />
                    <span>{getRepurposedCount(item)} repurposed</span>
                  </div>
                )}
                
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex items-center gap-1 ml-3">
                    <Tag className="h-3 w-3" />
                    <span>{item.keywords.length} keywords</span>
                  </div>
                )}
              </div>
              
              <div className="line-clamp-1 text-xs opacity-80">
                {item.content ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: item.content?.substring(0, 100) + '...'
                  }} />
                ) : (
                  <span className="text-muted-foreground italic">No content</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-2"
                onClick={() => handleView(item.id)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-2"
                onClick={() => handleEdit(item.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                className="h-8 px-2"
                onClick={() => navigate(`/content-repurposing?id=${item.id}`)}
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive h-8 px-2"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
