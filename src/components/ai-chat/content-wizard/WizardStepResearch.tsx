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
}

interface ResearchData {
  faqs: { text: string; source: 'serp' | 'ai' }[];
  contentGaps: { text: string; source: 'serp' | 'ai' }[];
  relatedKeywords: { text: string; source: 'serp' | 'ai' }[];
  serpHeadings: { text: string; source: 'serp' | 'ai' }[];
}

export const WizardStepResearch: React.FC<WizardStepResearchProps> = ({
  keyword,
  selections,
  onSelectionsChange,
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
        setData({
          faqs: (serpResult.peopleAlsoAsk || []).map(q => ({ text: typeof q === 'string' ? q : (q as any).question || String(q), source: 'serp' as const })),
          contentGaps: (serpResult.contentGaps || []).map(g => ({ text: typeof g === 'string' ? g : String(g), source: 'serp' as const })),
          relatedKeywords: (serpResult.relatedSearches || serpResult.keywords || []).map(k => ({ text: typeof k === 'string' ? k : (k as any).keyword || String(k), source: 'serp' as const })),
          serpHeadings: (serpResult.headings || []).map(h => ({ text: typeof h === 'string' ? h : String(h), source: 'serp' as const })),
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
          faqs: [{ text: `What is ${keyword}?`, source: 'ai' }, { text: `How does ${keyword} work?`, source: 'ai' }, { text: `Benefits of ${keyword}`, source: 'ai' }],
          contentGaps: [{ text: `Beginner's guide to ${keyword}`, source: 'ai' }, { text: `${keyword} best practices`, source: 'ai' }],
          relatedKeywords: [{ text: `${keyword} tools`, source: 'ai' }, { text: `${keyword} strategy`, source: 'ai' }, { text: `${keyword} examples`, source: 'ai' }],
          serpHeadings: [{ text: `Introduction to ${keyword}`, source: 'ai' }, { text: `Key Benefits`, source: 'ai' }, { text: `How to Get Started`, source: 'ai' }],
        });
        return;
      }

      const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
        body: {
          params: {
            provider: provider.provider,
            model: provider.preferred_model || 'gpt-4',
            messages: [{
              role: 'user',
              content: `For the topic "${keyword}", generate research data in JSON format with these arrays: faqs (5 questions people ask), contentGaps (4 underserved topics), relatedKeywords (6 related search terms), serpHeadings (5 common article headings). Return ONLY valid JSON.`
            }],
            maxTokens: 1000,
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
                  <Badge variant={item.source === 'serp' ? 'default' : 'secondary'} className="text-[9px] h-4 px-1 flex-shrink-0">
                    {item.source === 'serp' ? 'SERP' : 'AI'}
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
