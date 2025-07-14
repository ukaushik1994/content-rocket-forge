
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';

export interface OptimizationSuggestion {
  id: string;
  type: 'seo' | 'readability' | 'engagement' | 'structure' | 'performance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  autoFixable: boolean;
  impact: number; // 1-10 scale
  confidence: number; // 0-1 scale
  suggestion: string;
  position?: { start: number; end: number };
  currentValue?: string;
  suggestedValue?: string;
}

export interface RealTimeAnalysisResult {
  overallScore: number;
  suggestions: OptimizationSuggestion[];
  readabilityScore: number;
  seoScore: number;
  engagementScore: number;
  performanceScore: number;
  timestamp: number;
}

export class RealTimeOptimizationEngine {
  private analysisCache = new Map<string, RealTimeAnalysisResult>();
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastAnalysis: number = 0;
  
  async analyzeContent(
    content: string,
    title: string,
    keywords: string[],
    targetAudience: string = 'general',
    provider: AiProvider = 'openai'
  ): Promise<RealTimeAnalysisResult> {
    const cacheKey = this.generateCacheKey(content, title, keywords);
    
    // Return cached result if available and recent
    if (this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 30000) { // 30 seconds cache
        return cached;
      }
    }
    
    const prompt = `Analyze this content for real-time optimization opportunities:

Title: ${title}
Content: ${content.substring(0, 2000)}...
Keywords: ${keywords.join(', ')}
Target Audience: ${targetAudience}

Provide a comprehensive analysis with specific, actionable suggestions. Focus on:
1. SEO optimization (keyword usage, meta elements, structure)
2. Readability improvements (sentence length, paragraph structure, transitions)
3. Engagement enhancement (hooks, calls-to-action, emotional appeal)
4. Content structure (headings, flow, logical organization)
5. Performance factors (content length, keyword density, semantic relevance)

Return analysis in JSON format with:
- overallScore (0-100)
- readabilityScore (0-100)
- seoScore (0-100)  
- engagementScore (0-100)
- performanceScore (0-100)
- suggestions array with: id, type, priority, title, description, autoFixable, impact (1-10), confidence (0-1), suggestion, position (if applicable), currentValue, suggestedValue`;

    try {
      const response = await sendChatRequest(provider, {
        messages: [
          { role: 'system', content: 'You are an expert content optimization analyst. Provide detailed, actionable suggestions in valid JSON format.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const result = this.parseAnalysisResponse(response.choices[0].message.content);
        result.timestamp = Date.now();
        
        // Cache the result
        this.analysisCache.set(cacheKey, result);
        this.lastAnalysis = Date.now();
        
        return result;
      }
    } catch (error) {
      console.error('Real-time optimization analysis failed:', error);
    }

    // Return fallback result
    return this.getFallbackResult();
  }

  async getInstantSuggestions(
    content: string,
    cursorPosition: number,
    context: string
  ): Promise<OptimizationSuggestion[]> {
    // Get contextual suggestions based on cursor position
    const surroundingText = this.extractSurroundingText(content, cursorPosition);
    
    const prompt = `Provide instant optimization suggestions for this text context:

Current text: "${surroundingText}"
Cursor position context: "${context}"

Give 3-5 quick, actionable suggestions that can be applied immediately. Focus on:
- Sentence improvement
- Word choice optimization  
- Structure enhancement
- SEO opportunities
- Readability fixes

Return as JSON array of suggestions with id, type, priority, title, description, autoFixable, impact, confidence, suggestion fields.`;

    try {
      const response = await sendChatRequest('openai', {
        messages: [
          { role: 'system', content: 'You are a real-time writing assistant. Provide immediate, contextual suggestions in JSON format.' },
          { role: 'user', content: prompt }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        const suggestions = JSON.parse(response.choices[0].message.content);
        return Array.isArray(suggestions) ? suggestions : [];
      }
    } catch (error) {
      console.error('Instant suggestions failed:', error);
    }

    return [];
  }

  private generateCacheKey(content: string, title: string, keywords: string[]): string {
    const contentHash = content.slice(0, 100) + content.slice(-100);
    return `${title}-${keywords.join('')}-${contentHash}`.toLowerCase();
  }

  private parseAnalysisResponse(response: string): RealTimeAnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure suggestions have proper IDs
        if (parsed.suggestions) {
          parsed.suggestions = parsed.suggestions.map((s: any, index: number) => ({
            ...s,
            id: s.id || `suggestion-${index}`,
            autoFixable: s.autoFixable || false,
            impact: s.impact || 5,
            confidence: s.confidence || 0.8
          }));
        }
        
        return {
          overallScore: parsed.overallScore || 70,
          readabilityScore: parsed.readabilityScore || 70,
          seoScore: parsed.seoScore || 70,
          engagementScore: parsed.engagementScore || 70,
          performanceScore: parsed.performanceScore || 70,
          suggestions: parsed.suggestions || [],
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
    }
    
    return this.getFallbackResult();
  }

  private extractSurroundingText(content: string, position: number): string {
    const start = Math.max(0, position - 100);
    const end = Math.min(content.length, position + 100);
    return content.substring(start, end);
  }

  private getFallbackResult(): RealTimeAnalysisResult {
    return {
      overallScore: 75,
      readabilityScore: 75,
      seoScore: 75,
      engagementScore: 75,
      performanceScore: 75,
      suggestions: [
        {
          id: 'fallback-1',
          type: 'readability',
          priority: 'medium',
          title: 'Improve Readability',
          description: 'Consider breaking long paragraphs into shorter ones',
          autoFixable: false,
          impact: 6,
          confidence: 0.8,
          suggestion: 'Break up long paragraphs for better readability'
        }
      ],
      timestamp: Date.now()
    };
  }

  clearCache(): void {
    this.analysisCache.clear();
  }

  debounceAnalysis(callback: () => void, delay: number = 1000): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(callback, delay);
  }
}

export const realTimeOptimizer = new RealTimeOptimizationEngine();
