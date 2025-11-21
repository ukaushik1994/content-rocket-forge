import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, ChevronDown, Package, Sparkles, Lightbulb, Globe, Users, Target, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { CampaignInput as CampaignInputType, CampaignGoal, CampaignTimeline } from '@/types/campaign-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { solutionService } from '@/services/solutionService';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { cn } from '@/lib/utils';
import { validateCampaignInput } from '@/utils/inputValidation';
import { toast } from 'sonner';

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
  const [useSerpData, setUseSerpData] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState<string>('');
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const data = await solutionService.getAllSolutions();
        setSolutions(data || []);
      } catch (error) {
        console.error('Failed to fetch solutions:', error);
      } finally {
        setLoadingSolutions(false);
      }
    };
    fetchSolutions();
  }, []);

  const maxChars = 500;
  const minChars = 20;
  const isValid = campaignIdea.length >= minChars;
  const charProgress = (campaignIdea.length / maxChars) * 100;
  const isNearLimit = campaignIdea.length > maxChars * 0.8;
  const activeOptionsCount = [audience, selectedSolution].filter(Boolean).length;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    try {
      // Build input object
      const input: CampaignInputType = {
        idea: campaignIdea,
        targetAudience: audience || undefined,
        goal,
        timeline,
        useSerpData,
        solutionId: selectedSolution || undefined,
      };
      
      // Validate and sanitize input
      const validatedInput = validateCampaignInput(input);
      
      // Pass validated input to parent
      await onGenerate(validatedInput);
    } catch (error) {
      console.error('Input validation error:', error);
      toast.error(error instanceof Error ? error.message : 'Invalid input');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="w-full max-w-3xl mx-auto">
      <GlassCard className="relative p-8 space-y-8 bg-background/40 backdrop-blur-xl border-primary/20 shadow-[0_8px_32px_0_rgba(139,92,246,0.15)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><Sparkles className="h-6 w-6 text-primary" /></motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">Describe Your Campaign Idea</h2>
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary border-primary/20"><Zap className="h-3 w-3 mr-1" />4 Strategies</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-background/60">Cancel</Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><p>AI will generate 4 strategic options in seconds</p></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative space-y-3">
          <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /><Label htmlFor="campaign-idea" className="text-base font-semibold">Campaign Idea *</Label></div>
          <div className="relative">
            <Textarea id="campaign-idea" placeholder="Example: 'Launch our new AI-powered analytics platform targeting B2B SaaS companies looking to improve their data insights and decision-making...'" value={campaignIdea} onChange={(e) => setCampaignIdea(e.target.value)} className={cn("min-h-[150px] resize-none bg-background/60 backdrop-blur-sm border-2 transition-all duration-300", campaignIdea.length >= minChars && "border-primary/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]", isGenerating && "opacity-50")} maxLength={maxChars} disabled={isGenerating} />
            {campaignIdea.length >= minChars && !isGenerating && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3"><CheckCircle2 className="h-5 w-5 text-primary" /></motion.div>)}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <motion.span className={cn("font-medium transition-colors", campaignIdea.length < minChars ? "text-destructive" : "text-primary")} animate={{ scale: campaignIdea.length < minChars ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }}>{campaignIdea.length < minChars ? `${minChars - campaignIdea.length} more characters needed` : "✓ Ready to generate"}</motion.span>
              <span className={cn("font-mono transition-colors", isNearLimit ? "text-yellow-500" : "text-muted-foreground")}>{campaignIdea.length}/{maxChars}</span>
            </div>
            <Progress value={charProgress} className={cn("h-1 transition-all duration-300", campaignIdea.length >= minChars && "bg-primary/20")} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="space-y-2">
            <Label htmlFor="goal">Campaign Goal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)} disabled={isGenerating}>
              <SelectTrigger id="goal" className="bg-background/60 backdrop-blur-sm border-2 hover:border-primary/40 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl">
                <SelectItem value="awareness">Brand Awareness</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <Select value={timeline} onValueChange={(v) => setTimeline(v as CampaignTimeline)} disabled={isGenerating}>
              <SelectTrigger id="timeline" className="bg-background/60 backdrop-blur-sm border-2 hover:border-primary/40 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl">
                <SelectItem value="1-week">1 Week Sprint</SelectItem>
                <SelectItem value="2-week">2 Weeks</SelectItem>
                <SelectItem value="4-week">4 Weeks (1 Month)</SelectItem>
                <SelectItem value="8-week">8 Weeks (2 Months)</SelectItem>
                <SelectItem value="12-week">12 Weeks (3 Months)</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative"><Button onClick={handleSubmit} disabled={!isValid || isGenerating} className={cn("relative w-full h-14 text-base font-semibold overflow-hidden group transition-all duration-300", isValid && !isGenerating && "bg-gradient-to-r from-primary via-blue-500 to-purple-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-[1.02]")} size="lg">{isValid && !isGenerating && (<motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />)}<span className="relative z-10 flex items-center justify-center gap-2">{isGenerating ? (<><Loader2 className="h-5 w-5 animate-spin" />Generating 4 Strategies...</>) : (<><Sparkles className="h-5 w-5" />Generate Campaign Strategies{!isGenerating && isValid && (<Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">⌘ + Enter</Badge>)}</>)}</span></Button></motion.div>
      </GlassCard>
    </motion.div>
  );
}
