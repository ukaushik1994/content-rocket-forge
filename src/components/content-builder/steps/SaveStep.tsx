
import React, { useState } from 'react';
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
  Loader2
} from 'lucide-react';
import { useContent } from '@/contexts/content';

export const SaveStep = () => {
  const { state, saveContentAsDraft } = useContentBuilder();
  const { content, mainKeyword, contentType, seoScore, selectedSolution, isSaving } = state;
  const { addContentItem } = useContent();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState(`${mainKeyword} - Complete Guide`);
  const [description, setDescription] = useState(`A comprehensive guide about ${mainKeyword}`);
  const [socialShare, setSocialShare] = useState(true);
  
  const handleSaveContent = async () => {
    if (!content || !mainKeyword) {
      toast.error("Content or keywords are missing");
      return;
    }

    // Save to content library
    try {
      // Prepare content item for storage
      const contentItem = {
        title: title,
        content: content,
        status: 'draft' as 'draft' | 'published' | 'archived', // Explicitly cast to allowed type
        seo_score: seoScore,
        keywords: [mainKeyword, ...(state.selectedKeywords || [])],
      };
      
      // Add to content library
      await addContentItem(contentItem);
      
      toast.success("Content saved to library");
      
      // Navigate to content library
      setTimeout(() => {
        navigate('/content');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
      
      // Call the original saveContentAsDraft as a fallback
      await saveContentAsDraft();
    }
  };
  
  const handleDownload = (format: 'pdf' | 'docx' | 'html') => {
    toast.success(`Content exported as ${format.toUpperCase()}`);
    
    // Mock download functionality
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
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
            </div>
            
            <div className="pt-4 space-y-3">
              <h4 className="text-sm font-medium">Export Options</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDownload('pdf')}
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDownload('docx')}
                >
                  <Download className="h-4 w-4" />
                  Word
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleDownload('html')}
                >
                  <Download className="h-4 w-4" />
                  HTML
                </Button>
              </div>
            </div>
            
            {socialShare && (
              <div className="pt-4 space-y-3">
                <h4 className="text-sm font-medium">Share On</h4>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button
          className="gap-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple min-w-[150px]"
          onClick={handleSaveContent}
          disabled={isSaving || !content || !mainKeyword}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save to Content Library
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
