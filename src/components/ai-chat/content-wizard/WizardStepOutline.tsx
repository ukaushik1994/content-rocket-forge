import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { v4 as uuidv4 } from 'uuid';

interface WizardStepOutlineProps {
  keyword: string;
  solution: EnhancedSolution | null;
  researchSelections: {
    faqs: string[];
    contentGaps: string[];
    relatedKeywords: string[];
    serpHeadings: string[];
  };
  outline: OutlineSection[];
  onOutlineChange: (outline: OutlineSection[]) => void;
}

export const WizardStepOutline: React.FC<WizardStepOutlineProps> = ({
  keyword,
  solution,
  researchSelections,
  outline,
  onOutlineChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (outline.length === 0) generateOutline();
  }, []);

  const generateOutline = async () => {
    setIsGenerating(true);
    try {
      const { data: provider } = await supabase.from('ai_service_providers')
        .select('api_key, provider, preferred_model')
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .limit(1).single();

      if (!provider) {
        // Fallback outline
        onOutlineChange([
          { id: uuidv4(), title: `Introduction to ${keyword}`, level: 1 },
          { id: uuidv4(), title: `What is ${keyword}?`, level: 2 },
          { id: uuidv4(), title: `Key Benefits`, level: 2 },
          { id: uuidv4(), title: `How to Get Started`, level: 2 },
          { id: uuidv4(), title: `Best Practices`, level: 2 },
          { id: uuidv4(), title: `Conclusion`, level: 1 },
        ]);
        return;
      }

      // Build rich context from solution and research
      const contextParts: string[] = [];
      if (solution) {
        contextParts.push(`Offering/Solution: "${solution.name}" — ${solution.description || ''}`);
        if (solution.features?.length) contextParts.push(`Key Features: ${solution.features.join('; ')}`);
        if (solution.painPoints?.length) contextParts.push(`Pain Points it solves: ${solution.painPoints.join('; ')}`);
        if (solution.useCases?.length) contextParts.push(`Use Cases: ${solution.useCases.join('; ')}`);
        if (solution.targetAudience?.length) contextParts.push(`Target Audience: ${solution.targetAudience.join(', ')}`);
        if ((solution as any).benefits?.length) contextParts.push(`Benefits: ${(solution as any).benefits.join('; ')}`);
        if ((solution as any).positioningStatement) contextParts.push(`Positioning: ${(solution as any).positioningStatement}`);
        if ((solution as any).competitors?.length) {
          const compNames = (solution as any).competitors.map((c: any) => c.name || c).join(', ');
          contextParts.push(`Competitors to differentiate from: ${compNames}`);
        }
      }
      if (researchSelections.faqs.length) contextParts.push(`FAQs readers ask: ${researchSelections.faqs.join('; ')}`);
      if (researchSelections.contentGaps.length) contextParts.push(`Content gaps to fill: ${researchSelections.contentGaps.join('; ')}`);
      if (researchSelections.relatedKeywords.length) contextParts.push(`Related keywords to cover: ${researchSelections.relatedKeywords.join(', ')}`);
      if (researchSelections.serpHeadings.length) contextParts.push(`Top-ranking headings for inspiration: ${researchSelections.serpHeadings.join('; ')}`);

      const systemPrompt = `You are an expert Content Strategist and SEO architect. Your job is to create comprehensive, strategically structured content outlines that:
- Follow a logical reader journey (awareness → understanding → evaluation → action)
- Use clear H2/H3 hierarchy for SEO and readability
- Address search intent and competitive content gaps
- Naturally weave in the offering/solution context when provided
- Include 8-12 sections with subsections where appropriate

Return ONLY a valid JSON array of objects with "title" (string) and "level" (1 for H2 main sections, 2 for H3 subsections). No markdown, no explanation — just the JSON array.`;

      const userPrompt = `Create a comprehensive content outline for the topic: "${keyword}"

${contextParts.length > 0 ? '### Context:\n' + contextParts.join('\n') : ''}

Requirements:
- 8-12 strategically ordered sections (level 1 = H2, level 2 = H3 subsection)
- Start with a compelling introduction, end with actionable conclusion
- If a solution/offering is provided, integrate it naturally (not as a sales pitch)
- Turn FAQs into dedicated sections or subsections
- Address content gaps as unique sections competitors miss
- Include practical, actionable sections (how-to, best practices, examples)

Return ONLY the JSON array.`;

      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: provider.provider,
          endpoint: 'chat',
          params: {
            model: provider.preferred_model || 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }
        }
      });

      if (aiError) throw new Error(aiError.message);

      // Fix: ai-proxy returns nested { data: { choices: [...] } }
      const content = aiResult?.data?.choices?.[0]?.message?.content
        || aiResult?.choices?.[0]?.message?.content
        || aiResult?.content
        || '';

      // Filter out irrelevant strategy signals that aren't article sections
      const IRRELEVANT_PATTERNS = [
        /video\s+content\s+opportunit/i,
        /local\s+services?\b/i,
        /visual\s+content\s+strateg/i,
        /podcast\s+opportunit/i,
        /infographic\s+creation/i,
        /social\s+media\s+strateg/i,
      ];
      const filterIrrelevant = (items: any[]) =>
        items.filter(s => !IRRELEVANT_PATTERNS.some(p => p.test(s.title || s.heading || '')));

      // Try JSON array parsing first
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = filterIrrelevant(JSON.parse(jsonMatch[0]));
        onOutlineChange(parsed.map((s: any) => ({ id: uuidv4(), title: s.title || s.heading || '', level: s.level || 1 })));
      } else {
        // Fallback: parse markdown headings (## and ###)
        const lines = content.split('\n').filter((l: string) => l.trim().startsWith('#'));
        if (lines.length >= 3) {
          const parsed = filterIrrelevant(lines.map((line: string) => {
            const h3 = line.trim().startsWith('###');
            const title = line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
            return { id: uuidv4(), title, level: h3 ? 2 : 1 };
          }));
          onOutlineChange(parsed);
        } else {
          // Final static fallback
          onOutlineChange([
            { id: uuidv4(), title: `Introduction to ${keyword}`, level: 1 },
            { id: uuidv4(), title: `What is ${keyword}?`, level: 2 },
            { id: uuidv4(), title: `Key Benefits and Use Cases`, level: 1 },
            { id: uuidv4(), title: `How to Get Started`, level: 1 },
            { id: uuidv4(), title: `Best Practices`, level: 2 },
            { id: uuidv4(), title: `Conclusion`, level: 1 },
          ]);
        }
      }
    } catch {
      onOutlineChange([
        { id: uuidv4(), title: `Introduction to ${keyword}`, level: 1 },
        { id: uuidv4(), title: `Key Benefits`, level: 2 },
        { id: uuidv4(), title: `How to Implement`, level: 2 },
        { id: uuidv4(), title: `Conclusion`, level: 1 },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const addSection = () => {
    const newSection: OutlineSection = { id: uuidv4(), title: 'New Section', level: 1 };
    onOutlineChange([...outline, newSection]);
    setEditingId(newSection.id);
  };

  const removeSection = (id: string) => {
    onOutlineChange(outline.filter(s => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    onOutlineChange(outline.map(s => s.id === id ? { ...s, title } : s));
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Generating outline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Content Outline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to reorder, click to edit</p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={generateOutline} className="text-xs h-7 gap-1">
            <Sparkles className="w-3 h-3" /> Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={addSection} className="text-xs h-7 gap-1">
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>
      </div>

      <Reorder.Group axis="y" values={outline} onReorder={onOutlineChange} className="space-y-1.5">
        {outline.map((section) => (
          <Reorder.Item key={section.id} value={section}>
            <motion.div
              layout
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/20 hover:border-border/40 group transition-colors"
            >
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab flex-shrink-0" />
              <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-primary">H{section.level + 1}</span>
              </div>
              {editingId === section.id ? (
                <Input
                  autoFocus
                  value={section.title}
                  onChange={(e) => updateTitle(section.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  className="h-7 text-xs flex-1 bg-transparent border-none focus-visible:ring-1"
                />
              ) : (
                <span
                  className="text-xs text-foreground/80 flex-1 cursor-pointer truncate"
                  style={{ paddingLeft: section.level > 1 ? `${(section.level - 1) * 12}px` : 0 }}
                  onClick={() => setEditingId(section.id)}
                >
                  {section.title}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSection(section.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};
