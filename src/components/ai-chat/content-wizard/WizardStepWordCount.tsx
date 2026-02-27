import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, PenLine, BookOpen, Briefcase, GraduationCap, MessageCircle, Users, Lightbulb, BarChart3, ListChecks, FileText, Layers, Target, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import type { ContentBrief } from './ContentWizardSidebar';

interface WizardStepWordCountProps {
  outline: OutlineSection[];
  researchSelections: {
    faqs: string[];
    contentGaps: string[];
    relatedKeywords: string[];
    serpHeadings: string[];
  };
  wordCount: number | null;
  wordCountMode: 'ai' | 'custom';
  writingStyle: 'conversational' | 'professional' | 'academic' | 'casual';
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  contentArticleType: 'general' | 'how-to' | 'listicle' | 'comprehensive';
  onWordCountChange: (count: number | null) => void;
  onModeChange: (mode: 'ai' | 'custom') => void;
  onWritingStyleChange: (style: 'conversational' | 'professional' | 'academic' | 'casual') => void;
  onExpertiseLevelChange: (level: 'beginner' | 'intermediate' | 'expert') => void;
  onContentArticleTypeChange: (type: 'general' | 'how-to' | 'listicle' | 'comprehensive') => void;
  selectedSolutionName?: string;
  contentBrief: ContentBrief;
  onContentBriefChange: (brief: ContentBrief) => void;
  additionalInstructions: string;
  onAdditionalInstructionsChange: (inst: string) => void;
}

const WRITING_STYLES = [
  { value: 'conversational' as const, label: 'Conversational', icon: MessageCircle, desc: 'Friendly & engaging' },
  { value: 'professional' as const, label: 'Professional', icon: Briefcase, desc: 'Business tone' },
  { value: 'academic' as const, label: 'Academic', icon: GraduationCap, desc: 'Research-focused' },
  { value: 'casual' as const, label: 'Casual', icon: BookOpen, desc: 'Relaxed & fun' },
];

const EXPERTISE_LEVELS = [
  { value: 'beginner' as const, label: 'Beginner', icon: Users, desc: 'Simple language' },
  { value: 'intermediate' as const, label: 'Intermediate', icon: Lightbulb, desc: 'Some knowledge' },
  { value: 'expert' as const, label: 'Expert', icon: BarChart3, desc: 'Technical depth' },
];

const CONTENT_TYPES = [
  { value: 'general' as const, label: 'General', icon: FileText, desc: 'Standard article' },
  { value: 'how-to' as const, label: 'How-to', icon: ListChecks, desc: 'Step-by-step' },
  { value: 'listicle' as const, label: 'Listicle', icon: ListChecks, desc: 'Numbered list' },
  { value: 'comprehensive' as const, label: 'Comprehensive', icon: Layers, desc: 'In-depth guide' },
];

export const WizardStepWordCount: React.FC<WizardStepWordCountProps> = ({
  outline,
  researchSelections,
  wordCount,
  wordCountMode,
  writingStyle,
  expertiseLevel,
  contentArticleType,
  onWordCountChange,
  onModeChange,
  onWritingStyleChange,
  onExpertiseLevelChange,
  onContentArticleTypeChange,
  selectedSolutionName,
  contentBrief,
  onContentBriefChange,
  additionalInstructions,
  onAdditionalInstructionsChange,
}) => {
  const aiEstimate = React.useMemo(() => {
    const sectionCount = outline.length;
    const totalSelected = Object.values(researchSelections).flat().length;
    const baseWords = 300;
    const researchBonus = totalSelected * 50;
    return Math.round((sectionCount * baseWords + researchBonus) / 100) * 100;
  }, [outline, researchSelections]);

  useEffect(() => {
    if (wordCountMode === 'ai') {
      onWordCountChange(aiEstimate);
    }
  }, [wordCountMode, aiEstimate]);

  const updateBrief = (field: keyof ContentBrief, value: string) => {
    onContentBriefChange({ ...contentBrief, [field]: value });
  };

  return (
    <div className="space-y-5">
      {selectedSolutionName && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Defaults set from <span className="font-medium text-foreground">{selectedSolutionName}</span>'s audience profile — feel free to adjust
          </p>
        </div>
      )}

      {/* Content Brief Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-primary" /> Content Brief
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Help tailor the content to your needs</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] flex items-center gap-1">
              <Users className="h-2.5 w-2.5" /> Audience
            </Label>
            <Select value={contentBrief.targetAudience} onValueChange={(v) => updateBrief('targetAudience', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="professionals">Professionals</SelectItem>
                <SelectItem value="beginners">Beginners</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="developers">Developers</SelectItem>
                <SelectItem value="marketers">Marketers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] flex items-center gap-1">
              <Target className="h-2.5 w-2.5" /> Goal
            </Label>
            <Select value={contentBrief.contentGoal} onValueChange={(v) => updateBrief('contentGoal', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educate">Educate</SelectItem>
                <SelectItem value="convert">Convert</SelectItem>
                <SelectItem value="engage">Engage</SelectItem>
                <SelectItem value="rank">Rank Higher</SelectItem>
                <SelectItem value="authority">Build Authority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] flex items-center gap-1">
              <Palette className="h-2.5 w-2.5" /> Tone
            </Label>
            <Select value={contentBrief.tone} onValueChange={(v) => updateBrief('tone', v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px]">Specific points to include (optional)</Label>
          <Textarea
            value={contentBrief.specificPoints}
            onChange={(e) => updateBrief('specificPoints', e.target.value)}
            placeholder="Any specific topics, pain points, or angles..."
            className="text-xs min-h-[50px] resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Writing Style */}
      <div>
        <h3 className="text-sm font-medium text-foreground">Writing Style</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {WRITING_STYLES.map(s => (
            <button
              key={s.value}
              onClick={() => onWritingStyleChange(s.value)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left cursor-pointer",
                writingStyle === s.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/30 hover:border-border/50 bg-muted/20"
              )}
            >
              <s.icon className={cn("w-4 h-4 flex-shrink-0", writingStyle === s.value ? "text-primary" : "text-muted-foreground")} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{s.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Expertise Level */}
      <div>
        <h3 className="text-sm font-medium text-foreground">Expertise Level</h3>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {EXPERTISE_LEVELS.map(l => (
            <button
              key={l.value}
              onClick={() => onExpertiseLevelChange(l.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all cursor-pointer",
                expertiseLevel === l.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/30 hover:border-border/50 bg-muted/20"
              )}
            >
              <l.icon className={cn("w-4 h-4", expertiseLevel === l.value ? "text-primary" : "text-muted-foreground")} />
              <p className="text-[10px] font-medium text-foreground">{l.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content Type */}
      <div>
        <h3 className="text-sm font-medium text-foreground">Article Type</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {CONTENT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => onContentArticleTypeChange(t.value)}
              className={cn(
                "flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left cursor-pointer",
                contentArticleType === t.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/30 hover:border-border/50 bg-muted/20"
              )}
            >
              <t.icon className={cn("w-4 h-4 flex-shrink-0", contentArticleType === t.value ? "text-primary" : "text-muted-foreground")} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{t.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Word Count */}
      <div>
        <h3 className="text-sm font-medium text-foreground">Target Word Count</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => onModeChange('ai')}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
              wordCountMode === 'ai'
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/30 hover:border-border/50 bg-muted/20"
            )}
          >
            <Sparkles className={cn("w-4 h-4", wordCountMode === 'ai' ? "text-primary" : "text-muted-foreground")} />
            <div className="text-center">
              <p className="text-xs font-medium text-foreground">AI Recommended</p>
              {wordCountMode === 'ai' && (
                <Badge variant="secondary" className="text-[10px] mt-1">~{aiEstimate.toLocaleString()}</Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => onModeChange('custom')}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer",
              wordCountMode === 'custom'
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/30 hover:border-border/50 bg-muted/20"
            )}
          >
            <PenLine className={cn("w-4 h-4", wordCountMode === 'custom' ? "text-primary" : "text-muted-foreground")} />
            <p className="text-xs font-medium text-foreground">Custom</p>
          </button>
        </div>
        {wordCountMode === 'custom' && (
          <div className="mt-2">
            <Input
              type="number"
              min={200}
              max={10000}
              step={100}
              value={wordCount || ''}
              onChange={(e) => onWordCountChange(parseInt(e.target.value) || null)}
              placeholder="e.g. 1500"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1">AI recommended: ~{aiEstimate.toLocaleString()} words</p>
          </div>
        )}
      </div>

      {/* Additional Instructions */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">Additional Instructions (optional)</h3>
        <Textarea
          value={additionalInstructions}
          onChange={(e) => onAdditionalInstructionsChange(e.target.value)}
          placeholder="Any special instructions for the AI writer..."
          className="text-xs min-h-[50px] resize-none"
          rows={2}
        />
      </div>
    </div>
  );
};