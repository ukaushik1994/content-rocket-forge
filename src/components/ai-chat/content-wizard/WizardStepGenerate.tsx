import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Save, CheckCircle2, ExternalLink, PenLine, Copy, Clock, FileText, Send, Bold, Italic, Heading1, Heading2, Heading3, Link, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SafeMarkdown } from '@/components/ui/SafeMarkdown';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';
import type { WizardState } from './ContentWizardSidebar';

// --- Format categories ---
const BLOG_FORMATS = ['blog', 'landing-page'];
const isQuickFormat = (ct: string) => !BLOG_FORMATS.includes(ct);

// --- Map wizard format IDs to valid DB enum values ---
const FORMAT_TO_DB_ENUM: Record<string, string> = {
  'blog': 'blog',
  'social-twitter': 'social_twitter',
  'social-linkedin': 'social_linkedin',
  'social-facebook': 'social_facebook',
  'social-instagram': 'social_instagram',
  'email': 'email',
  'landing-page': 'landing_page',
  'script': 'script',
  'meme': 'meme',
  'carousel': 'carousel',
  'google-ads': 'google_ads',
  'glossary': 'glossary',
};

// --- GAP 6 FIX: Title sanitization (same logic as Content Builder) ---
const AI_PREAMBLE_PATTERNS = [
  /^here\s+are/i,
  /^sure[,!]/i,
  /^i['']ll/i,
  /^let\s+me/i,
  /^certainly/i,
  /^of\s+course/i,
  /^great[,!]/i,
  /^absolutely/i,
  /^\d+\s+(unique|creative|compelling|engaging)/i,
];

function sanitizeTitle(
  contentTitle: string | null | undefined,
  metaTitle: string | null | undefined,
  mainKeyword: string | null | undefined,
  content: string | null | undefined
): string {
  if (contentTitle) {
    const isAIPreamble = contentTitle.length > 100 ||
      AI_PREAMBLE_PATTERNS.some(p => p.test(contentTitle));
    if (!isAIPreamble) return contentTitle.substring(0, 120);
  }
  if (metaTitle && metaTitle.length <= 120) return metaTitle;
  if (content) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1].length <= 120) return h1Match[1];
  }
  return mainKeyword || 'Untitled Content';
}

// --- GAP 2 FIX: Lightweight SEO score calculation ---
function calculateSeoScore(
  content: string,
  keyword: string,
  metaTitle: string,
  metaDescription: string
): number {
  let score = 0;
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  // Keyword in title area (first heading or first line)
  const firstLine = content.split('\n').find(l => l.trim())?.toLowerCase() || '';
  if (firstLine.includes(lowerKeyword)) score += 20;

  // Keyword in first 200 chars
  if (lowerContent.substring(0, 200).includes(lowerKeyword)) score += 15;

  // Meta title length 50-60 chars
  if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 15;
  else if (metaTitle.length >= 30 && metaTitle.length <= 70) score += 8;

  // Meta description length 120-160 chars
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 15;
  else if (metaDescription.length >= 80 && metaDescription.length <= 200) score += 8;

  // Has H2 headings
  if (/^## /m.test(content)) score += 15;

  // Word count > 800
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount > 800) score += 10;

  // Has lists or bold formatting
  if (/^[-*+] /m.test(content) || /\*\*.+?\*\*/m.test(content)) score += 10;

  return Math.min(score, 100);
}

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
  const [savedStatus, setSavedStatus] = useState<'draft' | 'published'>('draft');
  const [editorTab, setEditorTab] = useState<string>('preview');
  const [editableContent, setEditableContent] = useState('');
  const [companyContext, setCompanyContext] = useState<any>(null);
  const [brandContext, setBrandContext] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load company & brand context on mount
  useEffect(() => {
    if (!user) return;
    const loadContext = async () => {
      const [companyRes, brandRes] = await Promise.all([
        supabase.from('company_info').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('brand_guidelines').select('*').eq('user_id', user.id).maybeSingle(),
      ]);
      if (companyRes.data) setCompanyContext(companyRes.data);
      if (brandRes.data) setBrandContext(brandRes.data);
    };
    loadContext();
  }, [user]);

  const quick = isQuickFormat(wizardState.contentType);

  useEffect(() => {
    if (!quick && !wizardState.metaTitle) generateMeta();
  }, []);

  // Sync editable content with generated content
  useEffect(() => {
    if (wizardState.generatedContent && !editableContent) {
      setEditableContent(wizardState.generatedContent);
    }
  }, [wizardState.generatedContent]);

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

      const content = aiResult?.data?.choices?.[0]?.message?.content || aiResult?.choices?.[0]?.message?.content || aiResult?.content || '';
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

  // Build additional instructions from company/brand context + content brief
  const buildAdditionalInstructions = (): string => {
    const parts: string[] = [];

    if (wizardState.additionalInstructions) {
      parts.push(wizardState.additionalInstructions);
    }

    if (companyContext) {
      parts.push(`Company: ${companyContext.name}${companyContext.industry ? ` (${companyContext.industry})` : ''}${companyContext.mission ? `. Mission: ${companyContext.mission}` : ''}`);
    }

    if (brandContext) {
      const tone = Array.isArray(brandContext.tone) ? brandContext.tone.join(', ') : '';
      const doUse = Array.isArray(brandContext.do_use) ? brandContext.do_use.join(', ') : '';
      const dontUse = Array.isArray(brandContext.dont_use) ? brandContext.dont_use.join(', ') : '';
      if (tone) parts.push(`Brand tone: ${tone}`);
      if (doUse) parts.push(`DO use: ${doUse}`);
      if (dontUse) parts.push(`DON'T use: ${dontUse}`);
    }

    const brief = wizardState.contentBrief;
    if (brief.targetAudience) parts.push(`Target audience: ${brief.targetAudience}`);
    if (brief.contentGoal) parts.push(`Content goal: ${brief.contentGoal}`);
    if (brief.tone) parts.push(`Desired tone: ${brief.tone}`);
    if (brief.specificPoints) parts.push(`Specific points: ${brief.specificPoints}`);

    return parts.join('\n');
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
        outline: quick ? '' : outlineText,
        secondaryKeywords: wizardState.researchSelections.relatedKeywords.join(', '),
        writingStyle: wizardState.writingStyle,
        expertiseLevel: wizardState.expertiseLevel,
        targetLength,
        contentType: wizardState.contentArticleType,
        contentIntent: (wizardState.contentBrief.contentGoal as any) || 'inform',
        serpSelections: quick ? [] : serpSelections,
        selectedSolution: wizardState.selectedSolution,
        additionalInstructions: buildAdditionalInstructions(),
        includeStats: wizardState.includeStats,
        includeCaseStudies: wizardState.includeCaseStudies,
        includeFAQs: wizardState.includeFAQs,
        formatType: wizardState.contentType,
      };

      const result = await generateAdvancedContent(config);

      if (result) {
        onContentGenerated(result);
        setEditableContent(result);
        toast.success('Content generated successfully!');
      } else {
        const fallback = wizardState.outline.map(s =>
          `<h${s.level + 1}>${s.title}</h${s.level + 1}>\n<p>Write about ${s.title} here.</p>`
        ).join('\n\n');
        onContentGenerated(fallback);
        setEditableContent(fallback);
        toast.warning('AI returned empty content. A draft outline has been created.');
      }
    } catch (err) {
      console.error('Content generation failed:', err);
      const fallback = wizardState.outline.map(s =>
        `<h${s.level + 1}>${s.title}</h${s.level + 1}>\n<p>Write about ${s.title} here.</p>`
      ).join('\n\n');
      onContentGenerated(fallback);
      setEditableContent(fallback);
      toast.warning('AI generation failed. A draft outline has been created.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const contentToSave = editableContent || wizardState.generatedContent;
  const wordCountNum = contentToSave.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCountNum / 200);

  const copyContent = () => {
    navigator.clipboard.writeText(contentToSave);
    toast.success('Content copied to clipboard!');
  };

  // --- GAP 9 FIX: Insert markdown formatting at cursor position ---
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editableContent.substring(start, end) || 'text';
    const newContent =
      editableContent.substring(0, start) +
      prefix + selectedText + suffix +
      editableContent.substring(end);

    setEditableContent(newContent);
    onContentGenerated(newContent);

    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // --- Core save logic (shared by draft & publish) ---
  const saveContent = async (status: 'draft' | 'published') => {
    if (!user) { toast.error('Please log in first.'); return; }
    if (!wizardState.title.trim()) { toast.error('Please enter a title.'); return; }
    setIsSaving(true);
    try {
      const relatedKeywords = wizardState.researchSelections.relatedKeywords.slice(0, 5);

      // --- GAP 6: Sanitize title ---
      const sanitizedTitle = sanitizeTitle(
        wizardState.title.trim(),
        wizardState.metaTitle,
        wizardState.keyword,
        contentToSave
      );

      // --- GAP 7: Auto-generate missing meta at save time ---
      let finalMetaTitle = wizardState.metaTitle;
      let finalMetaDescription = wizardState.metaDescription;

      if (!finalMetaTitle) {
        finalMetaTitle = extractTitleFromContent(contentToSave) || sanitizedTitle || wizardState.keyword;
      }
      if (!finalMetaDescription) {
        const suggestions = generateMetaSuggestions(contentToSave, wizardState.keyword, sanitizedTitle);
        finalMetaDescription = suggestions.metaDescription;
      }

      // --- GAP 1: Map content type to valid DB enum ---
      const resolvedContentType = FORMAT_TO_DB_ENUM[wizardState.contentType] || 'blog';

      // --- SEO score: only for blog formats ---
      const seoScore = quick ? null : calculateSeoScore(contentToSave, wizardState.keyword, finalMetaTitle, finalMetaDescription);

      // --- GAP 5: Build document structure ---
      const documentStructure = extractDocumentStructure(contentToSave);

      // --- GAP 5: Build selection stats ---
      const selectionStats = {
        totalSelected:
          wizardState.researchSelections.faqs.length +
          wizardState.researchSelections.contentGaps.length +
          wizardState.researchSelections.relatedKeywords.length +
          wizardState.researchSelections.serpHeadings.length,
        byType: {
          questions: wizardState.researchSelections.faqs.length,
          contentGaps: wizardState.researchSelections.contentGaps.length,
          relatedSearches: wizardState.researchSelections.relatedKeywords.length,
          headings: wizardState.researchSelections.serpHeadings.length,
        },
      };

      // Build comprehensive metadata matching Content Builder shape
      const metadata: Record<string, any> = {
        generated_via: 'chat_wizard',
        keyword: wizardState.keyword,
        mainKeyword: wizardState.keyword,
        secondaryKeywords: relatedKeywords,
        writingStyle: wizardState.writingStyle,
        expertiseLevel: wizardState.expertiseLevel,
        contentArticleType: wizardState.contentArticleType,
        contentFormat: wizardState.contentType,
        contentIntent: wizardState.contentBrief.contentGoal || 'inform',
        outline: wizardState.outline,
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        wordCount: wordCountNum,
        readingTime,
        word_count_mode: wizardState.wordCountMode,
        outline_sections: wizardState.outline.length,
        additionalInstructions: wizardState.additionalInstructions || undefined,
        selectedSolution: wizardState.selectedSolution ? {
          id: wizardState.selectedSolution.id,
          name: wizardState.selectedSolution.name,
          category: wizardState.selectedSolution.category,
          features: wizardState.selectedSolution.features,
          useCases: wizardState.selectedSolution.useCases,
          painPoints: wizardState.selectedSolution.painPoints,
          targetAudience: wizardState.selectedSolution.targetAudience,
        } : null,
        contentBrief: wizardState.contentBrief,
        researchSelections: wizardState.researchSelections,

        // --- NEW: Metadata parity fields ---
        seoScore,
        documentStructure: documentStructure ? JSON.parse(JSON.stringify(documentStructure)) : null,
        selectionStats,
        lastOptimized: new Date().toISOString(),
        analysisTimestamp: new Date().toISOString(),
        ...(status === 'published' && { publishedAt: new Date().toISOString() }),

        // --- SERP Metrics & Comprehensive SERP Data ---
        comprehensiveSerpData: wizardState.serpData ? JSON.parse(JSON.stringify({
          serpMetrics: {
            searchVolume: wizardState.serpData.searchVolume || null,
            keywordDifficulty: wizardState.serpData.keywordDifficulty || null,
            competitionScore: wizardState.serpData.competition || null,
            intent: wizardState.serpData.intent || 'informational',
            totalResults: wizardState.serpData.totalResults || 0,
            competitorAnalyzed: (wizardState.serpData.topResults || []).length,
          },
          competitorAnalysis: {
            topCompetitors: (wizardState.serpData.topResults || []).map((r: any) => ({
              title: r.title,
              url: r.link,
              position: r.position,
              snippet: r.snippet,
            })),
          },
          rankingOpportunities: {
            featuredSnippet: (wizardState.serpData.contentGaps || []).some((g: any) =>
              (g.opportunity || '').toLowerCase().includes('featured')) || false,
            paaTargets: (wizardState.serpData.peopleAlsoAsk || []).length,
            contentGaps: (wizardState.serpData.contentGaps || []).length,
          },
          selectionStats,
          analysisTimestamp: new Date().toISOString(),
        })) : null,

        // Flatten for backward compat (Repository detail views check both paths)
        serpMetrics: wizardState.serpData ? {
          searchVolume: wizardState.serpData.searchVolume || null,
          keywordDifficulty: wizardState.serpData.keywordDifficulty || null,
          competitionScore: wizardState.serpData.competition || null,
          intent: wizardState.serpData.intent || 'informational',
          totalResults: wizardState.serpData.totalResults || 0,
        } : null,
        rankingOpportunities: wizardState.serpData ? {
          featuredSnippet: false,
          paaTargets: wizardState.researchSelections.faqs.length,
          contentGaps: wizardState.researchSelections.contentGaps.length,
        } : null,
        competitorAnalysis: (wizardState.serpData?.topResults) ? {
          topCompetitors: wizardState.serpData.topResults.slice(0, 5).map((r: any) => ({
            title: r.title, url: r.link, position: r.position,
          })),
        } : null,

        // Solution integration metrics (compute at save time)
        solutionIntegrationMetrics: wizardState.selectedSolution ? {
          solutionMentions: (contentToSave.match(
            new RegExp(wizardState.selectedSolution.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          ) || []).length,
          featuresCovered: Array.isArray(wizardState.selectedSolution.features) 
            ? wizardState.selectedSolution.features.filter((f: string) =>
                contentToSave.toLowerCase().includes(f.toLowerCase())
              ).length 
            : 0,
          totalFeatures: Array.isArray(wizardState.selectedSolution.features)
            ? wizardState.selectedSolution.features.length
            : 0,
          integrationScore: null,
        } : null,
      };

      // Add company/brand context to metadata if available
      if (companyContext) {
        metadata.companyContext = {
          name: companyContext.name,
          industry: companyContext.industry,
          mission: companyContext.mission,
        };
      }
      if (brandContext) {
        metadata.brandContext = {
          tone: brandContext.tone,
          keywords: brandContext.keywords,
          doUse: brandContext.do_use,
          dontUse: brandContext.dont_use,
        };
      }

      // Check for existing content to prevent duplicates
      const { data: existingContent } = await supabase
        .from('content_items')
        .select('id')
        .eq('title', sanitizedTitle)
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .maybeSingle();

      let contentId: string;

      const insertPayload = {
        title: sanitizedTitle,
        content: contentToSave,
        user_id: user.id,
        status: status as any,
        content_type: resolvedContentType as any,
        seo_score: quick ? null : seoScore,
        meta_title: quick ? null : (finalMetaTitle || null),
        meta_description: quick ? null : (finalMetaDescription || null),
        solution_id: wizardState.selectedSolution?.id || null,
        keywords: { main: wizardState.keyword, secondary: relatedKeywords } as any,
        metadata: metadata as any,
      };

      if (existingContent) {
        const { data, error } = await supabase
          .from('content_items')
          .update({
            content: insertPayload.content,
            status: insertPayload.status,
            content_type: insertPayload.content_type,
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
            used_titles: [sanitizedTitle],
          });
        }
      } catch (e) {
        console.warn('Failed to record reuse history (non-critical):', e);
      }

      setSaved(true);
      setSavedId(contentId);
      setSavedStatus(status);
      toast.success(`${status === 'published' ? 'Published' : 'Saved'} "${sanitizedTitle}" successfully!`);
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
          <p className="text-sm font-medium text-foreground">
            Content {savedStatus === 'published' ? 'Published' : 'Saved'}!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {savedStatus === 'published' ? 'Your content is live' : 'Your draft is in the Repository'}
          </p>
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

      {/* Meta Fields - only for blog formats */}
      {!quick && (
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
      )}

      {/* Generate Button */}
      {!wizardState.generatedContent ? (
        <Button onClick={generateContent} disabled={isGeneratingContent} className="w-full gap-2">
          {isGeneratingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGeneratingContent ? 'Generating...' : 'Generate Content'}
        </Button>
      ) : (
        <>
          {/* Rich Content Editor with Write/Preview tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <TabsList className="h-7">
                    <TabsTrigger value="preview" className="text-[10px] px-2 py-1 h-6 gap-1">
                      <FileText className="w-3 h-3" /> Preview
                    </TabsTrigger>
                    <TabsTrigger value="write" className="text-[10px] px-2 py-1 h-6 gap-1">
                      <PenLine className="w-3 h-3" /> Edit
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      {wordCountNum.toLocaleString()} words
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Clock className="w-2.5 h-2.5" /> {readingTime} min
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyContent}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <TabsContent value="preview" className="mt-0">
                  <div className="rounded-lg border border-border/20 bg-muted/20 max-h-[300px] overflow-auto p-3">
                    <div className="prose prose-sm prose-invert max-w-none text-xs">
                      <SafeMarkdown>{editableContent || contentToSave}</SafeMarkdown>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="write" className="mt-0">
                  {/* --- GAP 5 FIX: Compact formatting toolbar --- */}
                  <div className="flex items-center gap-0.5 mb-1.5 flex-wrap">
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Heading 1" onClick={() => insertFormatting('# ', '')}>
                      <Heading1 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Heading 2" onClick={() => insertFormatting('## ', '')}>
                      <Heading2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Heading 3" onClick={() => insertFormatting('### ', '')}>
                      <Heading3 className="w-3 h-3" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Bold" onClick={() => insertFormatting('**', '**')}>
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Italic" onClick={() => insertFormatting('*', '*')}>
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Link" onClick={() => insertFormatting('[', '](url)')}>
                      <Link className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="List" onClick={() => insertFormatting('- ', '')}>
                      <List className="w-3 h-3" />
                    </Button>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    value={editableContent}
                    onChange={(e) => {
                      setEditableContent(e.target.value);
                      onContentGenerated(e.target.value);
                    }}
                    className="text-xs min-h-[300px] font-mono resize-none"
                    placeholder="Edit your content here..."
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* --- GAP 4 FIX: Save as Draft + Publish buttons --- */}
          <div className="flex gap-2">
            <Button onClick={() => saveContent('draft')} disabled={isSaving || !wizardState.title.trim()} className="flex-1 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </Button>
            <Button variant="secondary" onClick={() => saveContent('published')} disabled={isSaving || !wizardState.title.trim()} className="gap-1 text-xs">
              <Send className="w-3 h-3" /> Publish
            </Button>
          </div>
          <Button variant="outline" onClick={generateContent} disabled={isGeneratingContent} className="w-full gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> Regenerate
          </Button>
        </>
      )}
    </div>
  );
};
