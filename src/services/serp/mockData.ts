
import { SerpAnalysisResult } from './types';

/**
 * Generate mock SERP data for development and fallback scenarios
 */
export function generateMockData(keyword: string, countries: string[] = ['us']): SerpAnalysisResult {
  return {
    keyword: keyword,
    searchVolume: 1200,
    competitionScore: 0.65,
    keywordDifficulty: 45,
    topResults: [
      {
        title: "How to Create Financial Reports - A Complete Guide",
        link: "https://example.com/finance-reports-guide",
        snippet: "Learn how to create comprehensive financial reports with our step-by-step guide. Includes templates and best practices.",
        position: 1
      },
      {
        title: "Financial Reporting 101: Templates & Examples",
        link: "https://example.com/financial-reporting",
        snippet: "Download our free financial report templates and see examples of professional financial reports for businesses of all sizes.",
        position: 2
      },
      {
        title: "Annual Financial Reports: Everything You Need to Know",
        link: "https://example.com/annual-reports",
        snippet: "Comprehensive guide to creating annual financial reports. Learn about requirements, deadlines, and common mistakes to avoid.",
        position: 3
      }
    ],
    relatedSearches: [
      { query: `${keyword} templates`, volume: 880 },
      { query: `how to read ${keyword}`, volume: 720 },
      { query: `annual ${keyword} examples`, volume: 590 },
      { query: `quarterly ${keyword} format`, volume: 450 }
    ],
    peopleAlsoAsk: [
      { question: `What should be included in a ${keyword}?`, source: "https://example.com/components" },
      { question: `How often should ${keyword}s be created?`, source: "https://example.com/frequency" },
      { question: `What is the difference between a ${keyword} and a statement?`, source: "https://example.com/differences" }
    ],
    entities: [
      { name: "Income Statement", type: "document", importance: 9, description: "A financial statement showing revenues and expenses" },
      { name: "Balance Sheet", type: "document", importance: 8, description: "A financial statement showing assets, liabilities and equity" },
      { name: "Cash Flow Statement", type: "document", importance: 7, description: "A financial statement showing cash inflows and outflows" }
    ],
    headings: [
      { text: `Components of ${keyword}s`, level: "h2" },
      { text: "Creating an Effective Income Statement", level: "h2" },
      { text: "Balance Sheet Best Practices", level: "h2" },
      { text: "Cash Flow Analysis Techniques", level: "h3" },
      { text: "Financial Ratio Analysis", level: "h2" }
    ],
    contentGaps: [
      { topic: `${keyword} Automation Tools`, description: "Tools and software for automating reporting processes" },
      { topic: `Regulatory Compliance in ${keyword}`, description: "How to ensure your reports meet industry regulations" }
    ],
    keywords: [
      keyword, 
      `annual ${keyword}`, 
      `quarterly ${keyword}`, 
      `${keyword} templates`, 
      `${keyword} examples`, 
      `${keyword} format`, 
      `${keyword} analysis`, 
      `${keyword} software`
    ],
    searchCountries: countries,
    isMockData: true
  };
}

/**
 * Generate mock related keywords based on a main keyword
 */
export function generateMockRelatedKeywords(keyword: string): string[] {
  return [
    `${keyword} templates`,
    `${keyword} examples`, 
    `how to create ${keyword}`,
    `${keyword} best practices`,
    `${keyword} software`,
    `${keyword} analysis tools`,
    `${keyword} regulations`,
    `${keyword} formats`
  ];
}
