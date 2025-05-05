
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Download, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail,
  Loader2,
  Info,
  CheckCircle
} from 'lucide-react';
import { useContent } from '@/contexts/content';

export const SaveStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    contentType, 
    seoScore, 
    selectedSolution, 
    isSaving,
    metaTitle,
    metaDescription,
    contentTitle,
    seoImprovements
  } = state;
  
  const { addContentItem, contentItems, getContentItem } = useContent();
  const navigate = useNavigate();
  
  // Track optimizations
  const hasAppliedOptimizations = React.useMemo(() => {
    return seoImprovements?.some(improvement => improvement.applied) || false;
  }, [seoImprovements]);
  
  // Initialize title from contentTitle or metaTitle if available, otherwise use a default
  const [title, setTitle] = useState(metaTitle || contentTitle || `${mainKeyword} - Complete Guide`);
  
  // Initialize description from metaDescription if available, otherwise use a default
  const [description, setDescription] = useState(metaDescription || `A comprehensive guide about ${mainKeyword}`);
  
  const [socialShare, setSocialShare] = useState(true);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [existingContentId, setExistingContentId] = useState<string | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null);
  
  // Update the local state when global state changes
  useEffect(() => {
    if (metaTitle) {
      setTitle(metaTitle);
    } else if (contentTitle) {
      setTitle(contentTitle);
    }
    
    if (metaDescription) {
      setDescription(metaDescription);
    }
  }, [metaTitle, metaDescription, contentTitle]);
  
  // Improved check for similar content already exists
  useEffect(() => {
    if (mainKeyword && title) {
      // Look for similar content based on title or main keyword
      const similarContent = contentItems.find(item => {
        // Check for similar title (case insensitive)
        const titleMatch = item.title.toLowerCase() === title.toLowerCase();
        
        // Check for main keyword match
        const keywordMatch = item.keywords && 
          item.keywords.some(kw => 
            kw.toLowerCase() === mainKeyword.toLowerCase()
          );
          
        return titleMatch || keywordMatch;
      });
      
      if (similarContent) {
        setAlreadySaved(true);
        setExistingContentId(similarContent.id);
      } else {
        setAlreadySaved(false);
        setExistingContentId(null);
      }
    }
  }, [title, mainKeyword, contentItems]);
  
  const handleViewExisting = () => {
    if (existingContentId) {
      // Navigate to content library with focus on the existing item
      navigate('/content', { state: { highlightId: existingContentId } });
    } else {
      navigate('/content');
    }
  };
  
  const handleSaveContent = async () => {
    if (!content || !mainKeyword) {
      toast.error("Content or keywords are missing");
      return;
    }

    // If content is already saved, navigate directly to content library
    if (alreadySaved && existingContentId) {
      toast.info("Navigating to existing content in your library");
      handleViewExisting();
      return;
    }

    // Set saving state
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    
    // Save to content library
    try {
      // Prepare content item for storage, use the current title and description from state
      const contentItem = {
        title: title,
        content: content,
        status: 'draft' as 'draft' | 'published' | 'archived',
        seo_score: seoScore,
        keywords: [mainKeyword, ...(state.selectedKeywords || [])],
        meta_description: description, // Store the meta description
        optimized: hasAppliedOptimizations // Track if optimizations were applied
      };
      
      await addContentItem(contentItem);
      
      toast.success("Content saved to library");
      
      // Navigate to content library after a short delay
      setTimeout(() => {
        dispatch({ type: 'SET_IS_SAVING', payload: false });
        navigate('/content');
      }, 800);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };
  
  const handleDownload = (format: 'pdf' | 'docx' | 'html') => {
    if (!content || !title) {
      toast.error("Content or title is missing");
      return;
    }
    
    setDownloadingFormat(format);
    
    // Mock download functionality
    setTimeout(() => {
      toast.success(`Content exported as ${format.toUpperCase()}`);
      
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadingFormat(null);
    }, 1000);
  };
  
  const handleShare = (platform: string) => {
    if (!content || !title) {
      toast.error("Content or title is missing");
      return;
    }
    
    setSharingPlatform(platform);
    
    // Mock sharing functionality
    setTimeout(() => {
      toast.success(`Content shared on ${platform}`);
      setSharingPlatform(null);
    }, 800);
  };
  
  // Render download button with loading state
  const renderDownloadButton = (format: 'pdf' | 'docx' | 'html', label: string) => (
    <Button 
      variant="outline" 
      size="sm"
      className="gap-1"
      onClick={() => handleDownload(format)}
      disabled={downloadingFormat !== null}
    >
      {downloadingFormat === format ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
  
  // Render share button with loading state
  const renderShareButton = (platform: string, Icon: React.ComponentType<{ className?: string }>) => (
    <Button 
      size="icon" 
      variant="outline"
      onClick={() => handleShare(platform)}
      disabled={sharingPlatform !== null}
      className={sharingPlatform === platform ? "bg-primary/20" : ""}
    >
      {sharingPlatform === platform ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );
  
  return (
    <div className="space-y-6">
      {alreadySaved && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
          <Info className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Similar content already exists in your library</p>
            <p className="text-sm">You may already have saved content with this title or keyword.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleViewExisting}>
            View in Library
          </Button>
        </div>
      )}
      
      {hasAppliedOptimizations && (
        <div className="flex items-center gap-2 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Content has been optimized</p>
            <p className="text-sm">SEO improvements from the optimization step have been applied.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Content Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter meta description..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/160 characters (recommended: 120-155)
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="social-share">Share on Social Media</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically post to connected accounts
                </p>
              </div>
              <Switch
                id="social-share"
                checked={socialShare}
                onCheckedChange={setSocialShare}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Content Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Main Keyword</p>
                <p className="font-medium">{mainKeyword}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Content Type</p>
                <p className="font-medium">{contentType || 'Not specified'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Word Count</p>
                <p className="font-medium">{content ? content.split(/\s+/).filter(Boolean).length : 0}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">SEO Score</p>
                <p className="font-medium">{seoScore}/100</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Solution</p>
                <p className="font-medium">{selectedSolution?.name || 'Not specified'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium">Draft</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Optimized</p>
                <p className="font-medium">{hasAppliedOptimizations ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-medium">Export Options</h4>
              <div className="flex flex-wrap gap-2">
                {renderDownloadButton('pdf', 'PDF')}
                {renderDownloadButton('docx', 'Word')}
                {renderDownloadButton('html', 'HTML')}
              </div>
            </div>
            
            {socialShare && (
              <div className="pt-4 space-y-3">
                <h4 className="text-sm font-medium">Share On</h4>
                <div className="flex gap-2">
                  {renderShareButton('Twitter', Twitter)}
                  {renderShareButton('Facebook', Facebook)}
                  {renderShareButton('LinkedIn', Linkedin)}
                  {renderShareButton('Email', Mail)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button
          className={`gap-1 ${
            alreadySaved 
            ? 'bg-secondary hover:bg-secondary/90' 
            : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'
          } min-w-[150px]`}
          onClick={handleSaveContent}
          disabled={isSaving || !content || !mainKeyword}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : alreadySaved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              View in Content Library
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save to Library
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
