import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Megaphone, Target, Zap, TrendingUp, Mic, MicOff, MessageSquare, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CampaignSettingsPanel } from './CampaignSettingsPanel';
import { useCampaignStats } from '@/hooks/useCampaignStats';
import { toast } from 'sonner';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';

interface CampaignsHeroProps {
  onCreateClick?: () => void;
  onStartConversation?: (message: string, settings: {
    solutionId: string | null;
    platformPreferences: Record<string, number>;
  }) => void;
  onExpressMode?: (data: {
    idea: string;
    audience: string;
    timeline: string;
    goal: string;
    solutionId: string | null;
    platformPreferences: Record<string, number>;
  }) => void;
}
type InputMode = 'conversation' | 'express';
export const CampaignsHero = React.memo(({
  onCreateClick,
  onStartConversation,
  onExpressMode
}: CampaignsHeroProps) => {
  const [mode, setMode] = useState<InputMode>('conversation');
  const [campaignIdea, setCampaignIdea] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { activeCampaigns, contentPiecesCreated, completedCampaigns, loading: statsLoading } = useCampaignStats();

  const [showSettings, setShowSettings] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [platformPreferences, setPlatformPreferences] = useState<Record<string, number>>({});

  const [expressData, setExpressData] = useState({
    idea: '',
    audience: '',
    timeline: '4-week',
    goal: 'awareness'
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.onresult = event => {
          const transcript = event.results[0][0].transcript;
          setCampaignIdea(transcript);
          setIsListening(false);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (!campaignIdea.trim()) return;
    if (!selectedSolutionId) {
      toast.error('Please select an offering before starting');
      return;
    }
    if (onStartConversation) {
      onStartConversation(campaignIdea.trim(), {
        solutionId: selectedSolutionId,
        platformPreferences,
      });
      setCampaignIdea('');
    }
  };

  const handleExpressSubmit = () => {
    if (!expressData.idea.trim()) return;
    if (!selectedSolutionId) {
      toast.error('Please select an offering before starting');
      return;
    }
    if (onExpressMode) {
      onExpressMode({ ...expressData, solutionId: selectedSolutionId, platformPreferences });
      setExpressData({ idea: '', audience: '', timeline: '4-week', goal: 'awareness' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const hasVoiceSupport = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return (
    <div className="space-y-6">
      <CompactPageHeader
        icon={Megaphone}
        title="Campaigns"
        subtitle="AI-powered campaign strategy & content generation"
        stats={[
          { icon: Target, label: 'Active', value: statsLoading ? '-' : activeCampaigns },
          { icon: TrendingUp, label: 'Content', value: statsLoading ? '-' : contentPiecesCreated },
          { icon: Sparkles, label: 'Completed', value: statsLoading ? '-' : completedCampaigns },
        ]}
      />

      {/* Mode Toggle */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/30">
          <button
            onClick={() => setMode('conversation')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'conversation' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Conversation
          </button>
          <button
            onClick={() => setMode('express')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'express' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Express
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className={showSettings ? 'text-primary' : 'text-muted-foreground'}
        >
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          Settings
        </Button>
      </div>

      <CampaignSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedSolutionId={selectedSolutionId}
        onSolutionChange={setSelectedSolutionId}
        platformPreferences={platformPreferences}
        onPlatformPreferencesChange={setPlatformPreferences}
      />

      {/* Conversation Mode */}
      {mode === 'conversation' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-xl p-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <input
              type="text"
              value={campaignIdea}
              onChange={e => setCampaignIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your campaign idea..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {hasVoiceSupport && (
              <Button type="button" variant="ghost" size="sm" onClick={toggleVoiceInput} className={isListening ? 'text-destructive' : 'text-muted-foreground'}>
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button onClick={handleSubmit} disabled={!campaignIdea.trim()} size="sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Start
            </Button>
          </div>
          {isListening && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-destructive rounded-full animate-pulse" /> Listening...
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {['Product Launch', 'Brand Awareness', 'Lead Generation'].map(prompt => (
              <button
                key={prompt}
                onClick={() => setCampaignIdea(prompt)}
                className="text-xs px-2.5 py-1 rounded-md bg-muted/30 hover:bg-muted/50 border border-border/30 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Express Mode */}
      {mode === 'express' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 bg-muted/10 border border-border/30 rounded-xl p-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Campaign Idea *</label>
            <Textarea
              value={expressData.idea}
              onChange={e => setExpressData({ ...expressData, idea: e.target.value })}
              placeholder="Describe your campaign idea..."
              className="min-h-[80px] bg-background/50 text-sm"
              maxLength={500}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Target Audience</label>
              <Input
                value={expressData.audience}
                onChange={e => setExpressData({ ...expressData, audience: e.target.value })}
                placeholder="e.g., SaaS founders"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Timeline</label>
              <Select value={expressData.timeline} onValueChange={v => setExpressData({ ...expressData, timeline: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-week">2 Weeks</SelectItem>
                  <SelectItem value="4-week">4 Weeks</SelectItem>
                  <SelectItem value="8-week">8 Weeks</SelectItem>
                  <SelectItem value="12-week">12 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Goal</label>
              <Select value={expressData.goal} onValueChange={v => setExpressData({ ...expressData, goal: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="retention">Customer Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleExpressSubmit} disabled={!expressData.idea.trim()} className="w-full" size="sm">
            <Zap className="h-3.5 w-3.5 mr-1.5" /> Generate Campaign Strategy
          </Button>
        </motion.div>
      )}
    </div>
  );
});

CampaignsHero.displayName = "CampaignsHero";
