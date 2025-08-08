import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { sendChatRequest, ChatMessage } from '@/services/aiService';

// PDF.js imports (Vite compatible)
import * as pdfjsLib from 'pdfjs-dist';
// Use ?url to get the worker file URL in Vite
// @ts-ignore - Vite will resolve this URL
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl as any;

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => (item.str ?? '')).join(' ');
    fullText += `\n\n[PAGE ${pageNum}]\n` + pageText;
  }
  return fullText.trim();
}

async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Use browser build of mammoth to avoid Node deps
  // @ts-ignore
  const mammoth = await import('mammoth/mammoth.browser');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || '').trim();
}

function safeJsonFromText(text: string): any | null {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try to extract from code block
  const match = text.match(/```json[\s\S]*?```/i) || text.match(/```[\s\S]*?```/i);
  if (match) {
    const inner = match[0].replace(/```json|```/g, '').trim();
    try { return JSON.parse(inner); } catch {}
  }
  // Try to find first JSON object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  return null;
}

function normalizePartialEnhancedSolution(data: any): Partial<EnhancedSolution> {
  if (!data || typeof data !== 'object') return {};

  const asString = (v: any) => (typeof v === 'string' ? v : undefined);
  const asStringArray = (v: any) =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === 'string' ? [v] : [];

  const toResources = (arr: any) =>
    Array.isArray(arr)
      ? arr
          .filter((r: any) => r && (r.title || r.name) && (r.url || r.link))
          .map((r: any, idx: number) => ({
            id: (crypto as any).randomUUID?.() || `${Date.now()}-${idx}`,
            title: String(r.title ?? r.name),
            url: String(r.url ?? r.link),
            category: (r.category as any) || 'other',
            order: Number(r.order ?? idx) || 0,
          }))
      : undefined;

  // Market data
  const marketDataSrc = (data.marketData || data.market || {}) as any;
  const marketData =
    marketDataSrc && typeof marketDataSrc === 'object'
      ? {
          marketSize: marketDataSrc.marketSize ?? marketDataSrc.size ?? undefined,
          growthRate: marketDataSrc.growthRate ?? marketDataSrc.cagr ?? undefined,
          regions: asStringArray(marketDataSrc.regions),
          compliance: asStringArray(marketDataSrc.compliance),
        }
      : undefined;

  // Competitors
  const competitors = Array.isArray(data.competitors)
    ? data.competitors.map((c: any) => ({
        name: asString(c.name) ?? '',
        strengths: asStringArray(c.strengths),
        weaknesses: asStringArray(c.weaknesses),
        marketShare: c.marketShare ?? c.share ?? undefined,
      }))
    : undefined;

  // Technical specs
  const techSrc = (data.technicalSpecs || data.tech || data.technology || {}) as any;
  const technicalSpecs =
    techSrc && typeof techSrc === 'object'
      ? {
          systemRequirements: asStringArray(techSrc.systemRequirements),
          supportedPlatforms: asStringArray(techSrc.supportedPlatforms ?? techSrc.platforms),
          apiCapabilities: asStringArray(techSrc.apiCapabilities ?? techSrc.apis),
          security: asStringArray(techSrc.security),
        }
      : undefined;

  // Pricing
  const pricingSrc = (data.pricing || data.pricingModel || {}) as any;
  const pricing =
    pricingSrc && typeof pricingSrc === 'object'
      ? {
          model: asString(pricingSrc.model),
          tiers: Array.isArray(pricingSrc.tiers)
            ? pricingSrc.tiers.map((t: any) => ({
                name: asString(t.name) ?? '',
                price: asString(t.price) ?? (t.price !== undefined ? String(t.price) : undefined),
                features: asStringArray(t.features),
              }))
            : undefined,
          freeTrial: pricingSrc.freeTrial ?? pricingSrc.trial ?? undefined,
          basePrice: pricingSrc.basePrice ?? pricingSrc.startingAt ?? undefined,
          billingCycle: asString(pricingSrc.billingCycle),
        }
      : undefined;

  // Case studies
  const caseStudies = Array.isArray(data.caseStudies)
    ? data.caseStudies.map((cs: any, idx: number) => ({
        id: cs.id ?? ((crypto as any).randomUUID?.() || `${Date.now()}-cs-${idx}`),
        title: asString(cs.title) ?? '',
        customer: asString(cs.customer) ?? cs.company ?? undefined,
        challenge: asString(cs.challenge),
        solution: asString(cs.solution),
        results: asString(cs.results),
        metrics: typeof cs.metrics === 'object' ? cs.metrics : undefined,
      }))
    : undefined;

  const metrics = typeof data.metrics === 'object' ? data.metrics : undefined;

  const metadata =
    typeof data.metadata === 'object'
      ? {
          title: asString(data.metadata.title),
          description: asString(data.metadata.description),
          keywords: asStringArray(data.metadata.keywords),
          canonicalUrl: asString(data.metadata.canonicalUrl ?? data.metadata.canonical),
        }
      : undefined;

  return {
    name: asString(data.name),
    description: asString(data.description),
    category: asString(data.category),
    externalUrl: asString(data.externalUrl ?? data.website ?? data.url),
    features: asStringArray(data.features),
    useCases: asStringArray(data.useCases ?? data.use_cases),
    painPoints: asStringArray(data.painPoints ?? data.pains),
    targetAudience: asStringArray(data.targetAudience ?? data.audience),
    resources: toResources(data.resources),
    shortDescription: asString(data.shortDescription ?? data.summary),
    benefits: asStringArray(data.benefits),
    tags: asStringArray(data.tags),
    marketData,
    competitors,
    technicalSpecs,
    pricing,
    caseStudies,
    metrics,
    uniqueValuePropositions: asStringArray(data.uniqueValuePropositions ?? data.uvps),
    positioningStatement: asString(data.positioningStatement),
    keyDifferentiators: asStringArray(data.keyDifferentiators ?? data.differentiators),
    metadata,
  } as Partial<EnhancedSolution>;
}

export async function parseSolutionFromFile(file: File, existing?: EnhancedSolution): Promise<Partial<EnhancedSolution>> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const MAX_FILE_SIZE_MB = 15;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_TEXT_EXTS = new Set(['pdf', 'docx', 'txt', 'md']);

  if (!ext || !ALLOWED_TEXT_EXTS.has(ext)) {
    throw new Error(`Unsupported file type ".${ext || 'unknown'}". Please upload a PDF, DOCX, TXT or MD file.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
  }

  let extracted = '';
  if (ext === 'pdf') {
    extracted = await extractTextFromPdf(file);
  } else if (ext === 'docx') {
    extracted = await extractTextFromDocx(file);
  } else {
    extracted = await file.text();
  }

  const system: ChatMessage = {
    role: 'system',
    content: [
      'You extract structured product/solution info.',
      'Output ONLY compact JSON matching the EnhancedSolution partial shape. No prose, no explanations.',
      'Include these optional fields when confidently available:',
      'name, description, category, externalUrl, features (string[]), useCases (string[]), painPoints (string[]), targetAudience (string[]),',
      'resources ({title,url,category?,order?}[]), shortDescription, benefits (string[]), tags (string[]),',
      'marketData ({marketSize?, growthRate?, regions?, compliance?}),',
      'competitors ([{name, strengths?, weaknesses?, marketShare?}] ),',
      'technicalSpecs ({systemRequirements?, supportedPlatforms?, apiCapabilities?, security?}),',
      'pricing ({model?, tiers?: [{name, price?, features?}], freeTrial?, basePrice?, billingCycle?}),',
      'caseStudies ([{id?, title, customer?, challenge?, solution?, results?, metrics?}]),',
      'metrics (object as found), uniqueValuePropositions (string[]), positioningStatement, keyDifferentiators (string[]),',
      'metadata ({title?, description?, keywords?, canonicalUrl?}).',
      'If unknown, omit the field. Prefer exact quotes from the file for facts.',
    ].join(' ')
  };

  const user: ChatMessage = {
    role: 'user',
    content: [
      'Extract what you can into a single JSON object as described.',
      'Existing solution (for context, prefer file when conflicting):',
      JSON.stringify(existing || {}, null, 2),
      '',
      'Extracted text:',
      extracted.slice(0, 12000)
    ].join('\n')
  };

  const resp = await sendChatRequest('openrouter', { messages: [system, user], temperature: 0.2, maxTokens: 1500 });
  const content = resp?.choices?.[0]?.message?.content || '';
  const json = safeJsonFromText(content) || {};
  return normalizePartialEnhancedSolution(json);
}
