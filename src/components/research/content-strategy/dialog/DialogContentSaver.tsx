import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface DialogContentSaverProps {
  proposal: any;
  selectedSolution: EnhancedSolution | null;
  outline: string[];
  content: string;
  title: string;
  onSaveComplete: () => void;
}

export function DialogContentSaver({ 
  proposal, 
  selectedSolution, 
  outline,
  content,
  title,
  onSaveComplete
}: DialogContentSaverProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [notes, setNotes] = useState('');
  const [metaTitle, setMetaTitle] = useState(title);
  const [metaDescription, setMetaDescription] = useState('');

  const handleSaveContent = async () => {
    if (!content || !title) {
      toast({
        title: "Missing required fields",
        description: "Please ensure title and content are provided",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);

      const primaryKeyword = proposal?.primary_keyword || '';
      const secondaryKeywords = proposal?.secondary_keywords || [];
      
      const saveData = {
        title,
        content,
        main_keyword: primaryKeyword,
        secondary_keywords: secondaryKeywords,
        content_type: 'blog' as const,
        meta_title: metaTitle || title,
        meta_description: metaDescription || `Learn about ${primaryKeyword} and discover how ${selectedSolution?.name} can help.`,
        status,
        notes,
        seo_score: null,
        outline_json: JSON.stringify(outline),
        solution_id: selectedSolution?.id || null,
        strategy_proposal_id: proposal?.id || null
      };

      const { data, error } = await supabase
        .from('content_repository')
        .insert([saveData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Content Saved Successfully",
        description: `Content has been saved as ${status} in your repository`
      });

      // Small delay to show success message
      setTimeout(() => {
        onSaveComplete();
      }, 1000);

    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content to repository. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const primaryKeyword = proposal?.primary_keyword || '';
  const secondaryKeywords = proposal?.secondary_keywords || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Save Content</h3>
        <p className="text-muted-foreground">
          Review and save your generated content to the repository
        </p>
      </div>

      {/* Content Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Title</Label>
              <p className="text-sm font-medium">{title}</p>
            </div>
            <div>
              <Label className="text-xs">Word Count</Label>
              <p className="text-sm font-medium">{wordCount} words</p>
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Primary Keyword</Label>
            <Badge variant="outline" className="text-xs ml-2">{primaryKeyword}</Badge>
          </div>
          
          {secondaryKeywords.length > 0 && (
            <div>
              <Label className="text-xs">Secondary Keywords</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {secondaryKeywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {selectedSolution && (
            <div>
              <Label className="text-xs">Featured Solution</Label>
              <p className="text-sm font-medium">{selectedSolution.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO-optimized title"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metaTitle.length}/60 characters
            </p>
          </div>
          
          <div>
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Brief description for search results"
              maxLength={160}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {metaDescription.length}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Save Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments about this content"
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        <Button 
          onClick={handleSaveContent}
          disabled={isSaving || !content || !title}
          size="lg"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Content...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save to Repository
            </>
          )}
        </Button>
      </div>
    </div>
  );
}