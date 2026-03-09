import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Sparkles, Save, CheckCircle2, ExternalLink, PenLine, Copy, Clock, FileText, Send, Bold, Italic, Heading1, Heading2, Heading3, Link, List, RefreshCw, ShieldCheck, ChevronDown, Check, X, Package, GraduationCap, AlertTriangle, Zap, ImagePlus, Globe, Twitter, Mail, Megaphone, FileBarChart, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SafeMarkdown } from '@/components/ui/SafeMarkdown';
import { generateAdvancedContent, ContentGenerationConfig } from '@/services/advancedContentGeneration';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { calculateKeywordUsage, calculateKeywordUsageScore } from '@/utils/seo/keywordAnalysis';
import { calculateContentLengthScore, calculateReadabilityScore } from '@/utils/seo/contentAnalysis';
import { extractTitleFromContent } from '@/utils/content/extractTitle';
import { generateMetaSuggestions } from '@/utils/seo/meta/generateMetaSuggestions';
import { detectAIContent } from '@/services/aiContentDetectionService';
import { getRecentUserInstructions } from '@/services/userInstructionsService';
import { analyzeContentQualityWithAI, AIContentQualityResult } from '@/services/aiContentQualityService';
import { analyzeContentCompliance } from '@/services/contentComplianceService';
import { ComplianceAnalysisResult } from '@/types/contentCompliance';
import { wizardToBuilderState } from '@/utils/wizardStateAdapter';
import { getActiveConnection, publishToWebsite } from '@/services/publishing/publishingService';
import ImageGenService from '@/services/imageGenService';
import { cn } from '@/lib/utils';
import type { WizardState } from './ContentWizardSidebar';
import { formatDistanceToNow } from 'date-fns';

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

function calculateSeoScore(
  content: string,
  keyword: string,
  metaTitle: string,
  metaDescription: string
): number {
  // Use Content Builder's proven 3-dimension weighted algorithm
  const keywordUsage = calculateKeywordUsage(content, keyword, []);
  const keywordScore = calculateKeywordUsageScore(keywordUsage, keyword);
  const contentLengthScore = calculateContentLengthScore(content);
  const readabilityScore = calculateReadabilityScore(content);

  // Weighted average (same weights as Content Builder)
  let score = Math.round(
    (keywordScore * 0.4) + (contentLengthScore * 0.3) + (readabilityScore * 0.3)
  );

  // Bonus for meta tag optimization (up to +10)
  if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 5;
  if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 5;

  return Math.min(100, score);
}

interface SeoCheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

function getSeoChecklist(
  content: string,
  keyword: string,
  metaTitle: string,
  metaDescription: string
): SeoCheckItem[] {
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const firstLine = content.split('\n').find(l => l.trim())?.toLowerCase() || '';
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return [
    {
      label: 'Keyword in title',
      passed: firstLine.includes(lowerKeyword),
      detail: firstLine.includes(lowerKeyword) ? 'Found in H1' : 'Add keyword to your main heading',
    },
    {
      label: 'Keyword in intro',
      passed: lowerContent.substring(0, 200).includes(lowerKeyword),
      detail: lowerContent.substring(0, 200).includes(lowerKeyword) ? 'Appears in first 200 chars' : 'Add keyword to opening paragraph',
    },
    {
      label: 'Meta title length',
      passed: metaTitle.length >= 50 && metaTitle.length <= 60,
      detail: `${metaTitle.length}/60 chars${metaTitle.length < 50 ? ' (too short)' : metaTitle.length > 60 ? ' (too long)' : ''}`,
    },
    {
      label: 'Meta description length',
      passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      detail: `${metaDescription.length}/160 chars${metaDescription.length < 120 ? ' (too short)' : metaDescription.length > 160 ? ' (too long)' : ''}`,
    },
    {
      label: 'Has H2 headings',
      passed: /^## /m.test(content),
      detail: /^## /m.test(content) ? 'Content has subheadings' : 'Add ## headings for structure',
    },
    {
      label: 'Word count > 800',
      passed: wordCount > 800,
      detail: `${wordCount} words${wordCount <= 800 ? ' (aim for 800+)' : ''}`,
    },
    {
      label: 'Has formatting',
      passed: /^[-*+] /m.test(content) || /\*\*.+?\*\*/m.test(content),
      detail: (/^[-*+] /m.test(content) || /\*\*.+?\*\*/m.test(content)) ? 'Lists or bold text found' : 'Add lists or bold text',
    },
    // Content Builder parity items
    (() => {
      const kwUsage = calculateKeywordUsage(content, keyword, []);
      const mainKw = kwUsage.find(k => k.keyword.toLowerCase() === keyword.toLowerCase());
      const density = mainKw ? parseFloat(mainKw.density.replace('%', '')) : 0;
      return {
        label: 'Keyword density',
        passed: density >= 1 && density <= 3,
        detail: `${density.toFixed(1)}% (optimal: 1-3%)`,
      };
    })(),
    (() => {
      const sentences = content.split(/[.!?]+/).filter(Boolean);
      const words = content.split(/\s+/).filter(Boolean);
      const avg = sentences.length > 0 ? words.length / sentences.length : 0;
      return {
        label: 'Readability',
        passed: avg <= 25,
        detail: `Avg sentence: ${Math.round(avg)} words${avg > 25 ? ' (shorten sentences)' : ''}`,
      };
    })(),
  ];
}
interface WizardStepGenerateProps {
  wizardState: WizardState;
  onMetaChange: (title: string, description: string) => void;
  onContentGenerated: (content: string) => void;
  onTitleChange: (title: string) => void;
  onClose: () => void;
  onRepurpose?: (contentType: string, sourceContent: string, keyword: string) => void;
}

export const WizardStepGenerate: React.FC<WizardStepGenerateProps> = ({
  wizardState,
  onMetaChange,
  onContentGenerated,
  onTitleChange,
  onClose,
  onRepurpose,
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

  // Phase 5 state
  const [generationStage, setGenerationStage] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [aiHumanScore, setAiHumanScore] = useState<number | null>(null);
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Phase 1A: AI Quality Grade
  const [aiQualityResult, setAiQualityResult] = useState<AIContentQualityResult | null>(null);
  const [isAnalyzingQuality, setIsAnalyzingQuality] = useState(false);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  // Phase 1B: Compliance Analysis
  const [complianceResult, setComplianceResult] = useState<ComplianceAnalysisResult | null>(null);

  // Phase 1C: Content Gap Detection
  const [detectedGaps, setDetectedGaps] = useState<string[]>([]);

  // Phase 1D: Auto-Save
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveContentRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Phase 2A: Publish menu state
  const [activeConnectionProvider, setActiveConnectionProvider] = useState<'wordpress' | 'wix' | null>(null);
  const [isPublishingExternal, setIsPublishingExternal] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Phase 2B: Image generation state
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Abort controller for generation cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Phase 2A: Detect active website connection on mount
  useEffect(() => {
    getActiveConnection().then(({ provider }) => setActiveConnectionProvider(provider));
  }, []);

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

  // Recompute SEO score when content changes
  useEffect(() => {
    if (!quick && editableContent) {
      const score = calculateSeoScore(editableContent, wizardState.keyword, wizardState.metaTitle, wizardState.metaDescription);
      setSeoScore(score);
    }
  }, [editableContent, wizardState.metaTitle, wizardState.metaDescription, wizardState.keyword, quick]);

  // Phase 1A + 1B: Run quality & compliance analysis after content generation
  const runQualityAnalysis = useCallback(async (content: string) => {
    if (!content || quick) return;
    const builderState = wizardToBuilderState(wizardState, content);

    // 1B: Compliance (synchronous, rule-based)
    try {
      const compliance = analyzeContentCompliance(content, builderState);
      setComplianceResult(compliance);
    } catch (e) {
      console.warn('Compliance analysis failed:', e);
    }

    // 1A: AI Quality Grade (async)
    setIsAnalyzingQuality(true);
    try {
      const quality = await analyzeContentQualityWithAI(content, builderState);
      setAiQualityResult(quality);
    } catch (e) {
      console.warn('AI quality analysis failed:', e);
    } finally {
      setIsAnalyzingQuality(false);
    }
  }, [wizardState, quick]);

  // Phase 1C: Detect content gaps not covered
  useEffect(() => {
    if (!editableContent || quick) { setDetectedGaps([]); return; }
    const gaps = wizardState.researchSelections.contentGaps || [];
    if (gaps.length === 0) { setDetectedGaps([]); return; }
    const lowerContent = editableContent.toLowerCase();
    const missing = gaps.filter(gap => {
      const words = gap.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      // If at least half the significant words are missing, it's a gap
      const found = words.filter(w => lowerContent.includes(w)).length;
      return words.length > 0 && found / words.length < 0.5;
    });
    setDetectedGaps(missing);
  }, [editableContent, wizardState.researchSelections.contentGaps, quick]);

  // Phase 1D: Auto-save draft every 60s if content changed
  useEffect(() => {
    if (!editableContent || !user || !wizardState.title.trim()) return;

    // Clear previous timer
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      // Only save if content actually changed
      if (editableContent === autoSaveContentRef.current) return;

      setIsAutoSaving(true);
      try {
        const sanitized = sanitizeTitle(wizardState.title.trim(), wizardState.metaTitle, wizardState.keyword, editableContent);
        const resolvedContentType = FORMAT_TO_DB_ENUM[wizardState.contentType] || 'blog';

        const { data: existing } = await supabase
          .from('content_items')
          .select('id')
          .eq('title', sanitized)
          .eq('user_id', user.id)
          .eq('status', 'draft')
          .maybeSingle();

        const payload = {
          title: sanitized,
          content: editableContent,
          user_id: user.id,
          status: 'draft' as any,
          content_type: resolvedContentType as any,
          metadata: { generated_via: 'chat_wizard', keyword: wizardState.keyword, auto_saved: true } as any,
        };

        if (existing) {
          await supabase.from('content_items').update({ content: payload.content, metadata: payload.metadata }).eq('id', existing.id);
        } else {
          await supabase.from('content_items').insert(payload);
        }

        autoSaveContentRef.current = editableContent;
        setLastAutoSaved(new Date());
      } catch (e) {
        console.warn('Auto-save failed:', e);
      } finally {
        setIsAutoSaving(false);
      }
    }, 60000); // 60 seconds

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [editableContent, user, wizardState.title, wizardState.keyword, wizardState.contentType, wizardState.metaTitle]);

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
              content: `Generate an SEO meta title (between 50-60 characters, MUST be at least 50) and meta description (between 120-160 characters) for a blog about "${wizardState.keyword}". Solution: ${wizardState.selectedSolution?.name || 'N/A'}. Return JSON: {"metaTitle": "...", "metaDescription": "..."}`
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

  // Build additional instructions from company/brand context + content brief + user instructions
  const buildAdditionalInstructions = async (): Promise<string> => {
    const parts: string[] = [];

    if (wizardState.additionalInstructions) {
      parts.push(wizardState.additionalInstructions);
    }

    // Structured brand voice section
    const brandParts: string[] = [];
    if (companyContext) {
      brandParts.push(`Company: ${companyContext.name}${companyContext.industry ? ` (${companyContext.industry})` : ''}`);
      if (companyContext.mission) brandParts.push(`Mission: ${companyContext.mission}`);
    }
    if (brandContext) {
      const tone = Array.isArray(brandContext.tone) ? brandContext.tone.join(', ') : '';
      const doUse = Array.isArray(brandContext.do_use) ? brandContext.do_use.join(', ') : '';
      const dontUse = Array.isArray(brandContext.dont_use) ? brandContext.dont_use.join(', ') : '';
      if (tone) brandParts.push(`Tone: ${tone}`);
      if (doUse) brandParts.push(`DO use: ${doUse}`);
      if (dontUse) brandParts.push(`DON'T use: ${dontUse}`);
    }
    if (brandParts.length > 0) {
      parts.push(`BRAND VOICE (follow strictly):\n${brandParts.join('\n')}`);
    }

    const brief = wizardState.contentBrief;
    if (brief.targetAudience) parts.push(`Target audience: ${brief.targetAudience}`);
    if (brief.contentGoal) parts.push(`Content goal: ${brief.contentGoal}`);
    if (brief.tone) parts.push(`Desired tone: ${brief.tone}`);
    if (brief.specificPoints) parts.push(`Specific points: ${brief.specificPoints}`);

    // Phase 5: Integrate user's most-used instructions
    try {
      const recentInstructions = await getRecentUserInstructions('content_generation', undefined, 3);
      if (recentInstructions.length > 0) {
        parts.push(`USER'S PREFERRED INSTRUCTIONS (from history):\n${recentInstructions.map(i => `- ${i.instruction_text}`).join('\n')}`);
      }
    } catch { /* non-critical */ }

    return parts.join('\n');
  };

  const buildKeywordRichFallback = () => {
    const keyword = wizardState.keyword || 'Topic';
    const title = wizardState.title || wizardState.metaTitle || `${keyword} - Complete Guide`;
    const faqs = wizardState.researchSelections.faqs || [];
    const secondaryKw = wizardState.researchSelections.relatedKeywords || [];

    let fallback = `# ${title}\n\n${keyword} is a topic that requires detailed exploration. This guide covers everything you need to know.\n\n`;

    if (wizardState.outline.length > 0) {
      for (const s of wizardState.outline) {
        fallback += `${'#'.repeat(s.level + 1)} ${s.title}\n\n`;
        fallback += `[Expand this section about ${s.title} as it relates to ${keyword}. Include specific examples, data points, and actionable insights.]\n\n`;
      }
    }

    if (faqs.length > 0) {
      fallback += `## Frequently Asked Questions\n\n`;
      for (const faq of faqs.slice(0, 5)) {
        fallback += `### ${faq}\n\n[Answer this question with specific, helpful information.]\n\n`;
      }
    }

    if (secondaryKw.length > 0) {
      fallback += `---\n*Related keywords: ${secondaryKw.join(', ')}*\n`;
    }

    return fallback;
  };

  const abortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGeneratingContent(false);
    setGenerationStage('');
    setGenerationProgress(0);
    toast.info('Generation cancelled');
  };

  const generateContent = async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGeneratingContent(true);
    setGenerationStage('Building prompt...');
    setGenerationProgress(5);
      const outlineText = wizardState.outline.map(s => `${'#'.repeat(s.level + 1)} ${s.title}`).join('\n');

      const serpSelections = [
        ...wizardState.researchSelections.faqs.map(f => ({ type: 'question' as const, content: f, source: 'serp', selected: true })),
        ...wizardState.researchSelections.contentGaps.map(g => ({ type: 'contentGap' as const, content: g, source: 'serp', selected: true })),
        ...wizardState.researchSelections.relatedKeywords.map(k => ({ type: 'keyword' as const, content: k, source: 'serp', selected: true })),
        ...wizardState.researchSelections.serpHeadings.map(h => ({ type: 'heading' as const, content: h, source: 'serp', selected: true })),
        ...(wizardState.researchSelections.entities?.map(e => ({ type: 'entity' as const, content: e, source: 'serp', selected: true })) || []),
      ];

      const targetLength = wizardState.wordCount || 1500;
      const additionalInstructions = await buildAdditionalInstructions();

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
        additionalInstructions,
        includeStats: wizardState.includeStats,
        includeCaseStudies: wizardState.includeCaseStudies,
        includeFAQs: wizardState.includeFAQs,
        formatType: wizardState.contentType,
      };

      if (controller.signal.aborted) return;
      setGenerationStage('Generating content...');
      const result = await generateAdvancedContent(config);

      if (result) {
        onContentGenerated(result);
        setEditableContent(result);

        // Phase 5: Post-generation quality analysis
        setGenerationStage('Analyzing quality...');
        try {
          const detection = await detectAIContent(result);
          if (detection) {
            setAiHumanScore(detection.adjustedHumanScore);
          }
        } catch { /* non-critical */ }

        // Phase 1A+1B: Run quality & compliance analysis
        runQualityAnalysis(result);

        toast.success('Content generated successfully!');
      } else {
        const fallback = buildKeywordRichFallback();
        onContentGenerated(fallback);
        setEditableContent(fallback);
        toast.warning('AI returned empty content. A keyword-rich draft outline has been created.');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || controller.signal.aborted) return;
      console.error('Content generation failed:', err);
      const fallback = buildKeywordRichFallback();
      onContentGenerated(fallback);
      setEditableContent(fallback);
      toast.warning('AI generation failed. A keyword-rich draft outline has been created.');
    } finally {
      setIsGeneratingContent(false);
      setGenerationStage('');
    }
  };

  // Phase 5: Refinement loop
  const refineContent = async () => {
    if (!refinementInstruction.trim() || !editableContent) return;
    setIsRefining(true);
    try {
      const provider = await getProvider();
      if (!provider) { toast.error('No AI provider configured'); return; }

      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model || 'gpt-4',
            messages: [
              { role: 'system', content: 'You are an expert content editor. Improve the given content based on the user\'s feedback. Keep the same structure and format (markdown). Return ONLY the improved content, no explanations.' },
              { role: 'user', content: `Here is existing content to improve:\n\n${editableContent}\n\nImprovement requested: ${refinementInstruction}\n\nRewrite the content incorporating this feedback while keeping the same structure.` }
            ],
            max_tokens: 4000,
            temperature: 0.7,
          }
        }
      });

      if (aiError) throw new Error(aiError.message);
      const refined = aiResult?.data?.choices?.[0]?.message?.content || aiResult?.choices?.[0]?.message?.content || aiResult?.content || '';
      if (refined) {
        setEditableContent(refined);
        onContentGenerated(refined);
        setRefinementInstruction('');
        toast.success('Content refined!');

        // Re-run AI detection
        try {
          const detection = await detectAIContent(refined);
          if (detection) setAiHumanScore(detection.adjustedHumanScore);
        } catch {}
      }
    } catch (err) {
      console.error('Refinement failed:', err);
      toast.error('Refinement failed. Try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const contentToSave = editableContent || wizardState.generatedContent;
  const wordCountNum = contentToSave.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCountNum / 200);

  const copyContent = () => {
    navigator.clipboard.writeText(contentToSave);
    toast.success('Content copied to clipboard!');
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editableContent.substring(start, end) || 'text';
    const newContent = editableContent.substring(0, start) + prefix + selectedText + suffix + editableContent.substring(end);
    setEditableContent(newContent);
    onContentGenerated(newContent);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Phase 2A: Publish to external website
  const publishExternal = async () => {
    if (!activeConnectionProvider || !contentToSave) return;
    setIsPublishingExternal(true);
    try {
      const result = await publishToWebsite({
        title: wizardState.title || wizardState.metaTitle || wizardState.keyword,
        contentMd: contentToSave,
        excerpt: wizardState.metaDescription || undefined,
        tags: wizardState.researchSelections.relatedKeywords.slice(0, 5),
        status: 'publish',
      });
      if (result.ok && result.url) {
        setPublishedUrl(result.url);
        toast.success(`Published to ${activeConnectionProvider === 'wordpress' ? 'WordPress' : 'Wix'}!`);
      } else {
        toast.error(result.error || 'Publish failed');
      }
    } catch (err) {
      console.error('External publish error:', err);
      toast.error('Failed to publish externally');
    } finally {
      setIsPublishingExternal(false);
    }
  };

  // Phase 2B: Generate image and insert into content
  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const prompt = `High quality blog illustration for: ${wizardState.title || wizardState.keyword}. Professional, modern style.`;
      const result = await ImageGenService.generateImage({ prompt, size: '1024x1024' });
      if (result && (result.url || result.base64)) {
        const imageUrl = result.url || `data:image/png;base64,${result.base64}`;
        const altText = wizardState.keyword || 'Generated image';
        const markdownImage = `\n![${altText}](${imageUrl})\n`;
        
        const textarea = textareaRef.current;
        const cursorPos = textarea?.selectionStart || editableContent.length;
        const newContent = editableContent.substring(0, cursorPos) + markdownImage + editableContent.substring(cursorPos);
        setEditableContent(newContent);
        onContentGenerated(newContent);
      }
    } catch (err) {
      console.error('Image generation failed:', err);
      toast.error('Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- Core save logic (shared by draft & publish) ---
  const saveContent = async (status: 'draft' | 'published') => {
    if (!user) { toast.error('Please log in first.'); return; }
    if (!wizardState.title.trim()) { toast.error('Please enter a title.'); return; }
    setIsSaving(true);
    try {
      const relatedKeywords = wizardState.researchSelections.relatedKeywords.slice(0, 5);
      const sanitizedTitle = sanitizeTitle(wizardState.title.trim(), wizardState.metaTitle, wizardState.keyword, contentToSave);

      let finalMetaTitle = wizardState.metaTitle;
      let finalMetaDescription = wizardState.metaDescription;
      if (!finalMetaTitle) {
        finalMetaTitle = extractTitleFromContent(contentToSave) || sanitizedTitle || wizardState.keyword;
      }
      if (!finalMetaDescription) {
        const suggestions = generateMetaSuggestions(contentToSave, wizardState.keyword, sanitizedTitle);
        finalMetaDescription = suggestions.metaDescription;
      }

      const resolvedContentType = FORMAT_TO_DB_ENUM[wizardState.contentType] || 'blog';
      const finalSeoScore = quick ? null : calculateSeoScore(contentToSave, wizardState.keyword, finalMetaTitle, finalMetaDescription);
      const documentStructure = extractDocumentStructure(contentToSave);

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
        seoScore: finalSeoScore,
        documentStructure: documentStructure ? JSON.parse(JSON.stringify(documentStructure)) : null,
        selectionStats,
        lastOptimized: new Date().toISOString(),
        analysisTimestamp: new Date().toISOString(),
        ...(status === 'published' && { publishedAt: new Date().toISOString() }),
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
              title: r.title, url: r.link, position: r.position, snippet: r.snippet,
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
        solutionIntegrationMetrics: wizardState.selectedSolution ? (() => {
          const solMetrics = analyzeSolutionIntegration(contentToSave, {
            name: wizardState.selectedSolution.name,
            features: Array.isArray(wizardState.selectedSolution.features) ? wizardState.selectedSolution.features : [],
            painPoints: Array.isArray(wizardState.selectedSolution.painPoints) ? wizardState.selectedSolution.painPoints : [],
            targetAudience: Array.isArray(wizardState.selectedSolution.targetAudience) ? wizardState.selectedSolution.targetAudience : [],
          });
          return {
            solutionMentions: solMetrics.nameMentions,
            featuresCovered: solMetrics.mentionedFeatures.length,
            totalFeatures: Array.isArray(wizardState.selectedSolution.features) ? wizardState.selectedSolution.features.length : 0,
            featureIncorporation: solMetrics.featureIncorporation,
            positioningScore: solMetrics.positioningScore,
            mentionedFeatures: solMetrics.mentionedFeatures,
            integrationScore: solMetrics.featureIncorporation,
          };
        })() : null,
      };

      if (companyContext) {
        metadata.companyContext = { name: companyContext.name, industry: companyContext.industry, mission: companyContext.mission };
      }
      if (brandContext) {
        metadata.brandContext = { tone: brandContext.tone, keywords: brandContext.keywords, doUse: brandContext.do_use, dontUse: brandContext.dont_use };
      }

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
        seo_score: quick ? null : finalSeoScore,
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
        const { data: existing } = await supabase.from('keywords').select('id').eq('keyword', kw).eq('user_id', user.id).maybeSingle();
        if (existing) {
          keywordIds.push(existing.id);
        } else {
          const { data: newKw, error: kwErr } = await supabase.from('keywords').insert({ keyword: kw, user_id: user.id }).select('id').maybeSingle();
          if (!kwErr && newKw) keywordIds.push(newKw.id);
        }
      }
      if (keywordIds.length > 0) {
        const contentKeywords = keywordIds.map(kid => ({ content_id: contentId, keyword_id: kid }));
        await supabase.from('content_keywords').upsert(contentKeywords, { onConflict: 'content_id,keyword_id', ignoreDuplicates: true });
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
    // Phase 5: Save wizard context for richer editing
    sessionStorage.setItem('wizardContext', JSON.stringify({
      keyword: wizardState.keyword,
      researchSelections: wizardState.researchSelections,
      outline: wizardState.outline,
      serpData: wizardState.serpData,
      selectedSolution: wizardState.selectedSolution ? {
        id: wizardState.selectedSolution.id,
        name: wizardState.selectedSolution.name,
      } : null,
    }));
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

        {/* Phase 2C: Repurpose Quick Actions */}
        {onRepurpose && (
          <div className="w-full max-w-[280px] mt-2">
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">Repurpose this content</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                { type: 'social-twitter', label: 'Social Post', icon: Twitter },
                { type: 'email', label: 'Email', icon: Mail },
                { type: 'google-ads', label: 'Ad Copy', icon: Megaphone },
                { type: 'blog', label: 'Summary', icon: FileBarChart },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => onRepurpose(item.type, contentToSave, wizardState.keyword)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border/30 bg-muted/30 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
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
            <p className={cn("text-[10px]", wizardState.metaTitle.length < 50 ? "text-destructive" : "text-muted-foreground")}>{wizardState.metaTitle.length}/60 characters{wizardState.metaTitle.length < 50 ? ' (min 50)' : ''}</p>
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
        <div className="space-y-2">
          <Button onClick={generateContent} disabled={isGeneratingContent} className="w-full gap-2">
            {isGeneratingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGeneratingContent ? 'Generating...' : 'Generate Content'}
          </Button>
          {isGeneratingContent && (
            <Button variant="outline" size="sm" onClick={abortGeneration} className="w-full gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
              <X className="w-3.5 h-3.5" /> Cancel Generation
            </Button>
          )}
          {generationStage && (
            <p className="text-[10px] text-muted-foreground text-center animate-pulse">{generationStage}</p>
          )}
        </div>
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-[10px] gap-1">
                      {wordCountNum.toLocaleString()} words
                    </Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Clock className="w-2.5 h-2.5" /> {readingTime} min
                    </Badge>
                    {!quick && seoScore !== null && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] gap-1 border",
                          seoScore >= 70 ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                          seoScore >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/15 text-red-400 border-red-500/30'
                        )}
                      >
                        SEO: {seoScore}
                      </Badge>
                    )}
                    {aiHumanScore !== null && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] gap-1 border",
                          aiHumanScore >= 60 ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                          aiHumanScore >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                          aiHumanScore >= 25 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/15 text-red-400 border-red-500/30'
                        )}
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {aiHumanScore >= 60 ? `Human: ${aiHumanScore}%` :
                         aiHumanScore >= 40 ? `Value Pass: ${aiHumanScore}%` :
                         aiHumanScore >= 25 ? `Quality OK: ${aiHumanScore}%` :
                         `AI Detected: ${aiHumanScore}%`}
                      </Badge>
                    )}
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
                    <div className="w-px h-4 bg-border mx-0.5" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      title="Generate Image" 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                    >
                      {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
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

          {/* Phase 1A: AI Quality Grade Badge */}
          {!quick && (aiQualityResult || isAnalyzingQuality) && (
            <div className="space-y-1.5">
              <button
                onClick={() => setShowQualityDetails(!showQualityDetails)}
                className="flex items-center gap-2 w-full text-left"
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border",
                  isAnalyzingQuality ? "border-border animate-pulse bg-muted" :
                  aiQualityResult?.overall.grade === 'A' ? "bg-primary/15 text-primary border-primary/30" :
                  aiQualityResult?.overall.grade === 'B' ? "bg-primary/10 text-primary border-primary/20" :
                  aiQualityResult?.overall.grade === 'C' ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                  "bg-destructive/15 text-destructive border-destructive/30"
                )}>
                  {isAnalyzingQuality ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : aiQualityResult?.overall.grade}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground">AI Quality Grade</span>
                  {aiQualityResult && (
                    <p className="text-[10px] text-muted-foreground truncate">{aiQualityResult.overall.summary}</p>
                  )}
                </div>
                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", showQualityDetails && "rotate-180")} />
              </button>

              {showQualityDetails && aiQualityResult && (
                <div className="space-y-1.5 pl-10">
                  {[
                    { label: 'Intent Matching', score: aiQualityResult.intentMatching.score },
                    { label: 'Keyword Integration', score: aiQualityResult.keywordIntegration.score },
                    { label: 'Content Depth', score: aiQualityResult.contentDepth.score },
                    { label: 'User Engagement', score: aiQualityResult.userEngagement.score },
                    { label: 'SEO Effectiveness', score: aiQualityResult.seoEffectiveness.score },
                  ].map(dim => (
                    <div key={dim.label} className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground w-28 flex-shrink-0">{dim.label}</span>
                      <Progress value={dim.score} className="h-1.5 flex-1" />
                      <span className="text-foreground font-medium w-7 text-right">{dim.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phase 1B: Compliance Analysis */}
          {!quick && complianceResult && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Compliance ({complianceResult.overall.score}/100)
                </span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 pt-1 pb-2">
                  {[
                    { label: 'Keyword', score: complianceResult.keyword.score, weight: '30%', topViolation: complianceResult.keyword.violations[0]?.message },
                    { label: 'SERP', score: complianceResult.serp.score, weight: '25%', topViolation: complianceResult.serp.violations[0]?.message },
                    { label: 'Solution', score: complianceResult.solution.score, weight: '25%', topViolation: complianceResult.solution.violations[0]?.message },
                    { label: 'Structure', score: complianceResult.structure.score, weight: '20%', topViolation: complianceResult.structure.violations[0]?.message },
                  ].map(dim => (
                    <div key={dim.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{dim.label} <span className="opacity-60">({dim.weight})</span></span>
                        <span className={cn(
                          "font-medium",
                          dim.score >= 70 ? "text-primary" : dim.score >= 40 ? "text-yellow-400" : "text-destructive"
                        )}>{dim.score}</span>
                      </div>
                      <Progress value={dim.score} className="h-1" />
                      {dim.topViolation && (
                        <p className="text-[9px] text-muted-foreground flex items-start gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          {dim.topViolation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Phase 1C: Content Gap Chip + Refinement input */}
          {detectedGaps.length > 0 && (
            <button
              onClick={() => {
                const suggestion = `Add coverage of ${detectedGaps.slice(0, 3).join(', ')} — these are gaps in competitor content`;
                setRefinementInstruction(suggestion);
              }}
              className="flex items-center gap-1.5 text-[10px] text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <Zap className="w-3 h-3" />
              <span>{detectedGaps.length} content gap{detectedGaps.length > 1 ? 's' : ''} detected — click to auto-fill refinement</span>
            </button>
          )}

          {/* Refinement input */}
          <div className="flex gap-1.5">
            <Input
              value={refinementInstruction}
              onChange={(e) => setRefinementInstruction(e.target.value)}
              placeholder="How should this be improved?"
              className="text-xs h-8 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !isRefining && refineContent()}
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refineContent} 
              disabled={isRefining || !refinementInstruction.trim()} 
              className="text-xs h-8 gap-1 flex-shrink-0"
            >
              {isRefining ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Refine
            </Button>
          </div>

          {/* SEO Checklist (blog formats only) */}
          {!quick && seoScore !== null && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SEO Checklist ({getSeoChecklist(editableContent, wizardState.keyword, wizardState.metaTitle, wizardState.metaDescription).filter(i => i.passed).length}/{getSeoChecklist(editableContent, wizardState.keyword, wizardState.metaTitle, wizardState.metaDescription).length} passed)
                </span>
                <ChevronDown className="w-3 h-3 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-1 pb-2">
                  {getSeoChecklist(editableContent, wizardState.keyword, wizardState.metaTitle, wizardState.metaDescription).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[10px]">
                      {item.passed ? (
                        <Check className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className={cn("font-medium", item.passed ? "text-foreground" : "text-destructive")}>{item.label}</span>
                        <span className="text-muted-foreground ml-1">· {item.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Solution Integration Summary */}
          {wizardState.selectedSolution && editableContent && (() => {
            const solMetrics = analyzeSolutionIntegration(editableContent, {
              name: wizardState.selectedSolution!.name,
              features: Array.isArray(wizardState.selectedSolution!.features) ? wizardState.selectedSolution!.features : [],
              painPoints: Array.isArray(wizardState.selectedSolution!.painPoints) ? wizardState.selectedSolution!.painPoints : [],
              targetAudience: Array.isArray(wizardState.selectedSolution!.targetAudience) ? wizardState.selectedSolution!.targetAudience : [],
            });
            const totalFeatures = Array.isArray(wizardState.selectedSolution!.features) ? wizardState.selectedSolution!.features.length : 0;
            return (
              <div className="rounded-lg border border-border/20 bg-muted/20 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <Package className="w-3 h-3" /> Solution Integration
                </div>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-foreground">
                    <span className="font-semibold">{solMetrics.nameMentions}</span> mentions of "{wizardState.selectedSolution!.name}"
                  </span>
                  {totalFeatures > 0 && (
                    <span className="text-foreground">
                      <span className="font-semibold">{solMetrics.mentionedFeatures.length}/{totalFeatures}</span> features covered
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Save as Draft + Publish dropdown */}
          <div className="flex gap-2">
            <Button onClick={() => saveContent('draft')} disabled={isSaving || !wizardState.title.trim()} className="flex-1 gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" disabled={isSaving || !wizardState.title.trim()} className="gap-1 text-xs">
                  <Send className="w-3 h-3" /> Publish <ChevronDown className="w-3 h-3 ml-0.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-1.5 space-y-0.5">
                <button
                  onClick={() => saveContent('published')}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left"
                >
                  <Send className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Save as Published</span>
                </button>
                {activeConnectionProvider === 'wordpress' && (
                  <button
                    onClick={publishExternal}
                    disabled={isPublishingExternal}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left disabled:opacity-50"
                  >
                    {isPublishingExternal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Publish to WordPress</span>
                  </button>
                )}
                {activeConnectionProvider === 'wix' && (
                  <button
                    onClick={publishExternal}
                    disabled={isPublishingExternal}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left disabled:opacity-50"
                  >
                    {isPublishingExternal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span>Publish to Wix</span>
                  </button>
                )}
                {!activeConnectionProvider && (
                  <button
                    onClick={() => { navigate('/settings'); onClose(); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs hover:bg-accent transition-colors text-left text-muted-foreground"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Connect Website</span>
                  </button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Published URL badge */}
          {publishedUrl && (
            <a 
              href={publishedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Published: {publishedUrl}
            </a>
          )}

          {/* Phase 1D: Auto-save timestamp */}
          {lastAutoSaved && (
            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
              {isAutoSaving ? (
                <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Auto-saving...</>
              ) : (
                <><Clock className="w-2.5 h-2.5" /> Auto-saved {formatDistanceToNow(lastAutoSaved, { addSuffix: true })}</>
              )}
            </p>
          )}

          <Button variant="outline" onClick={generateContent} disabled={isGeneratingContent} className="w-full gap-1 text-xs">
            <Sparkles className="w-3 h-3" /> Regenerate
          </Button>
        </>
      )}
    </div>
  );
};
