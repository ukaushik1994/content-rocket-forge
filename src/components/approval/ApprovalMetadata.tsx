
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentItemType } from '@/contexts/content/types';
import { useApproval } from './context/ApprovalContext';
import { FileText, Wand2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';

interface ApprovalMetadataProps {
  content: ContentItemType;
}

export const ApprovalMetadata: React.FC<ApprovalMetadataProps> = ({ content }) => {
  const [metaTitle, setMetaTitle] = useState(content.metadata?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(content.metadata?.metaDescription || content.metadata?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizingField, setOptimizingField] = useState<'title' | 'description' | null>(null);
  
  const { generateMetadata } = useApproval();
  const { updateContentItem } = useContent();

  const mainKeyword = useMemo(() => (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim(), [content]);

  useEffect(() => {
    setMetaTitle(content.metadata?.metaTitle || '');
    setMetaDescription(content.metadata?.metaDescription || content.metadata?.description || '');
  }, [content]);
  
  const keywordIncluded = (text: string) => {
    if (!mainKeyword) return null;
    return text.toLowerCase().includes(mainKeyword.toLowerCase());
  };

  const handleGenerateMetadata = async () => {
    setIsGenerating(true);
    try {
      const metadata = await generateMetadata(content);
      const prev = { title: metaTitle, description: metaDescription };
      setMetaTitle(metadata.title);
      setMetaDescription(metadata.description);
      toast.success('Generated SEO metadata', {
        action: {
          label: 'Undo',
          onClick: () => {
            setMetaTitle(prev.title);
            setMetaDescription(prev.description);
          }
        }
      });
    } catch (error) {
      console.error('Error generating metadata:', error);
      toast.error('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleOptimizeField = async (field: 'title' | 'description') => {
    setOptimizingField(field);
    try {
      const metadata = await generateMetadata(content);
      const prevTitle = metaTitle;
      const prevDesc = metaDescription;
      if (field === 'title') {
        setMetaTitle(metadata.title);
      } else {
        setMetaDescription(metadata.description);
      }
      toast.success(`Optimized meta ${field}`, {
        action: {
          label: 'Undo',
          onClick: () => {
            setMetaTitle(prevTitle);
            setMetaDescription(prevDesc);
          }
        },
        duration: 5000
      });
    } catch (e) {
      toast.error('Optimization failed');
    } finally {
      setOptimizingField(null);
    }
  };
  
  const handleSaveMetadata = async () => {
    try {
      await updateContentItem(content.id, {
        metadata: {
          ...content.metadata,
          metaTitle,
          metaDescription
        }
      });
      toast.success('Metadata saved successfully');
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error('Failed to save metadata');
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            <p className="text-sm font-medium">SEO Metadata</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/10 hover:bg-white/10"
            onClick={handleGenerateMetadata}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2 text-neon-purple" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
        
        <div className="grid gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="meta-title" className="text-xs text-white/70">Meta Title ({metaTitle.length}/60)</label>
              {mainKeyword && (
                <div className={`text-[10px] ${keywordIncluded(metaTitle) ? 'text-green-400' : 'text-amber-400'}`}>
                  {keywordIncluded(metaTitle) ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span> : <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Add keyword</span>}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                maxLength={60}
                placeholder="SEO-optimized title for search results"
              />
              <Button size="sm" variant="ghost" onClick={() => handleOptimizeField('title')} disabled={optimizingField==='title'}>
                {optimizingField==='title' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-neon-purple" />}
              </Button>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="meta-description" className="text-xs text-white/70">Meta Description ({metaDescription.length}/160)</label>
              {mainKeyword && (
                <div className={`text-[10px] ${keywordIncluded(metaDescription) ? 'text-green-400' : 'text-amber-400'}`}>
                  {keywordIncluded(metaDescription) ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span> : <span className="inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Add keyword</span>}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="bg-white/5 border-white/10 resize-none"
                maxLength={160}
                rows={2}
                placeholder="Brief description for search engine results"
              />
              <Button size="sm" variant="ghost" onClick={() => handleOptimizeField('description')} disabled={optimizingField==='description'}>
                {optimizingField==='description' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-neon-purple" />}
              </Button>
            </div>
            <div className="mt-2 text-[11px] text-white/60">
              <div className="border border-white/10 rounded-md p-2 bg-white/5">
                <div className="text-primary/80">{metaTitle || content.title}</div>
                <div className="text-muted-foreground truncate">https://example.com/{content.slug || 'your-article'}</div>
                <div className="text-white/80 line-clamp-2">{metaDescription || content.excerpt || ''}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSaveMetadata}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              Save Metadata
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
