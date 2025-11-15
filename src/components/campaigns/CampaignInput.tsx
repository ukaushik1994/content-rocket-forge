import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard } from '@/components/ui/GlassCard';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { CampaignInput as CampaignInputType, CampaignGoal, CampaignTimeline } from '@/types/campaign-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CampaignInputProps {
  onGenerate: (input: CampaignInputType) => Promise<void>;
  onCancel: () => void;
  isGenerating?: boolean;
}

export function CampaignInput({ onGenerate, onCancel, isGenerating = false }: CampaignInputProps) {
  const [campaignIdea, setCampaignIdea] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState<CampaignGoal>('awareness');
  const [timeline, setTimeline] = useState<CampaignTimeline>('4-week');
  const [showOptional, setShowOptional] = useState(false);

  const maxChars = 500;
  const minChars = 20;
  const isValid = campaignIdea.length >= minChars;

  const handleSubmit = async () => {
    if (!isValid) return;

    const input: CampaignInputType = {
      idea: campaignIdea,
      targetAudience: audience || undefined,
      goal,
      timeline,
    };

    await onGenerate(input);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto"
    >
      <GlassCard className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
              Describe Your Campaign Idea
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Tell us about your campaign and we'll generate 4 strategic options for you
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-idea">Campaign Idea *</Label>
          <Textarea
            id="campaign-idea"
            placeholder="Describe your campaign idea... (e.g., 'Launch our new AI-powered analytics platform targeting B2B SaaS companies')"
            value={campaignIdea}
            onChange={(e) => setCampaignIdea(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={maxChars}
            disabled={isGenerating}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={campaignIdea.length < minChars ? 'text-destructive' : ''}>
              {campaignIdea.length < minChars && `Minimum ${minChars} characters`}
            </span>
            <span className={campaignIdea.length > maxChars * 0.9 ? 'text-warning' : ''}>
              {campaignIdea.length}/{maxChars}
            </span>
          </div>
        </div>

        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              disabled={isGenerating}
            >
              <span className="text-sm text-muted-foreground">Optional Details</span>
              {showOptional ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Textarea
                id="audience"
                placeholder="Who is this campaign for? (e.g., 'B2B decision makers in tech startups')"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)} disabled={isGenerating}>
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Brand Awareness</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Select value={timeline} onValueChange={(v) => setTimeline(v as CampaignTimeline)} disabled={isGenerating}>
                  <SelectTrigger id="timeline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-week">2 Weeks</SelectItem>
                    <SelectItem value="4-week">4 Weeks</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isGenerating}
            className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI is analyzing your campaign...
              </>
            ) : (
              'Generate Strategies'
            )}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
