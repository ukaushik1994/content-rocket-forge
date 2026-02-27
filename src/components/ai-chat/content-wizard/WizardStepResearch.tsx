import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, ChevronDown, Search, Sparkles } from 'lucide-react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ResearchSelections {
  faqs: string[];
  contentGaps: string[];
  relatedKeywords: string[];
  serpHeadings: string[];
}

interface WizardStepResearchProps {
  keyword: string;
  selections: ResearchSelections;
  onSelectionsChange: (selections: ResearchSelections) => void;
  onSerpDataChange?: (serpData: any) => void;
}

interface ResearchData {
  faqs: { text: string; source: 'serp' | 'ai' }[];
  contentGaps: { text: string; source: 'serp' | 'ai' }[];
  relatedKeywords: { text: string; source: 'serp' | 'ai' }[];
  serpHeadings: { text: string; source: 'serp' | 'ai' }[];
}

// Heuristic to detect templated/generic headings that shouldn't be labeled "From SERP"
const TEMPLATED_PATTERNS = [
  /tips\s+and\s+tricks$/i,
  /^(top|best)\s+\d+/i,
  /complete\s+guide$/i,
  /everything\s+you\s+need/i,
  /^what\s+is\s+/i,
  /^how\s+to\s+/i,
  /ultimate\s+guide$/i,
  /^a\s+guide\s+to/i,
  /for\s+beginners$/i,
  /definition\s+and\s+overview$/i,
  /^key\s+(benefits|features|advantages)/i,
  /^(the\s+)?(importance|role)\s+of/i,
  /step.by.step/i,
  /pros?\s+and\s+cons?/i,
];

function isTemplatedHeading(text: string, keyword: string): boolean {
  const withoutKeyword = text.replace(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '').trim();
  return TEMPLATED_PATTERNS.some(p => p.test(withoutKeyword)) || withoutKeyword.length < 5;
}

function sanitizeSource(text: string, keyword: string, originalSource: 'serp' | 'ai'): 'serp' | 'ai' {
  if (originalSource === 'serp' && isTemplatedHeading(text, keyword)) return 'ai';
  return originalSource;
}

export const WizardStepResearch: React.FC<WizardStepResearchProps> = ({
  keyword,
  selections,
  onSelectionsChange,
  onSerpDataChange,
}) => {
  const [data, setData] = useState<ResearchData>({ faqs: [], contentGaps: [], relatedKeywords: [], serpHeadings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ faqs: true, contentGaps: true, relatedKeywords: true, serpHeadings: true });

  useEffect(() => {
    fetchResearchData();
  }, [keyword]);

  const fetchResearchData = async () => {
    setIsLoading(true);
    try {
      // Try SERP API first
      const serpResult = await analyzeKeywordSerp(keyword);
      
      if (serpResult && serpResult.isGoogleData) {
        // Store raw SERP data for comprehensive metadata persistence
        onSerpDataChange?.(serpResult);
        setData({
          faqs: (serpResult.peopleAlsoAsk || []).map(q => { const t = typeof q === 'string' ? q : (q as any).question || String(q); return { text: t, source: sanitizeSource(t, keyword, 'serp') }; }),
          contentGaps: (serpResult.contentGaps || []).map(g => { const t = typeof g === 'string' ? g : (g as any).topic || (g as any).description || (g as any).content || JSON.stringify(g); return { text: t, source: sanitizeSource(t, keyword, 'serp') }; }),
          relatedKeywords: (serpResult.relatedSearches || serpResult.keywords || []).map(k => { const t = typeof k === 'string' ? k : (k as any).query || (k as any).keyword || String(k); return { text: t, source: sanitizeSource(t, keyword, 'serp') }; }),
          serpHeadings: (serpResult.headings || []).map(h => { const t = typeof h === 'string' ? h : (h as any).text || (h as any).title || (h as any).heading || JSON.stringify(h); return { text: t, source: sanitizeSource(t, keyword, 'serp') }; }),
        });
      } else {
        // Fallback: AI-generated research
        await fetchAIResearch();
      }
    } catch {
      await fetchAIResearch();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIResearch = async () => {
    try {
      const { data: provider } = await supabase.from('ai_service_providers')
        .select('api_key, provider, preferred_model')
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .limit(1).single();

      if (!provider) {
        setData({
          faqs: [{ text: `How do practitioners implement ${keyword} effectively?`, source: 'ai' }, { text: `What common mistakes should you avoid with ${keyword}?`, source: 'ai' }, { text: `How does ${keyword} compare to alternatives?`, source: 'ai' }],
          contentGaps: [{ text: `Real-world ${keyword} implementation challenges and solutions`, source: 'ai' }, { text: `${keyword} ROI measurement and benchmarks`, source: 'ai' }],
          relatedKeywords: [{ text: `${keyword} implementation guide`, source: 'ai' }, { text: `${keyword} vs alternatives comparison`, source: 'ai' }, { text: `${keyword} case studies`, source: 'ai' }],
          serpHeadings: [{ text: `Why Most ${keyword} Strategies Fail (And How to Fix Yours)`, source: 'ai' }, { text: `Step-by-Step Implementation`, source: 'ai' }, { text: `Measuring Success: Key Metrics`, source: 'ai' }],
        });
        return;
      }

      const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model || 'gpt-4',
            messages: [{
              role: 'user',
              content: `For the topic "${keyword}", generate research data in JSON format with these arrays:
- faqs: 5 specific questions searchers ask (not generic "What is X?" patterns — use long-tail, intent-driven questions)
- contentGaps: 4 specific topics that existing top-ranking articles MISS or cover poorly (reference what competitors lack, not just keyword variations)
- relatedKeywords: 6 related long-tail search terms with commercial or informational intent
- serpHeadings: 5 specific, compelling headings that would outperform current top results

Make every item specific and actionable, not templated. Return ONLY valid JSON.`
            }],
            max_tokens: 1000,
          }
        }
      });

      const content = aiResult?.content || aiResult?.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setData({
          faqs: (parsed.faqs || []).map((t: string) => ({ text: t, source: 'ai' as const })),
          contentGaps: (parsed.contentGaps || []).map((t: string) => ({ text: t, source: 'ai' as const })),
          relatedKeywords: (parsed.relatedKeywords || []).map((t: string) => ({ text: t, source: 'ai' as const })),
          serpHeadings: (parsed.serpHeadings || []).map((t: string) => ({ text: t, source: 'ai' as const })),
        });
      }
    } catch {
      // Minimal fallback
      setData({
        faqs: [{ text: `What is ${keyword}?`, source: 'ai' }],
        contentGaps: [{ text: `${keyword} guide`, source: 'ai' }],
        relatedKeywords: [{ text: `${keyword} tips`, source: 'ai' }],
        serpHeadings: [{ text: `Understanding ${keyword}`, source: 'ai' }],
      });
    }
  };

  const toggleItem = (category: keyof ResearchSelections, text: string) => {
    const current = selections[category];
    const updated = current.includes(text) ? current.filter(t => t !== text) : [...current, text];
    onSelectionsChange({ ...selections, [category]: updated });
  };

  const toggleAll = (category: keyof ResearchSelections, items: { text: string }[]) => {
    const texts = items.map(i => i.text);
    const allSelected = texts.every(t => selections[category].includes(t));
    onSelectionsChange({ ...selections, [category]: allSelected ? [] : texts });
  };

  const categories: { key: keyof ResearchSelections; label: string; icon: React.ReactNode }[] = [
    { key: 'faqs', label: 'FAQs / People Also Ask', icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'contentGaps', label: 'Content Gaps', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'relatedKeywords', label: 'Related Keywords', icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'serpHeadings', label: 'SERP Headings', icon: <Search className="w-3.5 h-3.5" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Researching "{keyword}"...</p>
      </div>
    );
  }

  const totalSelected = Object.values(selections).flat().length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Research & Select</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pick items to inform your content</p>
        </div>
        <Badge variant="secondary" className="text-xs">{totalSelected} selected</Badge>
      </div>

      {categories.map(({ key, label, icon }) => {
        const items = data[key];
        if (!items.length) return null;
        const allSelected = items.every(i => selections[key].includes(i.text));

        return (
          <Collapsible key={key} open={expandedCategories[key]} onOpenChange={(open) => setExpandedCategories(prev => ({ ...prev, [key]: open }))}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs font-medium text-foreground">{label}</span>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5">{items.length}</Badge>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", expandedCategories[key] && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-1">
              <Button variant="ghost" size="sm" onClick={() => toggleAll(key, items)} className="text-[10px] h-6 px-2 text-muted-foreground">
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
              {items.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2.5 px-3 py-1.5 rounded-md hover:bg-muted/30 cursor-pointer transition-colors">
                  <Checkbox
                    checked={selections[key].includes(item.text)}
                    onCheckedChange={() => toggleItem(key, item.text)}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-foreground/80 leading-relaxed flex-1">{item.text}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] h-4 px-1.5 flex-shrink-0 border",
                      item.source === 'serp' 
                        ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    )}
                  >
                    {item.source === 'serp' ? 'From SERP' : 'AI Suggested'}
                  </Badge>
                </label>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};
