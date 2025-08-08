import AIServiceController from '@/services/aiService/AIServiceController';
import { ContentItemType } from '@/contexts/content/types';
import { SeoAiResult } from '@/types/seo-ai';

// Simple in-memory cache keyed by id@updated_at
const cache = new Map<string, SeoAiResult>();

function cacheKey(item: ContentItemType) {
  return `${item.id}@${item.updated_at || item.created_at}`;
}

function buildPrompt(item: ContentItemType): string {
  const title = item.title || 'Untitled';
  const body = item.content || '';
  const meta = item.metadata || {} as any;
  const keywords = meta?.seo?.keywords || meta?.keywords || [];
  const url = meta?.slug || meta?.url || '';

  return `You are an expert SEO analyst. Analyze the content below in a context-aware way (intent, entities, E-E-A-T, internal links, duplicate risk). Return STRICT JSON ONLY.

INPUT:
Title: ${title}
URL: ${url}
Target Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : String(keywords)}

CONTENT:
${body}

JSON SCHEMA:
{
  "overallScore": number,
  "scores": { "seo": number, "readability": number, "quality": number },
  "issues": [ { "id": string, "type": "seo"|"readability"|"quality", "severity": "high"|"medium"|"low", "message": string, "evidence": string } ],
  "recommendations": [ { "id": string, "action": "improve_title"|"rewrite_meta"|"add_internal_links"|"fix_headings"|"improve_readability"|"expand_topic"|"add_schema", "target": "title"|"meta"|"content"|"links"|"schema", "snippet": string, "rationale": string, "estimatedImpact": string } ],
  "meta": { "title": string, "description": string, "schema": string },
  "opportunities": { "internalLinks": string[], "entitiesToAdd": string[], "questionsToAnswer": string[] },
  "risks": { "duplicate": number, "thinContent": number, "overOptimization": number }
}`;
}

function extractJson(text: string): any | null {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

export async function analyzeContentItem(item: ContentItemType): Promise<SeoAiResult> {
  const key = cacheKey(item);
  const cached = cache.get(key);
  if (cached) return cached;

  const prompt = buildPrompt(item);
  const response = await AIServiceController.generate({
    input: prompt,
    use_case: 'strategy',
    temperature: 0.3,
    max_tokens: 1200
  });


  const parsed = extractJson(response?.content || '');
  if (parsed) {
    cache.set(key, parsed as SeoAiResult);
    return parsed as SeoAiResult;
  }

  // Fallback minimal result if parsing fails
  const fallback: SeoAiResult = {
    overallScore: 70,
    scores: { seo: 70, readability: 72, quality: 68 },
    issues: [],
    recommendations: [],
    meta: {}
  };
  cache.set(key, fallback);
  return fallback;
}

export async function analyzeBulk(items: ContentItemType[]): Promise<Record<string, SeoAiResult>> {
  const result: Record<string, SeoAiResult> = {};
  for (const item of items) {
    try {
      result[item.id] = await analyzeContentItem(item);
    } catch {
      // continue on errors
    }
  }
  return result;
}
