
import React, { useEffect, useState } from 'react';
import { useContent } from '@/contexts/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, RefreshCcw, List, Tag, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RepurposeButton } from './RepurposeButton';
import { motion } from 'framer-motion';

interface DraftsListProps {
  onOpenDetailView?: (draft: any) => void;
}

export function DraftsList({ onOpenDetailView }: DraftsListProps) {
  const { contentItems, loading, deleteContentItem, refreshContent } = useContent();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('all');
  const [refreshCount, setRefreshCount] = useState(0);

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
    const toastId = toast.loading('Refreshing content...');
    refreshContent().then(() => {
      console.log('[DraftsList] Content manually refreshed, found items:', contentItems.length);
      toast.success('Content refreshed successfully', { id: toastId });
      setRefreshCount(prev => prev + 1);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const displayedItems = getDisplayedItems();
  console.log('[DraftsList] Displaying items:', displayedItems.length);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab} 
          className="w-full sm:max-w-md bg-card/30 p-1 rounded-lg backdrop-blur-sm border border-white/10"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All ({contentItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="drafts"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Drafts ({drafts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="published"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Published ({publishedItems.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {renderContentItems(displayedItems)}
    </div>
  );

  // Helper function to render content items
  function renderContentItems(items: any[]) {
    if (items.length === 0) {
      return (
        <div className="glass-panel border border-white/10 rounded-lg p-12 text-center backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl font-medium mb-2">No {selectedTab === 'all' ? 'content items' : selectedTab} found</p>
            <p className="text-muted-foreground mb-6">
              Create content in the builder to see it here.
            </p>
            <Button 
              onClick={() => navigate('/content-builder')}
              className="bg-gradient-to-r from-neon-purple to-neon-blue"
            >
              Create Your First Draft
            </Button>
          </motion.div>
        </div>
      );
    }

    return (
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((item, index) => (
          <motion.div 
            key={item.id}
            variants={item}
            className="card-3d"
          >
            <Card className="overflow-hidden border border-white/10 bg-card/30 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-2 relative">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-neon-purple/20 to-neon-blue/10 rounded-full blur-xl z-0"></div>
                <div className="flex justify-between items-start z-10 relative">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <Badge variant={item.status === 'draft' ? 'outline' : 'default'} className={`${item.status === 'draft' ? 'border-white/20' : 'bg-primary text-primary-foreground'}`}>
                    {item.status === 'draft' ? 'Draft' : 'Published'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                  <span>{formatDate(item.created_at)}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2 flex-grow">
                <div className="line-clamp-3 text-sm opacity-85">
                  {item.content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: item.content?.substring(0, 150) + '...'
                    }} />
                  ) : (
                    <span className="text-muted-foreground italic">No content</span>
                  )}
                </div>
                
                {/* Keywords badges with animated appearance */}
                {item.keywords && item.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.keywords.map((keyword: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="text-xs bg-white/5 border border-white/10 text-foreground/80"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Content metadata in a cleaner format */}
                <div className="mt-3 space-y-1.5">
                  {item.metadata?.serpSelections && item.metadata.serpSelections.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-4 h-4 rounded-full bg-neon-blue/10 flex items-center justify-center">
                        <Tag className="h-2.5 w-2.5 text-neon-blue" />
                      </div>
                      <span>{item.metadata.serpSelections.filter((s: any) => s.selected).length} SERP selections</span>
                    </div>
                  )}
                  
                  {item.metadata?.outline && item.metadata.outline.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-4 h-4 rounded-full bg-neon-purple/10 flex items-center justify-center">
                        <List className="h-2.5 w-2.5 text-neon-purple" />
                      </div>
                      <span>{item.metadata.outline.length} outline sections</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-end gap-1 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] px-4 py-3">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleView(item.id)}
                  className="hover:bg-white/5"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEdit(item.id)}
                  className="hover:bg-white/5"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <RepurposeButton contentId={item.id} />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }
}
