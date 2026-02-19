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

      const contextParts: string[] = [];
      if (solution) contextParts.push(`Solution: ${solution.name}. Features: ${solution.features.slice(0, 5).join(', ')}`);
      if (researchSelections.faqs.length) contextParts.push(`FAQs to address: ${researchSelections.faqs.join('; ')}`);
      if (researchSelections.contentGaps.length) contextParts.push(`Content gaps: ${researchSelections.contentGaps.join('; ')}`);
      if (researchSelections.relatedKeywords.length) contextParts.push(`Related keywords: ${researchSelections.relatedKeywords.join(', ')}`);
      if (researchSelections.serpHeadings.length) contextParts.push(`SERP headings for inspiration: ${researchSelections.serpHeadings.join('; ')}`);

      const { data: aiResult } = await supabase.functions.invoke('ai-proxy', {
        body: {
          params: {
            provider: provider.provider,
            model: provider.preferred_model || 'gpt-4',
            messages: [{
              role: 'user',
              content: `Create a detailed blog outline for "${keyword}". ${contextParts.join('. ')}. Return a JSON array of objects with "title" (string) and "level" (1 for H2, 2 for H3). Include 6-10 sections. Return ONLY valid JSON array.`
            }],
            maxTokens: 800,
          }
        }
      });

      const content = aiResult?.content || aiResult?.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        onOutlineChange(parsed.map((s: any) => ({ id: uuidv4(), title: s.title, level: s.level || 1 })));
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
