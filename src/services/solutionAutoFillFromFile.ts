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
  const ensureArray = (v: any) => Array.isArray(v) ? v : (v ? [String(v)] : []);
  return {
    name: typeof data.name === 'string' ? data.name : undefined,
    description: typeof data.description === 'string' ? data.description : undefined,
    category: typeof data.category === 'string' ? data.category : undefined,
    externalUrl: typeof data.externalUrl === 'string' ? data.externalUrl : undefined,
    features: ensureArray(data.features),
    useCases: ensureArray(data.useCases),
    painPoints: ensureArray(data.painPoints),
    targetAudience: ensureArray(data.targetAudience),
    resources: Array.isArray(data.resources) ? data.resources.filter((r: any) => r && r.title && r.url).map((r: any) => ({
      id: crypto.randomUUID(),
      title: String(r.title),
      url: String(r.url),
      category: (r.category as any) || 'other',
      order: 0,
    })) : undefined,
    shortDescription: typeof data.shortDescription === 'string' ? data.shortDescription : undefined,
    benefits: ensureArray(data.benefits),
    tags: ensureArray(data.tags),
  };
}

export async function parseSolutionFromFile(file: File, existing?: EnhancedSolution): Promise<Partial<EnhancedSolution>> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let extracted = '';
  if (ext === 'pdf') extracted = await extractTextFromPdf(file);
  else if (ext === 'docx' || ext === 'doc') extracted = await extractTextFromDocx(file);
  else extracted = await file.text();

  const system: ChatMessage = {
    role: 'system',
    content: 'You extract structured product/solution info. Output ONLY compact JSON matching the provided TypeScript shape. No prose.'
  };

  const user: ChatMessage = {
    role: 'user',
    content: `Return a JSON object with optional fields: name, description, category, externalUrl, features (string[]), useCases (string[]), painPoints (string[]), targetAudience (string[]), resources ({title,url}[]), shortDescription, benefits (string[]), tags (string[]).\n\nExisting solution (for context, prefer file when conflicting):\n${JSON.stringify(existing || {}, null, 2)}\n\nExtracted text:\n${extracted.slice(0, 12000)}`
  };

  const resp = await sendChatRequest('openrouter', { messages: [system, user], temperature: 0.2, maxTokens: 800 });
  const content = resp?.choices?.[0]?.message?.content || '';
  const json = safeJsonFromText(content) || {};
  return normalizePartialEnhancedSolution(json);
}
