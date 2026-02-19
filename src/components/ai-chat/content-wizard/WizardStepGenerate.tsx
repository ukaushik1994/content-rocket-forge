import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, Save, CheckCircle2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { WizardState } from './ContentWizardSidebar';

interface WizardStepGenerateProps {
  wizardState: WizardState;
  onMetaChange: (title: string, description: string) => void;
  onContentGenerated: (content: string) => void;
  onClose: () => void;
}

export const WizardStepGenerate: React.FC<WizardStepGenerateProps> = ({
  wizardState,
  onMetaChange,
  onContentGenerated,
  onClose,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!wizardState.metaTitle) generateMeta();
  }, []);

  const getProvider = async () => {
    const { data } = await supabase.from('ai_service_providers')
      .select('api_key, provider, preferred_model')
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1).single();
    return data;
  };

  const generateMeta = async () => {
    setIsGeneratingMeta(true);
    try {
      const provider = await getProvider();
      if (!provider) {
        onMetaChange(`${wizardState.keyword} - Complete Guide`, `Discover everything about ${wizardState.keyword}. Learn best practices, tips, and strategies.`);
        return;
      }

      const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model || 'gpt-4',
            messages: [{
              role: 'user',
              content: `Generate an SEO meta title (under 60 chars) and meta description (under 160 chars) for a blog about "${wizardState.keyword}". Solution: ${wizardState.selectedSolution?.name || 'N/A'}. Return JSON: {"metaTitle": "...", "metaDescription": "..."}`
            }],
            max_tokens: 200,
          }
        }
      });

      const content = aiResult?.content || aiResult?.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        onMetaChange(parsed.metaTitle || '', parsed.metaDescription || '');
      }
    } catch {
      onMetaChange(`${wizardState.keyword} - Complete Guide`, `Discover everything about ${wizardState.keyword}.`);
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const generateContent = async () => {
    setIsGeneratingContent(true);
    try {
      const provider = await getProvider();
      if (!provider) {
        toast.error('No AI provider configured. Go to Settings to add your API key.');
        return;
      }

      const outlineText = wizardState.outline.map(s => `${'#'.repeat(s.level + 1)} ${s.title}`).join('\n');
      const researchContext = [
        wizardState.researchSelections.faqs.length ? `FAQs to address: ${wizardState.researchSelections.faqs.join('; ')}` : '',
        wizardState.researchSelections.contentGaps.length ? `Content gaps: ${wizardState.researchSelections.contentGaps.join('; ')}` : '',
        wizardState.researchSelections.relatedKeywords.length ? `Keywords to incorporate: ${wizardState.researchSelections.relatedKeywords.join(', ')}` : '',
      ].filter(Boolean).join('\n');

      const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model || 'gpt-4',
            messages: [
              {
                role: 'system',
                content: `You are an expert content writer. Write a ${wizardState.contentType} article. Target: ~${wizardState.wordCount || 1500} words. Output clean HTML with h2, h3, p, ul, li tags. No meta tags or JSON.`
              },
              {
                role: 'user',
                content: `Write about "${wizardState.keyword}" for solution "${wizardState.selectedSolution?.name || 'our product'}".\n\nOutline:\n${outlineText}\n\nResearch context:\n${researchContext}\n\nSolution features: ${wizardState.selectedSolution?.features?.slice(0, 5).join(', ') || 'N/A'}`
              }
            ],
            max_tokens: (wizardState.wordCount || 1500) * 3,
          }
        }
      });

      const generated = aiResult?.content || aiResult?.choices?.[0]?.message?.content || '';
      if (generated) {
        onContentGenerated(generated);
        toast.success('Content generated successfully!');
      } else {
        toast.error('AI returned empty content. Try again.');
      }
    } catch (err) {
      toast.error('Content generation failed. Check your AI provider settings.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const saveAsDraft = async () => {
    if (!user) { toast.error('Please log in first.'); return; }
    setIsSaving(true);
    try {
      const titleMatch = wizardState.generatedContent.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
      const autoTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : `${wizardState.keyword} - ${wizardState.contentType}`;

      const insertData: any = {
        user_id: user.id,
        title: wizardState.metaTitle || autoTitle,
        content: wizardState.generatedContent,
        content_type: wizardState.contentType || 'blog',
        main_keyword: wizardState.keyword,
        secondary_keywords: wizardState.researchSelections.relatedKeywords.slice(0, 5),
        status: 'draft' as const,
        meta_title: wizardState.metaTitle || null,
        meta_description: wizardState.metaDescription || null,
        solution_id: wizardState.selectedSolution?.id || null,
        metadata: {
          generated_via: 'chat_wizard',
          keyword: wizardState.keyword,
          solution_id: wizardState.selectedSolution?.id,
          word_count_mode: wizardState.wordCountMode,
          outline_sections: wizardState.outline.length,
        }
      };
      const { data, error } = await supabase.from('content_items').insert(insertData).select('id, title').single();

      if (error) throw error;
      setSaved(true);
      setSavedId(data.id);
      toast.success(`Saved "${data.title}" as draft!`);
    } catch (err) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (saved && savedId) {
    return (
      <div className="flex flex-col items-center py-12 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Content Saved!</p>
          <p className="text-xs text-muted-foreground mt-1">Your draft is in the Repository</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { navigate('/repository'); onClose(); }} className="text-xs gap-1">
            <ExternalLink className="w-3 h-3" /> View in Repository
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Generate & Save</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Review meta info, generate, and save</p>
      </div>

      {/* Meta Fields */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            Meta Title
            {isGeneratingMeta && <Loader2 className="w-3 h-3 animate-spin" />}
          </label>
          <Input
            value={wizardState.metaTitle}
            onChange={(e) => onMetaChange(e.target.value, wizardState.metaDescription)}
            placeholder="SEO title..."
            className="text-xs h-8"
          />
          <p className="text-[10px] text-muted-foreground">{wizardState.metaTitle.length}/60 characters</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Meta Description</label>
          <Textarea
            value={wizardState.metaDescription}
            onChange={(e) => onMetaChange(wizardState.metaTitle, e.target.value)}
            placeholder="SEO description..."
            className="text-xs min-h-[60px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground">{wizardState.metaDescription.length}/160 characters</p>
        </div>
      </div>

      {/* Generate Button */}
      {!wizardState.generatedContent ? (
        <Button onClick={generateContent} disabled={isGeneratingContent} className="w-full gap-2">
          {isGeneratingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGeneratingContent ? 'Generating...' : 'Generate Content'}
        </Button>
      ) : (
        <>
          {/* Content Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
              <Badge variant="secondary" className="text-[10px]">
                ~{wizardState.generatedContent.split(/\s+/).length} words
              </Badge>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/20 max-h-[250px] overflow-auto p-3">
              <div className="prose prose-sm prose-invert max-w-none text-xs" dangerouslySetInnerHTML={{ __html: wizardState.generatedContent.slice(0, 3000) }} />
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-2">
            <Button onClick={saveAsDraft} disabled={isSaving} className="flex-1 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </Button>
            <Button variant="outline" onClick={generateContent} disabled={isGeneratingContent} className="gap-1 text-xs">
              <Sparkles className="w-3 h-3" /> Regenerate
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
