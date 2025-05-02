
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContent } from '@/contexts/ContentContext';
import { 
  Search, 
  Edit, 
  ExternalLink, 
  BarChart3, 
  Calendar, 
  Filter,
  ArrowUpRight,
  Tag,
  Clock,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContentRepositoryProps {
  onSelectContent?: (contentId: string) => void;
}

export function ContentRepository({ onSelectContent }: ContentRepositoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');
  const { contentItems, loading, deleteContent, refreshContentItems } = useContent();
  const [filteredItems, setFilteredItems] = useState(contentItems);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    let filtered = [...contentItems];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'score') {
        return (b.seo_score || 0) - (a.seo_score || 0);
      }
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [contentItems, searchQuery, sortBy, filterStatus]);
  
  // Force refresh when component mounts
  useEffect(() => {
    refreshContentItems();
  }, []);

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewContent = (id: string) => {
    if (onSelectContent) {
      onSelectContent(id);
    } else {
      toast.info(`Viewing content: ${id}`);
    }
  };

  const handleEditContent = (id: string) => {
    if (onSelectContent) {
      onSelectContent(id);
    } else {
      toast.info(`Editing content: ${id}`);
    }
  };

  const handleAnalyzeContent = (id: string) => {
    toast.info(`Analyzing content: ${id}`);
  };
  
  const handleDeleteContent = async () => {
    if (contentToDelete) {
      const success = await deleteContent(contentToDelete);
      if (success) {
        toast.success("Content deleted successfully");
        // Close the dialog
        setDeleteDialogOpen(false);
        setContentToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-9 bg-glass border-white/10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-glass border-white/10 w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="score">Sort by SEO Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="grid">
        <TabsList className="bg-secondary/30">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-glass border border-white/10 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-white/20">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Updated {formatDate(item.updated_at)}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                
                <div className="flex flex-wrap gap-1 my-3">
                  {item.keywords && item.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/5 text-xs">
                      <Tag className="h-2.5 w-2.5 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">SEO Score</div>
                    <div className="flex items-center gap-1">
                      <ScoreBadge score={item.seo_score || 0} />
                      <span className="text-xs font-medium">{item.seo_score || 0}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleEditContent(item.id)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleViewContent(item.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        setContentToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleAnalyzeContent(item.id)}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="sr-only">Analytics</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">No Content Found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {searchQuery || filterStatus !== 'all'
              ? "No content matches your current filters. Try adjusting your search criteria."
              : "You haven't created any content yet. Start by creating your first piece of content."}
          </p>
        </div>
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content
              and remove it from your repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContent} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper component for rendering status badges
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Published</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'archived':
      return <Badge className="bg-muted/50 text-muted-foreground">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Helper component for rendering score badges with appropriate colors
function ScoreBadge({ score }: { score: number }) {
  let bgColor = "bg-red-500/20";
  
  if (score >= 80) {
    bgColor = "bg-green-500/20";
  } else if (score >= 60) {
    bgColor = "bg-yellow-500/20";
  }
  
  return (
    <div className={`w-7 h-3 ${bgColor} rounded-full`}></div>
  );
}
