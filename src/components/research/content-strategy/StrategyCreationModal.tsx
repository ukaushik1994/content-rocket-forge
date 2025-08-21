import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, XCircle, Sparkles, Target, Search, BarChart3, CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';
import { analyzeKeywordSerp, SerpAnalysisResult } from '@/services/serpApiService';
import { toast } from 'sonner';
import { useContentStrategyOptional } from '@/contexts/ContentStrategyContext';

interface StrategyCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StepStatus = 'idle' | 'running' | 'success' | 'error';

interface StepState {
  key: string;
  title: string;
  subtext: string;
  status: StepStatus;
  log?: string;
}

interface CandidateKeyword {
  kw: string;
  rationale?: string;
  intended_audience?: string;
  suggested_intent?: string;
}

interface AIOutputShape {
  candidate_keywords: CandidateKeyword[];
  notes?: string[];
}

export const StrategyCreationModal: React.FC<StrategyCreationModalProps> = ({ open, onOpenChange }) => {
  const [steps, setSteps] = useState<StepState[]>([
    { key: 'gather', title: 'Gather Signals', subtext: 'Reading your docs, competitors, and past content.', status: 'idle' },
    { key: 'generate', title: 'Generate Keywords', subtext: 'AI is proposing targets based on your current strengths.', status: 'idle' },
    { key: 'enrich', title: 'Enrich with SERP', subtext: 'Fetching volumes, difficulty, PAA, and related searches.', status: 'idle' },
    { key: 'score', title: 'Score & Forecast', subtext: 'Prioritizing by relevance, gap, and likely traffic.', status: 'idle' },
    { key: 'compose', title: 'Compose Plan', subtext: 'Bundling into clusters, asset mix, and calendar.', status: 'idle' },
    { key: 'review', title: 'Review & Confirm', subtext: 'Ready when you are.', status: 'idle' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [aiOutput, setAiOutput] = useState<AIOutputShape | null>(null);
  const [enriched, setEnriched] = useState<Record<string, SerpAnalysisResult>>({});
  const [reviewReady, setReviewReady] = useState(false);
  const [creating, setCreating] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const contentStrategy = useContentStrategyOptional();
  const [plan, setPlan] = useState<any[] | null>(null);
  const [planSummary, setPlanSummary] = useState<{forecast_best:number; forecast_cons:number; clusters:number; pieces:number} | null>(null);

  useEffect(() => {
    if (!open) {
      // reset state when closing
      setSteps(prev => prev.map((s, i) => ({ ...s, status: i === 0 ? 'idle' : 'idle', log: undefined })));
      setIsRunning(false);
      setCancelled(false);
      setAiOutput(null);
      setEnriched({});
      setPlan(null);
      setPlanSummary(null);
      setReviewReady(false);
      setCreating(false);
      setRunId(null);
    }
  }, [open]);

  const updateStep = (key: string, patch: Partial<StepState>) => {
    setSteps(prev => prev.map(s => (s.key === key ? { ...s, ...patch } : s)));
  };

  const start = async () => {
    setIsRunning(true);
    setCancelled(false);

    try {
      // Step 1: Gather Signals
      updateStep('gather', { status: 'running', log: 'Collecting inputs…' });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a run row immediately for persistence
      const { data: runInsert, error: runErr } = await supabase
        .from('strategy_runs')
        .insert({ user_id: user.id, region: 'us', language: 'en', status: 'running' })
        .select('id')
        .single();
      if (runErr) throw runErr;
      setRunId(runInsert.id);

      const [companyRes, guidelinesRes, competitorsRes, contentRes] = await Promise.all([
        supabase.from('company_info').select('*').single(),
        supabase.from('brand_guidelines').select('*').single(),
        supabase.from('company_competitors').select('*'),
        supabase.from('content_items').select('id,title,metadata,created_at')
      ]);

      const company = companyRes.data || null;
      const guidelines = guidelinesRes.data || null;
      const competitors = competitorsRes.data || [];
      const contentItems = contentRes.data || [];

      const usedKeywords: string[] = [];
      try {
        contentItems.forEach((item: any) => {
          const kws = item?.metadata?.keywords || item?.metadata?.mainKeyword ? [item.metadata.mainKeyword, ...(item.metadata.keywords || [])] : [];
          kws.filter(Boolean).forEach((k: string) => usedKeywords.push(String(k)));
        });
      } catch {}

      updateStep('gather', { status: 'success', log: `${competitors.length} competitors, ${contentItems.length} past items` });
      if (cancelled) return;

      // Step 2: Generate Keywords (AI)
      updateStep('generate', { status: 'running', log: 'Calling AI…' });
      const sys = `You are an expert content strategist. Return JSON only with fields candidate_keywords[] and notes[]. Each candidate keyword: { kw, rationale, intended_audience, suggested_intent }.`;
      const payload = {
        company,
        guidelines,
        competitors,
        used_keywords: Array.from(new Set(usedKeywords)).slice(0, 200),
        region: 'us',
        language: 'en'
      };
      const reqText = `Analyze the following inputs and propose high-value keywords avoiding overlaps with used_keywords. Inputs:\n\n${JSON.stringify(payload).slice(0, 15000)}`;
      const ai = await AIServiceController.generate('strategy', sys, reqText, { maxTokens: 1500, temperature: 0.3 });
      let parsed: AIOutputShape | null = null;
      if (ai && ai.content) {
        const raw: string = ai.content;
        const jsonMatch = raw.match(/```json[\s\S]*?```|\{[\s\S]*\}$/);
        const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : raw;
        try { parsed = JSON.parse(jsonStr); } catch { parsed = null; }
      }
      if (!parsed || !Array.isArray(parsed.candidate_keywords)) {
        updateStep('generate', { status: 'error', log: 'AI output invalid' });
        setIsRunning(false);
        return;
      }
      setAiOutput(parsed);
      updateStep('generate', { status: 'success', log: `${parsed.candidate_keywords.length} keywords found` });
      if (cancelled) return;

      // Step 3: Enrich with SERP
      updateStep('enrich', { status: 'running', log: 'Fetching SERP metrics…' });
      const topKeywords = parsed.candidate_keywords.slice(0, 25); // limit for speed
      const enrichedMap: Record<string, SerpAnalysisResult> = {};
      for (let i = 0; i < topKeywords.length; i++) {
        if (cancelled) return;
        const kw = topKeywords[i].kw;
        const res = await analyzeKeywordSerp(kw);
        if (res) enrichedMap[kw] = res;
        updateStep('enrich', { log: `${Object.keys(enrichedMap).length} enriched` });
      }
      setEnriched(enrichedMap);
      updateStep('enrich', { status: 'success', log: `${Object.keys(enrichedMap).length} enriched by SERP` });
      if (cancelled) return;

      // Step 4: Score & Forecast
      updateStep('score', { status: 'running', log: 'Scoring…' });
      const scored = topKeywords.map((k) => {
        const r = enrichedMap[k.kw];
        const volume = r?.searchVolume || 0;
        const kd = r?.keywordDifficulty || 0;
        const hasSnippet = (r?.featuredSnippets?.length || 0) > 0;
        const relevance = 30; // simple base until we compute semantic relevance
        const diffInv = 20 - Math.min(20, Math.round((kd / 100) * 20));
        const gap = Math.min(20, (r?.contentGaps?.length || 0) * 4);
        const trend = Math.min(10, (hasSnippet ? 3 : 0) + ((r?.peopleAlsoAsk?.length || 0) > 3 ? 3 : 0));
        const internal = Math.min(15, Math.floor((usedKeywords.includes(k.kw) ? 5 : 10)));
        const priority = Math.max(0, Math.min(100, relevance + diffInv + gap + trend + internal));
        const ctr = 0.22; // optimistic Top3 band midpoint
        const coverage = 0.75;
        const forecast = Math.round(volume * ctr * coverage);
        return { ...k, volume, kd, hasSnippet, priority, forecast };
      });
      updateStep('score', { status: 'success', log: `${scored.length} scored` });
      if (cancelled) return;

      // Step 5: Compose Plan
      updateStep('compose', { status: 'running', log: 'Clustering…' });
      // naive clustering by first token
      const clusters: Record<string, typeof scored> = {};
      for (const item of scored) {
        const key = item.kw.split(' ')[0].toLowerCase();
        clusters[key] = clusters[key] || [];
        clusters[key].push(item);
      }
      // build plan data
      const planClusters = Object.entries(clusters).slice(0, 3).map(([name, kws]) => {
        const priority_score = Math.round(kws.reduce((a, b) => a + b.priority, 0) / kws.length);
        const forecast_best = kws.reduce((a, b) => a + b.forecast, 0);
        const forecast_cons = Math.round(forecast_best * 0.55);
        const asset_mix = [
          { type: 'pillar_article', count: 1 },
          { type: 'support_blog', count: Math.max(2, Math.min(4, Math.ceil(kws.length / 2))) },
          { type: 'glossary', count: 1 },
        ];
        const calendar = [
          { week: 1, title: `${name} Strategy: Pillar Overview`, type: 'pillar_article' },
          { week: 2, title: `${kws[0].kw}: Deep Dive`, type: 'support_blog' },
        ];
        const firstKw = kws[0];
        const serp = enrichedMap[firstKw.kw];
        const brief_stub = {
          primary_keyword: firstKw.kw,
          seo_titles: [ `${firstKw.kw} — Complete Guide`, `${firstKw.kw}: Best Practices` ],
          h2s: (serp?.headings || []).slice(0, 6).map(h => (h as any).text || h).filter(Boolean),
          faqs: (serp?.peopleAlsoAsk || []).slice(0, 6).map((q: any) => q.question || q).filter(Boolean),
          internal_links: [],
          meta: { title: `${firstKw.kw} — Guide`, description: `Actionable guidance for ${firstKw.kw}.` }
        };
        return {
          name,
          priority_score,
          keywords: kws.map(k => ({ kw: k.kw, volume: k.volume, intent: k.suggested_intent || 'informational' })),
          forecast: { best: forecast_best, conservative: forecast_cons },
          asset_mix,
          edge_note: (aiOutput?.notes && aiOutput.notes[0]) || 'Competitors miss implementation detail and real examples.',
          calendar,
          brief_stubs: [brief_stub],
          reuse_flags: { headings: [], faqs: [] }
        };
      });
      const summary = {
        forecast_best: planClusters.reduce((a, c) => a + c.forecast.best, 0),
        forecast_cons: planClusters.reduce((a, c) => a + c.forecast.conservative, 0),
        clusters: planClusters.length,
        pieces: planClusters.reduce((a, c) => a + c.asset_mix.reduce((x: number, y: any) => x + y.count, 0), 0)
      };
      updateStep('compose', { status: 'success', log: `${planClusters.length} clusters built` });

      // Persist composed data in local state for review
      setPlan(planClusters);
      setPlanSummary(summary);

      // Save summary to run
      if (runId) {
        await supabase.from('strategy_runs').update({ summary_json: summary }).eq('id', runId);
      }

      // Step 6: Review
      updateStep('review', { status: 'success', log: 'Ready' });
      setReviewReady(true);
      setIsRunning(false);
    } catch (err: any) {
      console.error(err);
      const current = steps.find(s => s.status === 'running');
      if (current) updateStep(current.key, { status: 'error', log: err.message || 'Failed' });
      setIsRunning(false);
    }
  };

  const handleCreate = async () => {
    if (!reviewReady || !contentStrategy) return;
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the Content Strategy record
      await contentStrategy.createStrategy({
        name: `Content Strategy — ${new Date().toLocaleDateString()}`,
        monthly_traffic_goal: planSummary?.forecast_best || undefined,
        content_pieces_per_month: Math.max(4, Math.min(12, Math.ceil(((planSummary?.pieces ?? 6) / 3)))),
        timeline: '3 months',
        main_keyword: aiOutput?.candidate_keywords?.[0]?.kw
      });

      if (runId) {
        await supabase.from('strategy_runs').update({ status: 'completed' }).eq('id', runId);
      }

      toast.success('Strategy created');
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to create strategy');
    } finally {
      setCreating(false);
    }
  };

  const canRetry = useMemo(() => steps.some(s => s.status === 'error'), [steps]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isRunning) onOpenChange(v); }}>
      <DialogContent className="max-w-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Create New Strategy
          </DialogTitle>
        </DialogHeader>

        {/* Journey */}
        <div className="space-y-6">
          <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.round((steps.filter(s => s.status === 'success').length / steps.length) * 100)}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <motion.div key={step.key} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mt-0.5">
                  {step.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                  {step.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-400" />}
                  {step.status === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                  {step.status === 'idle' && <Target className="h-5 w-5 text-white/40" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{idx + 1}) {step.title}</p>
                      <p className="text-sm text-white/60">{step.subtext}</p>
                    </div>
                    <div className="text-xs text-white/60">{step.log}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {reviewReady && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <p className="font-medium text-white">Review Summary</p>
                </div>
                <p className="text-sm text-white/60 mb-4">A compact plan is ready. You can create the strategy now and iterate in the Strategy workspace.</p>
                {planSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-md bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10">
                      <p className="text-xs text-white/60">Clusters</p>
                      <p className="text-lg font-semibold text-white">{planSummary.clusters}</p>
                    </div>
                    <div className="p-3 rounded-md bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-white/10">
                      <p className="text-xs text-white/60">Pieces</p>
                      <p className="text-lg font-semibold text-white">{planSummary.pieces}</p>
                    </div>
                    <div className="p-3 rounded-md bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/10">
                      <p className="text-xs text-white/60">Forecast (Best)</p>
                      <p className="text-lg font-semibold text-white">{planSummary.forecast_best}</p>
                    </div>
                    <div className="p-3 rounded-md bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-white/10">
                      <p className="text-xs text-white/60">Forecast (Conservative)</p>
                      <p className="text-lg font-semibold text-white">{planSummary.forecast_cons}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/80 hover:text-white hover:bg-white/10">Back</Button>
                  <Button onClick={handleCreate} disabled={creating || !contentStrategy} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                    {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating…</> : 'Create Strategy'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <div className="text-xs text-white/60">You can cancel anytime. Partial results are kept in this run.</div>
            <div className="flex gap-2">
              {!isRunning && !reviewReady && (
                <Button onClick={start} className="hover-scale bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  <Search className="h-4 w-4 mr-2" /> Start
                </Button>
              )}
              {isRunning && (
                <Button variant="outline" onClick={() => { setCancelled(true); setIsRunning(false); toast.message('Run cancelled'); }} className="border-white/20 text-white/80 hover:bg-white/10">Cancel</Button>
              )}
              {canRetry && !isRunning && (
                <Button variant="secondary" onClick={start} className="bg-white/10 text-white hover:bg-white/20">Retry</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
