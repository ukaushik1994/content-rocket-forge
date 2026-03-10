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
  stats?: {
    activeCampaigns: number;
    contentPiecesCreated: number;
    completedCampaigns: number;
  };
}
type InputMode = 'conversation' | 'express';
export const CampaignsHero = React.memo(({
  onCreateClick,
  onStartConversation,
  onExpressMode,
  stats: externalStats
}: CampaignsHeroProps) => {
  const [mode, setMode] = useState<InputMode>('conversation');
  const [campaignIdea, setCampaignIdea] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Use external stats from parent (derived from campaigns list) or fallback to hook
  const fallbackStats = useCampaignStats();
  const activeCampaigns = externalStats?.activeCampaigns ?? fallbackStats.activeCampaigns;
  const contentPiecesCreated = externalStats?.contentPiecesCreated ?? fallbackStats.contentPiecesCreated;
  const completedCampaigns = externalStats?.completedCampaigns ?? fallbackStats.completedCampaigns;
  const statsLoading = !externalStats && fallbackStats.loading;

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<string | null>(null);
  const [platformPreferences, setPlatformPreferences] = useState<Record<string, number>>({});

  // Express mode form fields
  const [expressData, setExpressData] = useState({
    idea: '',
    audience: '',
    timeline: '4-week',
    goal: 'awareness'
  });

  // Initialize speech recognition
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
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
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
        platformPreferences: platformPreferences
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
      onExpressMode({
        ...expressData,
        solutionId: selectedSolutionId,
        platformPreferences: platformPreferences
      });
      setExpressData({
        idea: '',
        audience: '',
        timeline: '4-week',
        goal: 'awareness'
      });
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  const hasVoiceSupport = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  return <motion.div className="relative min-h-[60vh] flex items-center justify-center w-full" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.8,
    ease: "easeOut"
  }}>
      <div className="relative z-10 w-full px-6 pt-8 pb-12">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <motion.div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-transparent to-neon-blue/10 rounded-3xl blur-3xl" animate={{
          opacity: [0.5, 0.8, 0.5]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }} />

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2,
          duration: 0.4
        }} className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 hover:scale-105 transition-transform duration-300">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-Powered Campaign Builder</span>
              <motion.div className="w-2 h-2 rounded-full bg-green-500" animate={{
              opacity: [0.5, 1, 0.5]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }} />
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.4
        }} className="relative space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan bg-clip-text text-transparent">
                Campaigns
              </span>{' '}
              
            </h1>
          </motion.div>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.4
        }} className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Create comprehensive marketing campaigns with AI-powered strategy generation
          </motion.p>

          {/* Removed Create New Campaign button - using conversational input instead */}

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.8,
          duration: 0.4
        }} className="flex justify-center gap-8 mt-12">
            {[
              { icon: Target, value: statsLoading ? '-' : activeCampaigns, label: 'Active', color: 'text-emerald-400' },
              { icon: TrendingUp, value: statsLoading ? '-' : contentPiecesCreated, label: 'Content Created', color: 'text-teal-400' },
              { icon: Sparkles, value: statsLoading ? '-' : completedCampaigns, label: 'Completed', color: 'text-green-400' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Mode Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
            className="mt-6 flex justify-center"
          >
            <div className="inline-flex items-center gap-1 p-1 bg-background/60 backdrop-blur-xl rounded-full border border-border/50">
              <button
                onClick={() => setMode('conversation')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === 'conversation' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Conversation
              </button>
              <button
                onClick={() => setMode('express')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  mode === 'express' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Express Mode
              </button>
            </div>
          </motion.div>

          {/* Campaign Idea Input - Conversation Mode */}
          {mode === 'conversation' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 1.1,
          duration: 0.4
        }} className="mt-6 max-w-3xl mx-auto space-y-4">
              {/* Campaign Settings Panel */}
              <CampaignSettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                selectedSolutionId={selectedSolutionId}
                onSolutionChange={setSelectedSolutionId}
                platformPreferences={platformPreferences}
                onPlatformPreferencesChange={setPlatformPreferences}
              />

              <div className="relative group">
                {/* Gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    {/* Icon with pulse effect */}
                    <div className="flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md animate-pulse" />
                      <div className="relative p-3 rounded-xl bg-primary/10 backdrop-blur-xl">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    {/* Input */}
                    <input type="text" value={campaignIdea} onChange={e => setCampaignIdea(e.target.value)} onKeyDown={handleKeyDown} placeholder="Start a conversation about your campaign idea..." className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
                    
                    {/* Settings Button */}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-2 ${showSettings ? 'text-primary' : 'text-muted-foreground'} hover:bg-white/10`}
                      title="Campaign Settings"
                    >
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>

                    {/* Voice Button */}
                    {hasVoiceSupport && <Button type="button" variant="ghost" size="sm" onClick={toggleVoiceInput} className={`p-2 ${isListening ? 'text-red-500' : 'text-muted-foreground'} hover:bg-white/10`}>
                        <motion.div animate={isListening ? {
                    scale: [1, 1.2, 1]
                  } : {
                    scale: 1
                  }} transition={{
                    duration: 0.5,
                    repeat: isListening ? Infinity : 0
                  }}>
                          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </motion.div>
                      </Button>}
                    
                    {/* Send Button */}
                    <Button onClick={handleSubmit} disabled={!campaignIdea.trim()} size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
                      <Sparkles className="h-5 w-5" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Listening indicator */}
              {isListening && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="text-sm text-muted-foreground text-center mt-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                    Listening... Speak now
                  </span>
                </motion.div>}
              
              {/* Quick prompt suggestions */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className="text-xs text-muted-foreground">Try:</span>
                {['Product Launch', 'Brand Awareness', 'Lead Generation'].map(prompt => <button key={prompt} onClick={() => setCampaignIdea(prompt)} className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all duration-200 hover:scale-105">
                    {prompt}
                  </button>)}
              </div>
            </motion.div>}

          {/* Express Mode Form */}
          {mode === 'express' && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 1.1,
          duration: 0.4
        }} className="mt-6 max-w-3xl mx-auto space-y-4">
              {/* Campaign Settings Panel */}
              <CampaignSettingsPanel
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                selectedSolutionId={selectedSolutionId}
                onSolutionChange={setSelectedSolutionId}
                platformPreferences={platformPreferences}
                onPlatformPreferencesChange={setPlatformPreferences}
              />

              <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl space-y-4">
                {/* Settings Toggle */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <h3 className="text-sm font-medium text-foreground">Express Campaign Setup</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`gap-2 ${showSettings ? 'text-primary' : 'text-muted-foreground'}`}
                    title="Campaign Settings"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {showSettings ? 'Hide' : 'Show'} Settings
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Campaign Idea*</label>
                  <Textarea value={expressData.idea} onChange={e => setExpressData({
                ...expressData,
                idea: e.target.value
              })} placeholder="Describe your campaign idea (100-500 characters)..." className="min-h-[100px] bg-background/50" maxLength={500} />
                  <div className="text-xs text-muted-foreground text-right">
                    {expressData.idea.length}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Audience*</label>
                  <Input value={expressData.audience} onChange={e => setExpressData({
                ...expressData,
                audience: e.target.value
              })} placeholder="e.g., B2B SaaS founders, Enterprise CIOs..." className="bg-background/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Timeline</label>
                    <Select value={expressData.timeline} onValueChange={value => setExpressData({
                  ...expressData,
                  timeline: value
                })}>
                      <SelectTrigger className="bg-background/50">
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Goal</label>
                    <Select value={expressData.goal} onValueChange={value => setExpressData({
                  ...expressData,
                  goal: value
                })}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">Brand Awareness</SelectItem>
                        <SelectItem value="conversion">Lead Generation</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleExpressSubmit} disabled={!expressData.idea.trim() || !expressData.audience.trim()} size="lg" className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 gap-2 shadow-lg">
                  <Sparkles className="h-5 w-5" />
                  Generate Strategies
                </Button>
              </div>
            </motion.div>}
        </div>
      </div>
    </motion.div>;
});
CampaignsHero.displayName = "CampaignsHero";