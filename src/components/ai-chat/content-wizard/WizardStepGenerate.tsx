import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Save, CheckCircle2, ExternalLink, PenLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import type { WizardState } from './ContentWizardSidebar';

interface WizardStepGenerateProps {
  wizardState: WizardState;
  onMetaChange: (title: string, description: string) => void;
  onContentGenerated: (content: string) => void;
  onTitleChange: (title: string) => void;
  onClose: () => void;
}

export const WizardStepGenerate: React.FC<WizardStepGenerateProps> = ({
  wizardState,
  onMetaChange,
  onContentGenerated,
  onTitleChange,
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
        const defaultTitle = `${wizardState.keyword} - Complete Guide`;
        onMetaChange(defaultTitle, `Discover everything about ${wizardState.keyword}. Learn best practices, tips, and strategies.`);
        if (!wizardState.title) onTitleChange(defaultTitle);
        return;
      }

      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-proxy', {
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

      if (aiError) throw new Error(aiError.message);

      const content = aiResult?.content || aiResult?.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        onMetaChange(parsed.metaTitle || '', parsed.metaDescription || '');
        if (!wizardState.title) onTitleChange(parsed.metaTitle || `${wizardState.keyword} - Complete Guide`);
      } else {
        const defaultTitle = `${wizardState.keyword} - Complete Guide`;
        onMetaChange(defaultTitle, `Discover everything about ${wizardState.keyword}. Learn best practices, tips, and strategies.`);
        if (!wizardState.title) onTitleChange(defaultTitle);
      }
    } catch {
      const defaultTitle = `${wizardState.keyword} - Complete Guide`;
      onMetaChange(defaultTitle, `Discover everything about ${wizardState.keyword}.`);
      if (!wizardState.title) onTitleChange(defaultTitle);
    } finally {
      setIsGeneratingMeta(false);
    }
  };

  const generateContent = async () => {
    setIsGeneratingContent(true);
    try {
      const outlineText = wizardState.outline.map(s => `${'#'.repeat(s.level + 1)} ${s.title}`).join('\n');

      const serpSelections = [
        ...wizardState.researchSelections.faqs.map(f => ({ type: 'question' as const, content: f, source: 'serp', selected: true })),
        ...wizardState.researchSelections.contentGaps.map(g => ({ type: 'contentGap' as const, content: g, source: 'serp', selected: true })),
        ...wizardState.researchSelections.relatedKeywords.map(k => ({ type: 'keyword' as const, content: k, source: 'serp', selected: true })),
        ...wizardState.researchSelections.serpHeadings.map(h => ({ type: 'heading' as const, content: h, source: 'serp', selected: true })),
      ];

      const targetLength = wizardState.wordCount || 1500;

      const config: ContentGenerationConfig = {
        mainKeyword: wizardState.keyword,
        title: wizardState.title || wizardState.metaTitle || `${wizardState.keyword} - Complete Guide`,
        outline: outlineText,
        secondaryKeywords: wizardState.researchSelections.relatedKeywords.join(', '),
        writingStyle: wizardState.writingStyle,
        expertiseLevel: wizardState.expertiseLevel,
        targetLength,
        contentType: wizardState.contentArticleType,
        contentIntent: 'inform',
        serpSelections,
        selectedSolution: wizardState.selectedSolution,
        additionalInstructions: '',
        includeStats: wizardState.includeStats,
        includeCaseStudies: wizardState.includeCaseStudies,
        includeFAQs: wizardState.includeFAQs,
      };

      const result = await generateAdvancedContent(config);

      if (result) {
        onContentGenerated(result);
        toast.success('Content generated successfully!');
      } else {
        const fallback = wizardState.outline.map(s =>
          `<h${s.level + 1}>${s.title}</h${s.level + 1}>\n<p>Write about ${s.title} here.</p>`
        ).join('\n\n');
        onContentGenerated(fallback);
        toast.warning('AI returned empty content. A draft outline has been created.');
      }
    } catch (err) {
      console.error('Content generation failed:', err);
      const fallback = wizardState.outline.map(s =>
        `<h${s.level + 1}>${s.title}</h${s.level + 1}>\n<p>Write about ${s.title} here.</p>`
      ).join('\n\n');
      onContentGenerated(fallback);
      toast.warning('AI generation failed. A draft outline has been created.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const saveAsDraft = async () => {
    if (!user) { toast.error('Please log in first.'); return; }
    if (!wizardState.title.trim()) { toast.error('Please enter a title.'); return; }
    setIsSaving(true);
    try {
      const relatedKeywords = wizardState.researchSelections.relatedKeywords.slice(0, 5);

      // Build comprehensive metadata matching Content Builder
      const metadata: Record<string, any> = {
        generated_via: 'chat_wizard',
        keyword: wizardState.keyword,
        mainKeyword: wizardState.keyword,
        secondaryKeywords: relatedKeywords,
        writingStyle: wizardState.writingStyle,
        expertiseLevel: wizardState.expertiseLevel,
        contentArticleType: wizardState.contentArticleType,
        outline: wizardState.outline,
        metaTitle: wizardState.metaTitle,
        metaDescription: wizardState.metaDescription,
        wordCount: wizardState.generatedContent.split(/\s+/).length,
        readingTime: Math.ceil(wizardState.generatedContent.split(/\s+/).length / 200),
        word_count_mode: wizardState.wordCountMode,
        outline_sections: wizardState.outline.length,
        selectedSolution: wizardState.selectedSolution ? {
          id: wizardState.selectedSolution.id,
          name: wizardState.selectedSolution.name,
          category: wizardState.selectedSolution.category,
          features: wizardState.selectedSolution.features,
        } : null,
        researchSelections: wizardState.researchSelections,
      };

      // Check for existing content to prevent duplicates
      const { data: existingContent } = await supabase
        .from('content_items')
        .select('id')
        .eq('title', wizardState.title.trim())
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      let contentId: string;

      const insertPayload = {
        title: wizardState.title.trim(),
        content: wizardState.generatedContent,
        user_id: user.id,
        status: 'draft' as const,
        content_type: 'blog' as const,
        seo_score: 0,
        meta_title: wizardState.metaTitle || null,
        meta_description: wizardState.metaDescription || null,
        solution_id: wizardState.selectedSolution?.id || null,
        keywords: { main: wizardState.keyword, secondary: relatedKeywords } as any,
        metadata: metadata as any,
      };

      if (existingContent) {
        const { data, error } = await supabase
          .from('content_items')
          .update({
            content: insertPayload.content,
            meta_title: insertPayload.meta_title,
            meta_description: insertPayload.meta_description,
            seo_score: insertPayload.seo_score,
            metadata: insertPayload.metadata,
            keywords: insertPayload.keywords,
            solution_id: insertPayload.solution_id,
          })
          .eq('id', existingContent.id)
          .select('id')
          .single();
        if (error) throw error;
        contentId = data.id;
      } else {
        const { data, error } = await supabase
          .from('content_items')
          .insert(insertPayload)
          .select('id')
          .single();
        if (error) throw error;
        contentId = data.id;
      }

      // Save keywords and link them
      const allKeywords = [wizardState.keyword, ...relatedKeywords].filter(Boolean);
      const uniqueKeywords = [...new Set(allKeywords)];

      const keywordIds: string[] = [];
      for (const kw of uniqueKeywords) {
        const { data: existing } = await supabase
          .from('keywords')
          .select('id')
          .eq('keyword', kw)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          keywordIds.push(existing.id);
        } else {
          const { data: newKw, error: kwErr } = await supabase
            .from('keywords')
            .insert({ keyword: kw, user_id: user.id })
            .select('id')
            .maybeSingle();
          if (!kwErr && newKw) keywordIds.push(newKw.id);
        }
      }

      if (keywordIds.length > 0) {
        const contentKeywords = keywordIds.map(kid => ({
          content_id: contentId,
          keyword_id: kid,
        }));
        await supabase
          .from('content_keywords')
          .upsert(contentKeywords, { onConflict: 'content_id,keyword_id', ignoreDuplicates: true });
      }

      // Record reuse history
      try {
        const usedFaqs = wizardState.researchSelections.faqs;
        const usedHeadings = wizardState.researchSelections.serpHeadings;
        if (usedFaqs.length + usedHeadings.length > 0) {
          await supabase.from('content_reuse_history').insert({
            user_id: user.id,
            content_id: contentId,
            primary_keyword: wizardState.keyword,
            used_faqs: [...new Set(usedFaqs)],
            used_headings: [...new Set(usedHeadings)],
            used_titles: [wizardState.title.trim()],
          });
        }
      } catch (e) {
        console.warn('Failed to record reuse history (non-critical):', e);
      }

      setSaved(true);
      setSavedId(contentId);
      toast.success(`Saved "${wizardState.title}" as draft!`);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinueEditing = () => {
    if (!savedId) return;
    sessionStorage.setItem('continueEditingContentId', savedId);
    navigate('/content');
    onClose();
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
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button size="sm" variant="outline" onClick={() => { navigate('/repository'); onClose(); }} className="text-xs gap-1 w-full">
            <ExternalLink className="w-3 h-3" /> View in Repository
          </Button>
          <Button size="sm" variant="default" onClick={handleContinueEditing} className="text-xs gap-1 w-full">
            <PenLine className="w-3 h-3" /> Continue Editing
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-xs w-full">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Generate & Save</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Set title, review meta, generate and save</p>
      </div>

      {/* Title Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Title *</label>
        <Input
          value={wizardState.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter content title..."
          className="text-sm"
        />
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
          {/* Content Preview - sanitized */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
              <Badge variant="secondary" className="text-[10px]">
                ~{wizardState.generatedContent.split(/\s+/).length} words
              </Badge>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/20 max-h-[250px] overflow-auto p-3">
              <div
                className="prose prose-sm prose-invert max-w-none text-xs"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(wizardState.generatedContent.slice(0, 3000)) }}
              />
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-2">
            <Button onClick={saveAsDraft} disabled={isSaving || !wizardState.title.trim()} className="flex-1 gap-2">
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
