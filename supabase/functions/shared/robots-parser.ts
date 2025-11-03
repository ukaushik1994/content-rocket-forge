/**
 * Simple robots.txt parser (best-effort)
 */

export interface RobotsRules {
  allowed: boolean;
  disallowedPaths: string[];
  crawlDelay?: number;
}

export async function fetchRobotsTxt(domain: string): Promise<string | null> {
  try {
    const robotsUrl = `https://${domain}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorIntelBot/1.0)'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.log(`Could not fetch robots.txt for ${domain}`);
    return null;
  }
}

export function parseRobotsTxt(robotsTxt: string, userAgent: string = '*'): RobotsRules {
  const lines = robotsTxt.split('\n');
  const disallowedPaths: string[] = [];
  let currentUserAgent = '';
  let relevantSection = false;
  let crawlDelay: number | undefined;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Check for User-agent
    if (trimmed.toLowerCase().startsWith('user-agent:')) {
      currentUserAgent = trimmed.substring(11).trim().toLowerCase();
      relevantSection = currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase();
      continue;
    }
    
    if (!relevantSection) {
      continue;
    }
    
    // Check for Disallow
    if (trimmed.toLowerCase().startsWith('disallow:')) {
      const path = trimmed.substring(9).trim();
      if (path) {
        disallowedPaths.push(path);
      }
    }
    
    // Check for Crawl-delay
    if (trimmed.toLowerCase().startsWith('crawl-delay:')) {
      const delay = parseInt(trimmed.substring(12).trim());
      if (!isNaN(delay)) {
        crawlDelay = delay;
      }
    }
  }
  
  return {
    allowed: disallowedPaths.length === 0 || !disallowedPaths.includes('/'),
    disallowedPaths,
    crawlDelay
  };
}

export function isUrlAllowed(url: string, rules: RobotsRules): boolean {
  if (!rules.allowed) {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    
    // Check each disallowed path
    for (const disallowed of rules.disallowedPaths) {
      if (disallowed === '/') {
        return false; // Everything disallowed
      }
      
      // Simple prefix matching
      if (path.startsWith(disallowed)) {
        return false;
      }
      
      // Wildcard matching (basic)
      if (disallowed.includes('*')) {
        const pattern = disallowed.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}`);
        if (regex.test(path)) {
          return false;
        }
      }
    }
    
    return true;
  } catch {
    return true; // If we can't parse, allow by default
  }
}
