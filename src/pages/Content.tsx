
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { ContentEditor } from '@/components/content/ContentEditor';
import { ContentRepository } from '@/components/content/ContentRepository';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { useContent } from '@/contexts/ContentContext';
import {
  PlusCircle,
  Save,
  Share2,
  FileText,
  Loader2,
  Download,
  Copy,
  BarChart3,
  Library,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const Content = () => {
  const [loading, setLoading] = useState(false);
  const [contentGenerated, setContentGenerated] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [contentTitle, setContentTitle] = useState<string>('');
  const [contentBody, setContentBody] = useState<string>('');
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [contentKeywords, setContentKeywords] = useState<string[]>([]);
  const [seoScore, setSeoScore] = useState<number>(0);
  
  const { createContent, updateContent, refreshContentItems, contentItems } = useContent();

  // Load content when content ID changes
  useEffect(() => {
    if (currentContentId) {
      const contentItem = contentItems.find(item => item.id === currentContentId);
      if (contentItem) {
        setContentTitle(contentItem.title || '');
        setContentBody(contentItem.content || '');
        setContentKeywords(contentItem.keywords || []);
        setSeoScore(contentItem.seo_score || 0);
      }
    }
  }, [currentContentId, contentItems]);

  const handleGenerate = () => {
    setLoading(true);
    setGenerationProgress(0);
    
    // Simulate a realistic content generation process
    const intervals = [
      { progress: 15, message: 'Analyzing keyword intent...' },
      { progress: 30, message: 'Processing SERP data...' },
      { progress: 45, message: 'Extracting content patterns...' },
      { progress: 60, message: 'Generating content structure...' },
      { progress: 75, message: 'Creating content draft...' },
      { progress: 90, message: 'Optimizing for search engines...' },
      { progress: 100, message: 'Content generated successfully!' }
    ];
    
    let currentInterval = 0;
    
    const simulateProgress = setInterval(() => {
      if (currentInterval < intervals.length) {
        const { progress, message } = intervals[currentInterval];
        setGenerationProgress(progress);
        toast(message);
        currentInterval++;
      } else {
        clearInterval(simulateProgress);
        setLoading(false);
        setContentGenerated(true);
        setAnalysisComplete(true);
      }
    }, 1500);
  };
  
  const handleSave = async () => {
    if (!contentTitle.trim()) {
      toast.error('Please add a title for your content');
      return;
    }
    
    try {
      if (currentContentId) {
        // Update existing content
        const success = await updateContent(
          currentContentId, 
          {
            title: contentTitle,
            content: contentBody,
            status: 'draft',
            seo_score: seoScore
          },
          contentKeywords
        );
        
        if (success) {
          toast.success('Content updated successfully!');
          // Refresh content items to update the repository view
          await refreshContentItems();
        }
      } else {
        // Create new content
        const id = await createContent(
          {
            title: contentTitle,
            content: contentBody,
            status: 'draft',
            seo_score: seoScore
          },
          contentKeywords
        );
        
        if (id) {
          setCurrentContentId(id);
          toast.success('Content saved successfully!');
          // Refresh content items to update the repository view
          await refreshContentItems();
        }
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };
  
  const handleShare = () => {
    setShareDialogOpen(true);
  };

  const handleExport = (format: 'pdf' | 'docx' | 'html') => {
    toast.success(`Content exported as ${format.toUpperCase()} successfully!`);
    
    // Mock download simulation
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = `content-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  };
  
  // Clear content form for creating new content
  const handleNewContent = () => {
    setCurrentContentId(null);
    setContentTitle('');
    setContentBody('');
    setContentKeywords([]);
    setSeoScore(0);
    setContentGenerated(false);
    setAnalysisComplete(false);
    setActiveTab("editor");
  };
  
  // Update from content editor
  const handleContentUpdate = (data: { 
    title?: string; 
    content?: string; 
    keywords?: string[];
    seoScore?: number;
  }) => {
    if (data.title !== undefined) setContentTitle(data.title);
    if (data.content !== undefined) setContentBody(data.content);
    if (data.keywords !== undefined) setContentKeywords(data.keywords);
    if (data.seoScore !== undefined) setSeoScore(data.seoScore);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient">Content Builder</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="gap-1 neon-border"
                onClick={handleNewContent}
              >
                <PlusCircle className="h-4 w-4" />
                <span>New</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-1 neon-border"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-1 neon-border"
                onClick={handleShare}
                disabled={!contentGenerated && !contentTitle}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple gap-1"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating ({generationProgress}%)</span>
                  </>
                ) : contentGenerated ? (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Regenerate</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Generate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {loading && (
            <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
              <div 
                className="bg-gradient-to-r from-neon-purple to-neon-blue h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          )}
          
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/30">
              <TabsTrigger value="editor" className="gap-2">
                <FileText className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <FileText className="h-4 w-4" />
                Published
              </TabsTrigger>
              <TabsTrigger value="repository" className="gap-2">
                <Library className="h-4 w-4" />
                Repository
              </TabsTrigger>
              {analysisComplete && (
                <TabsTrigger value="performance" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="editor" className="mt-4">
              <ContentEditor 
                onContentUpdate={handleContentUpdate} 
                initialContent={contentBody}
                initialTitle={contentTitle}
                initialKeywords={contentKeywords}
              />
            </TabsContent>
            
            <TabsContent value="published" className="mt-4">
              {currentContentId ? (
                <div className="flex flex-col space-y-4">
                  <div className="rounded-lg bg-glass p-6">
                    <h2 className="text-xl font-medium mb-4">{contentTitle || 'Published Content'}</h2>
                    <p>Your content has been published successfully and is now live.</p>
                    
                    <div className="flex items-center justify-between mt-6 border-t pt-4 border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Content ID:</span>
                        <span className="text-sm font-medium">{currentContentId.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Published:</span>
                        <span className="text-sm font-medium">May 2, 2025</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('pdf')}>
                        <Download className="h-4 w-4" />
                        Export as PDF
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('docx')}>
                        <Download className="h-4 w-4" />
                        Export as DOCX
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => handleExport('html')}>
                        <Download className="h-4 w-4" />
                        Export as HTML
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-glass p-6">
                    <h2 className="text-xl font-medium mb-4">Content Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-background/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Views</div>
                        <div className="text-2xl font-bold">127</div>
                        <div className="text-xs text-green-400">+12% vs. last week</div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Engagement</div>
                        <div className="text-2xl font-bold">4:23</div>
                        <div className="text-xs text-green-400">+2:15 vs. avg</div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Conversions</div>
                        <div className="text-2xl font-bold">8</div>
                        <div className="text-xs text-green-400">6.3% rate</div>
                      </div>
                      <div className="bg-background/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">SEO Score</div>
                        <div className="text-2xl font-bold">{seoScore}/100</div>
                        <div className="text-xs text-green-400">+2 this week</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 gap-4">
                  <div className="w-16 h-16 rounded-full bg-glass flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-medium">No Published Content Yet</h2>
                  <p className="text-muted-foreground text-center max-w-md">
                    After you generate and publish content, it will appear here with performance metrics and optimization suggestions.
                  </p>
                  <Button className="mt-2" onClick={() => setActiveTab("editor")}>Create Your First Content</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="repository" className="mt-4">
              <ContentRepository onSelectContent={(contentId) => {
                setCurrentContentId(contentId);
                setActiveTab("editor");
              }} />
            </TabsContent>
            
            <TabsContent value="performance" className="mt-4">
              <div className="space-y-6">
                <div className="rounded-lg bg-glass p-6">
                  <h2 className="text-xl font-medium mb-4">Content Performance Analysis</h2>
                  <p className="text-muted-foreground mb-6">
                    Review your content's performance metrics and optimization recommendations.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4 bg-background/50">
                      <h3 className="text-lg font-medium mb-3">SEO Performance</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Keyword Optimization</span>
                            <span className="text-sm">85%</span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2">
                            <div className="bg-neon-purple rounded-full h-2" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Content Structure</span>
                            <span className="text-sm">92%</span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2">
                            <div className="bg-neon-purple rounded-full h-2" style={{ width: '92%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Readability</span>
                            <span className="text-sm">78%</span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2">
                            <div className="bg-neon-purple rounded-full h-2" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm">{seoScore}/100</span>
                          </div>
                          <div className="w-full bg-secondary/50 rounded-full h-2">
                            <div className="bg-neon-purple rounded-full h-2" style={{ width: `${seoScore}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md glass-panel">
          <DialogHeader>
            <DialogTitle className="text-gradient">Share Your Content</DialogTitle>
            <DialogDescription>
              Share your content with your team or clients using the links below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Direct Link</label>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 px-3 py-2 bg-glass border-r-0 border border-border rounded-l-md text-sm" 
                  value={`https://contentrocketforge.app/content/${currentContentId || 'preview'}`} 
                  readOnly
                />
                <Button 
                  variant="outline" 
                  className="rounded-l-none border border-border"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://contentrocketforge.app/content/${currentContentId || 'preview'}`);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <h4 className="text-sm font-medium">Share via</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                  Twitter
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                  Facebook
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </Button>
                <Button variant="outline" className="gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.629 8.65c-.18-1.874-1.283-3.351-2.479-3.671-.598-.135-1.254.057-1.701.366-.416.288-.911.866-1.457 2.266-.158.405-.323.866-.485 1.323.119.405.235.809.346 1.186.651 2.213.986 2.83 1.23 3.058.242.225.569.437 1.31.437s1.067-.212 1.311-.437c.245-.228.581-.843 1.232-3.058.213-.721.408-1.546.576-2.266.151-.652.229-1.207.229-1.696.001-.47-.06-.842-.112-1.058zm-1.817 1.709c-.164.707-.349 1.484-.542 2.149-.496 1.696-.757 2.371-.794 2.426v.002c-.038-.057-.297-.729-.794-2.426-.098-.332-.2-.681-.294-1.042-.285-1.063-.424-1.6-.471-1.814-.066-.302-.074-.511-.075-.621v-.044c.001-.062.006-.183.057-.279.036-.066.113-.143.3-.183.409-.087 1.194.167 1.351 1.139.016.098.028.213.038.332.058.62.125 1.424.224 2.361zm-5.812 4.908c.149 0 .27-.121.27-.27v-6.754h1.523c.149 0 .271-.121.271-.271s-.122-.27-.271-.27h-3.587c-.149 0-.27.12-.27.27s.121.27.27.27h1.524v6.754c0 .149.121.27.27.27zm-4-1.048c-.705 0-1.279-.575-1.279-1.281v-5.236c0-.705.574-1.28 1.279-1.28s1.279.575 1.279 1.28v5.236c0 .705-.574 1.281-1.279 1.281zm0-7.256c-.407 0-.738.332-.738.739v5.236c0 .407.331.74.738.74s.738-.333.738-.74v-5.236c0-.407-.331-.739-.738-.739zm-2-.002c-.149 0-.27.12-.27.271v6.754h-.854c-.149 0-.27.12-.27.27s.121.27.27.27h2.248c.149 0 .27-.12.27-.27s-.121-.27-.27-.27h-.853v-6.754c0-.15-.121-.271-.271-.271z" />
                  </svg>
                  Email
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between border-t pt-4 border-border mt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShareDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast.success("Share settings saved!");
                setShareDialogOpen(false);
              }} 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Content;
