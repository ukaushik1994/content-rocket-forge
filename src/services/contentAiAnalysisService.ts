import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import AIServiceController from '@/services/aiService/AIServiceController';
import { ContentItemType } from '@/contexts/content/types';

export interface ContentAnalysisRecord {
  id: string;
  content_id: string;
  user_id: string;
  ai_provider?: string | null;
  model?: string | null;
  prompt_version?: string | null;
  settings_snapshot?: any;
  analysis?: any;
  seo_score?: number | null;
  readability_score?: number | null;
  reanalyze_count?: number;
  analyzed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentAnalysisSettings {
  id?: string;
  user_id?: string;
  prompt_template?: string | null;
  scoring_metrics?: any;
  version?: string | null;
  created_at?: string;
  updated_at?: string;
}

function extractJson(text: string): any | null {
  if (!text) return null;
  // Try JSON fenced block first
  const block = text.match(/```json[\s\S]*?```/i) || text.match(/```[\s\S]*?```/i);
  if (block) {
    const inner = block[0].replace(/```json|```/gi, '').trim();
    try { return JSON.parse(inner); } catch {}
  }
  // Try first object
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function buildAnalysisPrompt(item: ContentItemType, settings?: ContentAnalysisSettings): string {
  const title = item.title || 'Untitled';
  const body = item.content || '';
  const meta = item.metadata || ({} as any);
  const keywords = meta?.seo?.keywords || meta?.keywords || [];
  const requestedMetrics = Array.isArray(settings?.scoring_metrics) ? settings?.scoring_metrics : [];
  const promptHeader = settings?.prompt_template?.trim() || 'You are an expert SEO analyst. Provide a structured, actionable analysis.';

  return `${promptHeader}\n\nReturn STRICT JSON ONLY with this schema.\n\nINPUT:\nTitle: ${title}\nTarget Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : String(keywords)}\n\nCONTENT:\n${body}\n\nJSON SCHEMA:\n{\n  "overallScore": number,\n  "scores": { "seo": number, "readability": number, "quality": number },\n  "issues": [ { "id": string, "type": "seo"|"readability"|"quality", "severity": "high"|"medium"|"low", "message": string, "evidence": string } ],\n  "recommendations": [ { "id": string, "action": string, "target": string, "snippet": string, "rationale": string, "estimatedImpact": string } ],\n  "meta": { "title": string, "description": string, "schema": string },\n  "opportunities": { "internalLinks": string[], "entitiesToAdd": string[], "questionsToAnswer": string[] },\n  "risks": { "duplicate": number, "thinContent": number, "overOptimization": number },\n  "requestedMetrics": ${JSON.stringify(requestedMetrics || [])}\n}`;
}

export const contentAiAnalysisService = {
  async getExistingAnalysis(contentId: string): Promise<ContentAnalysisRecord | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('content_ai_analyses')
      .select('*')
      .eq('content_id', contentId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('getExistingAnalysis error:', error);
      return null;
    }
    return (data as unknown as ContentAnalysisRecord) || null;
  },

  async getSettings(): Promise<ContentAnalysisSettings | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
      .from('content_analysis_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('getSettings error:', error);
      return null;
    }
    return (data as unknown as ContentAnalysisSettings) || null;
  },

  async upsertSettings(partial: Omit<ContentAnalysisSettings, 'user_id' | 'id'>): Promise<ContentAnalysisSettings | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const payload = { ...partial, user_id: userId } as any;
    const { data, error } = await supabase
      .from('content_analysis_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('upsertSettings error:', error);
      return null;
    }
    return (data as unknown as ContentAnalysisSettings) || null;
  },

  async analyzeOnce(item: ContentItemType): Promise<ContentAnalysisRecord | null> {
    const existing = await this.getExistingAnalysis(item.id);
    if (existing) return existing;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const settings = await this.getSettings();
    const prompt = buildAnalysisPrompt(item, settings || undefined);

    const response = await AIServiceController.generate({
      input: prompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 1500
    });

    const parsed = extractJson(response?.content || '') || {};
    const seoScore = parsed?.scores?.seo ?? parsed?.overallScore ?? null;
    const readabilityScore = parsed?.scores?.readability ?? null;

    const insertPayload: Database['public']['Tables']['content_ai_analyses']['Insert'] = {
      content_id: item.id,
      user_id: userId,
      ai_provider: response?.provider_used || null,
      model: response?.model_used || null,
      prompt_version: settings?.version || 'v1',
      settings_snapshot: settings ? { prompt_template: settings.prompt_template, scoring_metrics: settings.scoring_metrics, version: settings.version } : {},
      analysis: parsed,
      seo_score: typeof seoScore === 'number' ? Math.round(seoScore) : null,
      readability_score: typeof readabilityScore === 'number' ? Math.round(readabilityScore) : null,
      reanalyze_count: 0,
      analyzed_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('content_ai_analyses')
      .insert(insertPayload)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('analyzeOnce insert error:', error);
      return null;
    }

    return (data as unknown as ContentAnalysisRecord) || null;
  },

  async reanalyze(item: ContentItemType): Promise<ContentAnalysisRecord | null> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    const settings = await this.getSettings();
    const prompt = buildAnalysisPrompt(item, settings || undefined);

    const response = await AIServiceController.generate({
      input: prompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 1500
    });

    const parsed = extractJson(response?.content || '') || {};
    const seoScore = parsed?.scores?.seo ?? parsed?.overallScore ?? null;
    const readabilityScore = parsed?.scores?.readability ?? null;

    // Compute next reanalyze_count based on existing row
    const existing = await this.getExistingAnalysis(item.id);
    const nextCount = (existing?.reanalyze_count ?? 0) + 1;

    const updatePayload: Database['public']['Tables']['content_ai_analyses']['Update'] = {
      analysis: parsed,
      seo_score: typeof seoScore === 'number' ? Math.round(seoScore) : null,
      readability_score: typeof readabilityScore === 'number' ? Math.round(readabilityScore) : null,
      ai_provider: response?.provider_used || null,
      model: response?.model_used || null,
      prompt_version: settings?.version || 'v1',
      settings_snapshot: settings ? { prompt_template: settings.prompt_template, scoring_metrics: settings.scoring_metrics, version: settings.version } : {},
      analyzed_at: new Date().toISOString(),
      reanalyze_count: nextCount
    };

    const { data: updated, error } = await supabase
      .from('content_ai_analyses')
      .update(updatePayload)
      .eq('content_id', item.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('reanalyze update error:', error);
      return null;
    }

    if (updated) {
      return updated as unknown as ContentAnalysisRecord;
    }

    // If no existing row, fallback to insert
    return this.analyzeOnce(item);
  }
};
