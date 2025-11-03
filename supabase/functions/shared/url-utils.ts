/**
 * Normalize a website URL to extract clean domain
 */
export function normalizeDomain(website: string): string {
  try {
    let url = website.trim();
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (error) {
    console.error('Failed to normalize domain:', error);
    return website.trim().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * Get base URL from domain
 */
export function getBaseUrl(domain: string): string {
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }
  return `https://${domain}`;
}

/**
 * Categorize URL based on path patterns
 */
export function categorizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const domain = parsed.hostname;
    
    // Homepage
    if (path === '/' || path === '') {
      return 'homepage';
    }
    
    // Product/Service pages
    if (/\/(product|products|solutions?|services?|pricing|plans?)/.test(path)) {
      return 'product/service';
    }
    
    // Resources/Blog
    if (/\/(blog|resources?|case-stud(y|ies)|whitepaper|news|articles?)/.test(path)) {
      return 'resources/blog';
    }
    
    // About/Contact
    if (/\/(about|company|careers?|contact|team|leadership)/.test(path)) {
      return 'about/contact';
    }
    
    return 'other';
  } catch (error) {
    return 'other';
  }
}

/**
 * Get priority for URL category (lower = higher priority)
 */
export function getCategoryPriority(category: string): number {
  const priorities: Record<string, number> = {
    'homepage': 1,
    'product/service': 2,
    'resources/blog': 3,
    'about/contact': 4,
    'other': 5
  };
  return priorities[category] || 5;
}

/**
 * Convert category to resource category type
 */
export function toResourceCategory(category: string): string {
  const mapping: Record<string, string> = {
    'homepage': 'website',
    'product/service': 'website',
    'resources/blog': 'documentation',
    'about/contact': 'website',
    'other': 'other'
  };
  return mapping[category] || 'other';
}

/**
 * Validate if URL is accessible
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Generate cache key from domain
 */
export async function generateCacheKey(domain: string): Promise<string> {
  const normalized = normalizeDomain(domain);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
