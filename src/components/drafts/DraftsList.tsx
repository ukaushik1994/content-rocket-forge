
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, RefreshCcw, List, Tag, Plus, Undo, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RepurposeButton } from './RepurposeButton';
import { motion } from 'framer-motion';
import { RefreshButton } from '@/components/ui/refresh-button';
import { CustomBadge } from '@/components/ui/custom-badge';

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
    const toastId = toast.loading('Refreshing content...');
    refreshContent().then(() => {
      console.log('[DraftsList] Content manually refreshed, found items:', contentItems.length);
      toast.success('Content refreshed successfully', { id: toastId });
      setRefreshCount(prev => prev + 1);
      setIsRefreshing(false);
    }).catch(() => {
      setIsRefreshing(false);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-neon-purple animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-2 border-neon-blue animate-spin"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your content...</p>
      </div>
    );
  }

  const displayedItems = getDisplayedItems();
  console.log('[DraftsList] Displaying items:', displayedItems.length);

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 pt-4 pb-4 bg-black/90 backdrop-blur-xl rounded-xl mb-6 shadow-lg border border-white/5">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-black/40 border border-white/10 rounded-lg p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/30 data-[state=active]:to-neon-blue/30 data-[state=active]:text-white">
              All ({contentItems.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/30 data-[state=active]:to-neon-blue/30 data-[state=active]:text-white">
              Drafts ({drafts.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple/30 data-[state=active]:to-neon-blue/30 data-[state=active]:text-white">
              Published ({publishedItems.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <RefreshButton 
          isRefreshing={isRefreshing}
          onClick={handleRefresh} 
          className="border-white/10 hover:bg-white/5"
        />
      </div>
      
      {renderContentItems(displayedItems)}
    </motion.div>
  );

  // Helper function to render content items
  function renderContentItems(items: any[]) {
    if (items.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/20 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-lg shadow-neon-purple/10">
            <Sparkles className="h-10 w-10 text-neon-purple animate-pulse-glow" />
          </div>
          <h3 className="text-2xl font-medium mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            No {selectedTab === 'all' ? 'content items' : selectedTab} found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
            Create content in the builder to see it here.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => navigate('/content-builder')}
              size="lg"
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple px-8 py-6 h-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Content
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ y: -5 }}
            className="h-full"
          >
            <Card className="h-full overflow-hidden border border-white/10 bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-lg hover:shadow-xl hover:shadow-neon-purple/10 transition-all duration-300 group relative">
              {/* Status indicator */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                item.status === 'draft' 
                  ? 'bg-gradient-to-b from-neon-purple via-neon-purple/70 to-neon-purple/30' 
                  : 'bg-gradient-to-b from-neon-blue via-neon-blue/70 to-neon-blue/30'
              }`} />
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-gradient transition-colors">
                    {item.title}
                  </CardTitle>
                  <CustomBadge 
                    className={
                      item.status === 'draft' 
                        ? 'border-neon-purple/40 text-neon-purple bg-neon-purple/10' 
                        : 'border-neon-blue/40 text-neon-blue bg-neon-blue/10'
                    }
                    animated
                  >
                    {item.status === 'draft' ? 'Draft' : 'Published'}
                  </CustomBadge>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs mt-2">
                  <span>Created: {formatDate(item.created_at)}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="line-clamp-3 text-sm opacity-80 prose prose-invert prose-sm max-w-none">
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
                    {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        {keyword}
                      </Badge>
                    ))}
                    {item.keywords.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-white/5 border-white/10">
                        +{item.keywords.length - 3}
                      </Badge>
                    )}
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
              
              <CardFooter className="pt-3 flex justify-end gap-2 mt-auto border-t border-white/5">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleView(item.id)}
                  className="text-white/70 hover:text-white group"
                >
                  <Eye className="h-4 w-4 mr-1 group-hover:text-neon-blue transition-colors" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEdit(item.id)}
                  className="text-white/70 hover:text-white group"
                >
                  <Edit className="h-4 w-4 mr-1 group-hover:text-neon-purple transition-colors" />
                  Edit
                </Button>
                <RepurposeButton contentId={item.id} />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-white/70 hover:text-destructive group"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1 group-hover:text-destructive transition-colors" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }
}
