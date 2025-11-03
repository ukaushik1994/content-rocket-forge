import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

/**
 * Extract main content from HTML page
 */
export interface ExtractedContent {
  title: string;
  metaDescription: string;
  headings: string[];
  mainText: string;
  url: string;
}

export async function extractPageContent(
  url: string,
  timeout: number = 10000
): Promise<ExtractedContent | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorIntelBot/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Check content type
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.log(`Skipping non-HTML content: ${url}`);
      return null;
    }
    
    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1500000) {
      console.log(`Skipping large content (${contentLength} bytes): ${url}`);
      return null;
    }
    
    const html = await response.text();
    
    // Limit HTML size
    if (html.length > 1500000) {
      console.log(`Skipping large HTML (${html.length} chars): ${url}`);
      return null;
    }
    
    return parseHtmlContent(html, url);
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`Timeout fetching: ${url}`);
    } else {
      console.error(`Error fetching ${url}:`, error.message);
    }
    return null;
  }
}

/**
 * Parse HTML and extract structured content
 */
export function parseHtmlContent(html: string, url: string): ExtractedContent {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  if (!doc) {
    return {
      title: '',
      metaDescription: '',
      headings: [],
      mainText: '',
      url
    };
  }
  
  // Extract title
  const titleEl = doc.querySelector('title');
  const title = titleEl?.textContent?.trim() || '';
  
  // Extract meta description
  const metaDesc = doc.querySelector('meta[name="description"]');
  const metaDescription = metaDesc?.getAttribute('content')?.trim() || '';
  
  // Extract headings (h1, h2, h3)
  const headings: string[] = [];
  const h1s = doc.querySelectorAll('h1');
  const h2s = doc.querySelectorAll('h2');
  const h3s = doc.querySelectorAll('h3');
  
  h1s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) headings.push(text);
  });
  h2s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) headings.push(text);
  });
  h3s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) headings.push(text);
  });
  
  // Extract main content
  let mainText = '';
  
  // Try semantic elements first
  const main = doc.querySelector('main');
  const article = doc.querySelector('article');
  const contentEl = main || article;
  
  if (contentEl) {
    mainText = extractTextFromElement(contentEl);
  } else {
    // Fallback: extract all paragraph text
    const paragraphs = doc.querySelectorAll('p');
    const texts: string[] = [];
    paragraphs.forEach(p => {
      const text = p.textContent?.trim();
      if (text && text.length > 20) {
        texts.push(text);
      }
    });
    mainText = texts.join('\n\n');
  }
  
  // Limit to 12,000 chars
  if (mainText.length > 12000) {
    mainText = mainText.substring(0, 12000) + '...';
  }
  
  return {
    title,
    metaDescription,
    headings: headings.slice(0, 15), // Max 15 headings
    mainText,
    url
  };
}

/**
 * Extract clean text from DOM element
 */
function extractTextFromElement(element: any): string {
  // Remove script, style, nav, footer elements
  const scripts = element.querySelectorAll('script, style, nav, footer, header');
  scripts.forEach((el: any) => el.remove());
  
  const text = element.textContent || '';
  
  // Clean up whitespace
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

/**
 * Chunk long text into smaller pieces
 */
export function chunkText(text: string, maxChars: number = 12000): string[] {
  if (text.length <= maxChars) {
    return [text];
  }
  
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + maxChars;
    
    // Try to break at sentence or paragraph boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + maxChars * 0.7) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.substring(start, end).trim());
    start = end;
  }
  
  return chunks;
}
