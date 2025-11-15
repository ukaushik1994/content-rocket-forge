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
    const input: CampaignInputType = {
      idea: campaignIdea,
      targetAudience: audience || undefined,
      goal,
      timeline,
      useSerpData,
      solutionId: selectedSolution || undefined,
    };
    await onGenerate(input);
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Collapsible open={showOptional} onOpenChange={setShowOptional}>
            <CollapsibleTrigger asChild><Button variant="ghost" className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 hover:from-primary/10 hover:via-blue-500/10 hover:to-purple-500/10 border border-primary/10 transition-all duration-300"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Optional Details</span>{activeOptionsCount > 0 && (<Badge variant="secondary" className="ml-2 bg-primary/20 text-primary text-xs">{activeOptionsCount} active</Badge>)}</div><motion.div animate={{ rotate: showOptional ? 180 : 0 }} transition={{ duration: 0.3 }}><ChevronDown className="h-4 w-4" /></motion.div></Button></CollapsibleTrigger>
            <CollapsibleContent><AnimatePresence>{showOptional && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 space-y-6 p-6 rounded-lg bg-background/40 backdrop-blur-sm border border-primary/10"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={cn("relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group", useSerpData ? "bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 border-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.2)]" : "bg-background/60 border-border hover:border-primary/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)]")} onClick={() => !isGenerating && setUseSerpData(!useSerpData)}>{useSerpData && (<motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="absolute top-3 right-3"><Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Enabled</Badge></motion.div>)}<div className="flex items-start gap-4"><div className={cn("p-3 rounded-lg transition-colors duration-300", useSerpData ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10")}><Globe className={cn("h-6 w-6 transition-colors", useSerpData ? "text-primary" : "text-muted-foreground")} /></div><div className="flex-1 space-y-2 pt-1"><div className="flex items-center gap-2"><Checkbox id="serp-data" checked={useSerpData} onCheckedChange={(checked) => setUseSerpData(checked as boolean)} disabled={isGenerating} className="mt-0.5" /><Label htmlFor="serp-data" className="text-base font-semibold cursor-pointer">Real-Time Search Intelligence</Label></div><p className="text-sm text-muted-foreground">Enhance strategies with live SERP data, keyword trends, and competitive insights</p><div className="flex flex-wrap gap-2 pt-1"><Badge variant="outline" className="text-xs">Live Data</Badge><Badge variant="outline" className="text-xs">Keyword Analysis</Badge><Badge variant="outline" className="text-xs">Competition Intel</Badge></div></div></div></motion.div><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-3"><div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /><Label htmlFor="solution" className="text-base font-semibold">Link to Solution</Label><Badge variant="outline" className="text-xs">Optional</Badge></div><Select value={selectedSolution} onValueChange={setSelectedSolution} disabled={isGenerating || loadingSolutions}><SelectTrigger id="solution" className="bg-background/60 backdrop-blur-sm border-2 hover:border-primary/40 transition-all duration-300"><SelectValue placeholder={loadingSolutions ? "Loading solutions..." : "Select a solution to boost campaign relevance"} /></SelectTrigger><SelectContent className="bg-background/95 backdrop-blur-xl"><SelectItem value="none">None - General campaign</SelectItem>{solutions.map((solution) => (<SelectItem key={solution.id} value={solution.id} className="cursor-pointer"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" />{solution.name}</div></SelectItem>))}</SelectContent></Select>{selectedSolution && selectedSolution !== 'none' && (<motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-primary"><Zap className="h-3 w-3" /><span>Boosting campaign accuracy with solution context</span></motion.div>)}<p className="text-xs text-muted-foreground">Linking a solution tailors strategies to your specific product or service</p></motion.div><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-3"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><Label htmlFor="audience" className="text-base font-semibold">Target Audience</Label></div><Textarea id="audience" placeholder="e.g., Marketing managers at mid-size B2B companies looking to scale their content operations" value={audience} onChange={(e) => setAudience(e.target.value)} className="min-h-[80px] resize-none bg-background/60 backdrop-blur-sm border-2 hover:border-primary/40 focus:border-primary/40 transition-all duration-300" disabled={isGenerating} /></motion.div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2"><Label htmlFor="goal">Campaign Goal</Label><Select value={goal} onValueChange={(v) => setGoal(v as CampaignGoal)} disabled={isGenerating}><SelectTrigger id="goal" className="bg-background/60 backdrop-blur-sm"><SelectValue /></SelectTrigger><SelectContent className="bg-background/95 backdrop-blur-xl"><SelectItem value="awareness">Brand Awareness</SelectItem><SelectItem value="conversion">Conversion</SelectItem><SelectItem value="engagement">Engagement</SelectItem><SelectItem value="education">Education</SelectItem></SelectContent></Select></motion.div><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2"><Label htmlFor="timeline">Timeline</Label><Select value={timeline} onValueChange={(v) => setTimeline(v as CampaignTimeline)} disabled={isGenerating}><SelectTrigger id="timeline" className="bg-background/60 backdrop-blur-sm"><SelectValue /></SelectTrigger><SelectContent className="bg-background/95 backdrop-blur-xl"><SelectItem value="1-week">1 Week Sprint</SelectItem><SelectItem value="2-week">2 Weeks</SelectItem><SelectItem value="4-week">4 Weeks (1 Month)</SelectItem><SelectItem value="8-week">8 Weeks (2 Months)</SelectItem><SelectItem value="12-week">12 Weeks (3 Months)</SelectItem></SelectContent></Select></motion.div></div></motion.div>)}</AnimatePresence></CollapsibleContent>
          </Collapsible>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative"><Button onClick={handleSubmit} disabled={!isValid || isGenerating} className={cn("relative w-full h-14 text-base font-semibold overflow-hidden group transition-all duration-300", isValid && !isGenerating && "bg-gradient-to-r from-primary via-blue-500 to-purple-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-[1.02]")} size="lg">{isValid && !isGenerating && (<motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />)}<span className="relative z-10 flex items-center justify-center gap-2">{isGenerating ? (<><Loader2 className="h-5 w-5 animate-spin" />Generating 4 Strategies...</>) : (<><Sparkles className="h-5 w-5" />Generate Campaign Strategies{!isGenerating && isValid && (<Badge variant="secondary" className="ml-2 bg-white/20 text-white border-0">⌘ + Enter</Badge>)}</>)}</span></Button></motion.div>
      </GlassCard>
    </motion.div>
  );
}
