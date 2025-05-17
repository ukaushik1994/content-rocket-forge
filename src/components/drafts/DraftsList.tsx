
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Eye, Edit, Trash2, RefreshCcw, List, Tag, Undo, Search, 
  Grid, Table2, Filter, Link2, Clock, FileText, ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RepurposeButton } from './RepurposeButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshCount, setRefreshCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

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

  // Apply search and filters
  useEffect(() => {
    let items = getSelectedTabItems();
    
    // Apply search if there is a search term
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.title?.toLowerCase().includes(lowercaseSearch) ||
        item.content?.toLowerCase().includes(lowercaseSearch) ||
        item.keywords?.some((keyword: string) => keyword.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    setFilteredItems(items);
  }, [searchTerm, selectedTab, contentItems, refreshCount]);

  // Helper function to get items based on selected tab
  const getSelectedTabItems = () => {
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

  // Check for updates from content builder
  useEffect(() => {
    const contentDraftSaved = sessionStorage.getItem('content_draft_saved');
    const timestamp = sessionStorage.getItem('content_save_timestamp');
    
    console.log('[DraftsList] Checking for saved draft flag:', contentDraftSaved);
    console.log('[DraftsList] Content save timestamp:', timestamp);
    console.log('[DraftsList] Current content items:', contentItems.length);
    
    if (contentDraftSaved === 'true') {
      console.log('[DraftsList] Draft saved flag found, refreshing content...');
      
      const toastId = toast.loading('Updating drafts list...');
      refreshContent().then(() => {
        console.log('[DraftsList] Content refreshed after draft saved');
        toast.success('Drafts list updated', { id: toastId });
        setRefreshCount(prev => prev + 1);
      });
      
      sessionStorage.removeItem('content_draft_saved');
    }
  }, [refreshContent, contentItems.length]);

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
      console.log('[DraftsList] Content manually refreshed, found items:', contentItems.length);
      toast.success('Content refreshed successfully', { id: toastId });
      setRefreshCount(prev => prev + 1);
    });
  };

  // Function to check if an item has SERP data
  const hasSerpData = (item: any) => {
    return item.metadata?.serpSelections && 
           Array.isArray(item.metadata.serpSelections) && 
           item.metadata.serpSelections.filter((s: any) => s.selected).length > 0;
  };

  // Function to check if an item has repurposed content
  const hasRepurposedContent = (item: any) => {
    return item.metadata?.repurposed || 
           (item.related_content && item.related_content.length > 0);
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
      <div className="flex flex-col md:flex-row gap-3">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="all">All ({contentItems.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedItems.length})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <div className="flex-1 md:w-64">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search drafts..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Has SERP data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Has repurposed content
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Content type
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Keywords
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex rounded-md border">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {renderContentItems(filteredItems)}
    </div>
  );

  // Helper function to render content items
  function renderContentItems(items: any[]) {
    if (items.length === 0) {
      return (
        <div className="bg-card/40 border border-border rounded-lg p-8 text-center">
          <p className="text-lg font-medium">No {selectedTab === 'all' ? 'content items' : selectedTab} found</p>
          <p className="text-muted-foreground mt-2">
            {searchTerm ? 'Try adjusting your search terms' : 'Create content in the builder to see it here.'}
          </p>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <Badge variant={item.status === 'draft' ? 'outline' : 'default'}>
                    {item.status === 'draft' ? 'Draft' : 'Published'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs mt-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.created_at)}</span>
                  
                  {item.contentType && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.contentType}
                    </Badge>
                  )}
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
                
                {/* Display metadata highlights */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {hasRepurposedContent(item) && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Undo className="h-3 w-3 mr-1" /> Repurposed
                    </Badge>
                  )}
                  
                  {hasSerpData(item) && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      <Search className="h-3 w-3 mr-1" /> SERP data
                    </Badge>
                  )}

                  {item.metaTitle && item.metaDescription && (
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Tag className="h-3 w-3 mr-1" /> SEO meta
                    </Badge>
                  )}
                </div>
                
                {/* Display keywords */}
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                    {item.keywords.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Display SERP selection count if available */}
                {hasSerpData(item) && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                    <Search className="h-3 w-3" />
                    <span>{item.metadata.serpSelections.filter((s: any) => s.selected).length} SERP selections</span>
                  </div>
                )}
                
                {/* Display outline count if available */}
                {item.metadata?.outline && item.metadata.outline.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
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
                <RepurposeButton contentId={item.id} />
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
    } else {
      // List view
      return (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 bg-card/50 border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-base line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs mt-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.created_at)}</span>
                      
                      {item.contentType && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {item.contentType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant={item.status === 'draft' ? 'outline' : 'default'}>
                    {item.status === 'draft' ? 'Draft' : 'Published'}
                  </Badge>
                </div>
                
                {/* Metadata highlights in list view */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {hasRepurposedContent(item) && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Undo className="h-3 w-3 mr-1" /> Repurposed
                    </Badge>
                  )}
                  
                  {hasSerpData(item) && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      <Search className="h-3 w-3 mr-1" /> SERP data
                    </Badge>
                  )}

                  {item.metaTitle && item.metaDescription && (
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Tag className="h-3 w-3 mr-1" /> SEO meta
                    </Badge>
                  )}
                  
                  {/* Display first 2 keywords in list view */}
                  {item.keywords && item.keywords.length > 0 && item.keywords.slice(0, 2).map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {item.keywords && item.keywords.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.keywords.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handleView(item.id)}
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handleEdit(item.id)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => navigate(`/content-repurposing?id=${item.id}`)}
                  title="Repurpose"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
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
}
