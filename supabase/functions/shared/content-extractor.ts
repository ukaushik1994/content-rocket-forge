import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

/**
 * Extract main content from HTML page
 */
export interface PricingTier {
  tier: string;
  price: string;
  features: string[];
}

export interface Testimonial {
  quote: string;
  author?: string;
  company?: string;
  role?: string;
}

export interface KeyMetric {
  label: string;
  value: string;
}

export interface ExtractedContent {
  title: string;
  metaDescription: string;
  headings: Array<{ level: string; text: string; context?: string }>;
  mainText: string;
  url: string;
  pricingTables: PricingTier[];
  testimonials: Testimonial[];
  metrics: KeyMetric[];
  featureLists: string[][];
  callouts: string[];
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
  
  // Extract headings with context (h1, h2, h3)
  const headings: Array<{ level: string; text: string; context?: string }> = [];
  const h1s = doc.querySelectorAll('h1');
  const h2s = doc.querySelectorAll('h2');
  const h3s = doc.querySelectorAll('h3');
  
  h1s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) {
      const nextSibling = h.nextElementSibling;
      const context = nextSibling?.textContent?.trim().slice(0, 150);
      headings.push({ level: 'h1', text, context });
    }
  });
  h2s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) {
      const nextSibling = h.nextElementSibling;
      const context = nextSibling?.textContent?.trim().slice(0, 150);
      headings.push({ level: 'h2', text, context });
    }
  });
  h3s.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 200) headings.push({ level: 'h3', text });
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
  
  // Limit to 5,000 chars (increased from 1,000)
  if (mainText.length > 5000) {
    mainText = mainText.substring(0, 5000) + '...';
  }
  
  // Extract pricing tables
  const pricingTables = extractPricingTables(doc);
  
  // Extract testimonials
  const testimonials = extractTestimonials(doc);
  
  // Extract key metrics
  const metrics = extractKeyMetrics(doc);
  
  // Extract feature lists
  const featureLists = extractFeatureLists(doc);
  
  // Extract callouts/hero sections
  const callouts = extractCallouts(doc);
  
  return {
    title,
    metaDescription,
    headings: headings.slice(0, 20), // Max 20 headings (increased)
    mainText,
    url,
    pricingTables,
    testimonials,
    metrics,
    featureLists,
    callouts
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
 * Extract pricing tables from document
 */
function extractPricingTables(doc: any): PricingTier[] {
  const tables: PricingTier[] = [];
  
  // Look for pricing-related sections
  const pricingIndicators = ['pricing', 'plans', 'tier', 'package', 'subscription'];
  const allElements = doc.querySelectorAll('section, div[class*="pric"], div[class*="plan"], table');
  
  allElements.forEach((el: any) => {
    const text = el.textContent?.toLowerCase() || '';
    const hasPrice = /\$\d+|\d+\/mo|\d+\/month|free|enterprise|contact/.test(text);
    const hasPricingKeyword = pricingIndicators.some(kw => text.includes(kw));
    
    if (hasPrice && hasPricingKeyword) {
      // Extract pricing cards or table rows
      const cards = el.querySelectorAll('[class*="card"], [class*="tier"], [class*="plan"], tr');
      
      cards.forEach((card: any) => {
        const cardText = card.textContent?.trim() || '';
        const priceMatch = cardText.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)|free|enterprise|contact/i);
        
        if (priceMatch && cardText.length > 20 && cardText.length < 1000) {
          const lines = cardText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
          const tier = lines[0] || 'Unknown';
          const price = priceMatch[0];
          const features = lines.slice(2, 8).filter(l => l.length > 5 && l.length < 100);
          
          if (features.length > 0) {
            tables.push({ tier, price, features });
          }
        }
      });
    }
  });
  
  return tables.slice(0, 5); // Max 5 tiers
}

/**
 * Extract testimonials and customer quotes
 */
function extractTestimonials(doc: any): Testimonial[] {
  const testimonials: Testimonial[] = [];
  
  // Look for testimonial/review sections
  const testimonialElements = doc.querySelectorAll(
    '[class*="testimonial"], [class*="review"], [class*="quote"], blockquote'
  );
  
  testimonialElements.forEach((el: any) => {
    const quote = el.textContent?.trim() || '';
    
    if (quote.length > 30 && quote.length < 500) {
      // Try to find author info
      const parent = el.parentElement;
      const siblings = parent ? Array.from(parent.children) : [];
      
      let author, company, role;
      
      siblings.forEach((sibling: any) => {
        const text = sibling.textContent?.trim() || '';
        if (text.length > 3 && text.length < 100 && text !== quote) {
          if (!author) author = text;
          else if (!company && (text.includes(',') || text.includes('•'))) {
            const parts = text.split(/,|•/);
            role = parts[0]?.trim();
            company = parts[1]?.trim();
          }
        }
      });
      
      testimonials.push({ quote, author, company, role });
    }
  });
  
  return testimonials.slice(0, 10); // Max 10 testimonials
}

/**
 * Extract key metrics and statistics
 */
function extractKeyMetrics(doc: any): KeyMetric[] {
  const metrics: KeyMetric[] = [];
  
  // Look for stat/metric sections
  const statElements = doc.querySelectorAll(
    '[class*="stat"], [class*="metric"], [class*="number"], [class*="count"]'
  );
  
  statElements.forEach((el: any) => {
    const text = el.textContent?.trim() || '';
    
    // Match patterns like "50K+ users", "99.9% uptime", "$2M saved"
    const metricMatch = text.match(/(\d+[\d,]*\.?\d*[KMB%+]*)\s*(.{3,50})/i);
    
    if (metricMatch && text.length < 200) {
      const value = metricMatch[1];
      const label = metricMatch[2].trim();
      
      if (label.length > 3) {
        metrics.push({ label, value });
      }
    }
  });
  
  return metrics.slice(0, 15); // Max 15 metrics
}

/**
 * Extract feature lists
 */
function extractFeatureLists(doc: any): string[][] {
  const lists: string[][] = [];
  
  const ulElements = doc.querySelectorAll('ul');
  
  ulElements.forEach((ul: any) => {
    const items: string[] = [];
    const lis = ul.querySelectorAll('li');
    
    lis.forEach((li: any) => {
      const text = li.textContent?.trim() || '';
      if (text.length > 5 && text.length < 150) {
        items.push(text);
      }
    });
    
    if (items.length >= 3 && items.length <= 20) {
      lists.push(items);
    }
  });
  
  return lists.slice(0, 10); // Max 10 feature lists
}

/**
 * Extract callouts and hero sections
 */
function extractCallouts(doc: any): string[] {
  const callouts: string[] = [];
  
  // Look for hero sections, CTAs, and prominent text
  const calloutElements = doc.querySelectorAll(
    '[class*="hero"], [class*="banner"], [class*="cta"], [class*="highlight"]'
  );
  
  calloutElements.forEach((el: any) => {
    const text = el.textContent?.trim() || '';
    
    if (text.length > 20 && text.length < 300) {
      callouts.push(text);
    }
  });
  
  return callouts.slice(0, 5); // Max 5 callouts
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
