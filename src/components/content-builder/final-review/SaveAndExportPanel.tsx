import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Save, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const SaveAndExportPanel: React.FC = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, contentTitle } = state;
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [title, setTitle] = useState(contentTitle || 'Untitled Content');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const hasContent = content && content.trim().length > 0;
  const hasTitle = title && title.trim().length > 0;
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleSave = async () => {
    if (!hasContent || !hasTitle) {
      toast.error("Content and title are required to save.");
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate saving to a database
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the content title in the state
      dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
      
      setSaveStatus('success');
      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      setSaveStatus('error');
      toast.error("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExport = () => {
    if (!hasContent) {
      toast.error("No content to export.");
      return;
    }
    
    setIsExporting(true);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'content'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };
  
  const handleCopyToClipboard = () => {
    if (!content) {
      toast.error("No content to copy.");
      return;
    }
    
    navigator.clipboard.writeText(content)
      .then(() => {
        toast.success("Content copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy content to clipboard.");
      });
  };
  
  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Save & Export</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={handleTitleChange} 
              placeholder="Enter content title" 
            />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={handleCopyToClipboard}
            disabled={!hasContent}
          >
            <Copy className="h-4 w-4" />
            Copy to Clipboard
          </Button>
          <Button 
            className="w-full justify-start gap-2" 
            onClick={handleExport} 
            disabled={!hasContent}
          >
            <Download className="h-4 w-4" />
            Export as Text
          </Button>
          <Separator />
          <Button 
            variant="secondary" 
            className="w-full justify-center gap-2" 
            onClick={handleSave} 
            disabled={isSaving || !hasContent || !hasTitle}
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Saved
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                Save Failed
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
