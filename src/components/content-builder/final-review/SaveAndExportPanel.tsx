
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FilePlus, FileCheck, Download, FileOutput, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PublishedUrlDialog } from '@/components/content-builder/steps/save/PublishedUrlDialog';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { supabase } from '@/integrations/supabase/client';

interface SaveAndExportPanelProps {
  completionPercentage: number;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  isSaving: boolean;
  isSavedToDraft: boolean;
}

export const SaveAndExportPanel: React.FC<SaveAndExportPanelProps> = ({
  completionPercentage,
  onSave,
  onPublish,
  isSaving,
  isSavedToDraft
}) => {
  const { state } = useContentBuilder();
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  
  const isReady = completionPercentage >= 80;
  const isOkay = completionPercentage >= 60;
  
  const handleSave = async () => {
    try {
      await onSave();
      // After save, we need to get the content ID from the database
      // Let's query for the most recently created draft by this user
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: contentItem } = await supabase
          .from('content_items')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (contentItem) {
          setSavedContentId(contentItem.id);
          setShowUrlDialog(true);
        }
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content to drafts');
    }
  };
  
  const handlePublish = async () => {
    if (completionPercentage < 60 && !confirm('Your content is not fully optimized. Are you sure you want to publish?')) {
      return;
    }
    
    try {
      await onPublish();
      // After publish, we need to get the content ID from the database
      // Let's query for the most recently created published content by this user
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: contentItem } = await supabase
          .from('content_items')
          .select('id')
          .eq('user_id', user.user.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (contentItem) {
          setSavedContentId(contentItem.id);
          setShowUrlDialog(true);
        }
      }
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    }
  };

  const handleUrlSubmit = async (publishedUrl: string) => {
    if (!savedContentId) {
      toast.error('No content ID available');
      return;
    }

    try {
      setIsProcessingUrl(true);

      // Update the content item with the published URL
      const { error: updateError } = await supabase
        .from('content_items')
        .update({ published_url: publishedUrl })
        .eq('id', savedContentId);

      if (updateError) {
        throw updateError;
      }

      // Trigger analytics data fetch in the background
      const analyticsPromise = supabase.functions.invoke('google-analytics-fetch', {
        body: { contentId: savedContentId, publishedUrl }
      });

      const searchConsolePromise = supabase.functions.invoke('search-console-fetch', {
        body: { contentId: savedContentId, publishedUrl }
      });

      // Don't wait for these to complete, let them run in background
      Promise.allSettled([analyticsPromise, searchConsolePromise]).then((results) => {
        const analyticsResult = results[0];
        const searchResult = results[1];
        
        if (analyticsResult.status === 'fulfilled') {
          console.log('Analytics data fetch initiated successfully');
        } else {
          console.error('Analytics data fetch failed:', analyticsResult.reason);
        }

        if (searchResult.status === 'fulfilled') {
          console.log('Search Console data fetch initiated successfully');
        } else {
          console.error('Search Console data fetch failed:', searchResult.reason);
        }
      });

      toast.success('Published URL saved and analytics tracking initiated!');
    } catch (error) {
      console.error('Error processing published URL:', error);
      throw error;
    } finally {
      setIsProcessingUrl(false);
    }
  };
  
  return (
    <>
      <Card className={cn(
        "border p-4",
        isReady 
          ? "border-green-500/30 bg-gradient-to-br from-green-950/20 to-black/20" 
          : "border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-black/20"
      )}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isReady ? "bg-green-500/20" : "bg-amber-500/20"
            )}>
              {isReady 
                ? <CheckCircle className="h-5 w-5 text-green-400" />
                : <AlertTriangle className="h-5 w-5 text-amber-400" />
              }
            </div>
            <div>
              <h3 className="font-medium">{isReady ? "Ready to Save & Export" : "Content Status"}</h3>
              <p className="text-sm text-muted-foreground">
                {isReady 
                  ? "Your content has passed all checks" 
                  : `Content is ${completionPercentage}% optimized, needs improvement`
                }
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn(
                    isReady ? "border-green-500/30 text-green-500" : 
                    isOkay ? "border-amber-500/30 text-amber-500" : 
                    "border-red-500/30 text-red-500"
                  )}
                >
                  {isReady ? "Ready for publishing" : 
                    isOkay ? "Needs minor improvements" : "Needs major improvements"}
                </Badge>
                {isSavedToDraft && (
                  <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                    <FileCheck className="h-3 w-3 mr-1" />
                    Saved to drafts
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="border-white/10 hover:bg-white/5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Save to Drafts
                </>
              )}
            </Button>
            
            <Button
              onClick={handlePublish}
              disabled={isSaving}
              className={cn(
                "gap-2",
                isReady 
                  ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600" 
                  : "bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600"
              )}
            >
              <FileOutput className="h-4 w-4" />
              {isReady ? "Publish Content" : "Publish Anyway"}
            </Button>
          </div>
        </div>
        
        {/* Additional export options as a floating bar */}
        <div className="flex items-center justify-end mt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground"
          >
            Export as: 
            <Button variant="ghost" size="sm" className="text-xs ml-2">
              <Download className="h-3 w-3 mr-1" />
              HTML
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Markdown
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Text
            </Button>
          </motion.div>
        </div>
      </Card>

      <PublishedUrlDialog
        open={showUrlDialog}
        onClose={() => setShowUrlDialog(false)}
        onSubmit={handleUrlSubmit}
        contentTitle={state.contentTitle || state.metaTitle || state.mainKeyword || 'Untitled Content'}
      />
    </>
  );
};
