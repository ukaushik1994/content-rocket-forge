import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, Users, Sparkles, Plus, X, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useOnboarding } from './OnboardingContext';
import { processOnboardingSetup, type OnboardingSetupData } from '@/services/onboardingIntelService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SolutionEntry {
  id: string;
  name: string;
  description: string;
}

interface CompetitorEntry {
  id: string;
  url: string;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const BusinessSetupForm: React.FC = () => {
  const { endOnboarding } = useOnboarding();
  const { toast } = useToast();
  
  const [companyUrl, setCompanyUrl] = useState('');
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([
    { id: generateId(), url: '' }
  ]);
  const [solutions, setSolutions] = useState<SolutionEntry[]>([
    { id: generateId(), name: '', description: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      // Allow URLs without protocol
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!companyUrl.trim()) {
      newErrors.companyUrl = 'Company URL is required';
    } else if (!validateUrl(companyUrl)) {
      newErrors.companyUrl = 'Please enter a valid URL';
    }
    
    const validCompetitors = competitors.filter(c => c.url.trim());
    if (validCompetitors.length === 0) {
      newErrors.competitors = 'At least one competitor URL is required';
    } else {
      validCompetitors.forEach((c, i) => {
        if (!validateUrl(c.url)) {
          newErrors[`competitor_${c.id}`] = 'Invalid URL';
        }
      });
    }
    
    const validSolutions = solutions.filter(s => s.name.trim());
    if (validSolutions.length === 0) {
      newErrors.solutions = 'At least one solution name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, { id: generateId(), url: '' }]);
    }
  };

  const removeCompetitor = (id: string) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter(c => c.id !== id));
    }
  };

  const updateCompetitor = (id: string, url: string) => {
    setCompetitors(competitors.map(c => c.id === id ? { ...c, url } : c));
    // Clear error on change
    if (errors[`competitor_${id}`]) {
      setErrors(prev => {
        const { [`competitor_${id}`]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const addSolution = () => {
    if (solutions.length < 3) {
      setSolutions([...solutions, { id: generateId(), name: '', description: '' }]);
    }
  };

  const removeSolution = (id: string) => {
    if (solutions.length > 1) {
      setSolutions(solutions.filter(s => s.id !== id));
    }
  };

  const updateSolution = (id: string, field: 'name' | 'description', value: string) => {
    setSolutions(solutions.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const setupData: OnboardingSetupData = {
        companyUrl: companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`,
        competitors: competitors
          .filter(c => c.url.trim())
          .map(c => c.url.startsWith('http') ? c.url : `https://${c.url}`),
        solutions: solutions
          .filter(s => s.name.trim())
          .map(s => ({ name: s.name, description: s.description }))
      };

      // Save to database
      const { error } = await supabase.from('onboarding_setup').upsert([{
        user_id: user.id,
        company_url: setupData.companyUrl,
        setup_data: JSON.parse(JSON.stringify(setupData)),
        intel_status: 'processing'
      }]);
      
      if (error) throw error;

      // Close modal immediately
      endOnboarding();
      
      // Show processing toast
      toast({
        title: "Setting up your workspace...",
        description: "We're analyzing your business in the background.",
      });

      // Trigger background intel gathering (non-blocking)
      processOnboardingSetup(user.id, setupData);
      
    } catch (error) {
      console.error('Setup submission error:', error);
      toast({
        title: "Setup Error",
        description: "Failed to save setup data. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('onboarding_setup').upsert([{
          user_id: user.id,
          intel_status: 'skipped',
          completed_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Skip error:', error);
    }
    endOnboarding();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Let's Set Up Your Business</h2>
            <p className="text-sm text-white/50">We'll use this to personalize your experience</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Company URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Globe className="w-4 h-4 text-neon-purple" />
              Your Company Website
            </label>
            <Input
              placeholder="yourcompany.com"
              value={companyUrl}
              onChange={(e) => {
                setCompanyUrl(e.target.value);
                if (errors.companyUrl) {
                  setErrors(prev => ({ ...prev, companyUrl: '' }));
                }
              }}
              className={cn(
                "bg-slate-900/50 border-white/10 text-white placeholder:text-white/30 h-11",
                "focus:border-neon-purple/50 focus:ring-neon-purple/20",
                errors.companyUrl && "border-red-500/50"
              )}
            />
            {errors.companyUrl && (
              <p className="text-xs text-red-400">{errors.companyUrl}</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Competitors */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Users className="w-4 h-4 text-neon-blue" />
              Your Main Competitors
            </label>
            
            <AnimatePresence mode="popLayout">
              {competitors.map((competitor, index) => (
                <motion.div
                  key={competitor.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder={`competitor${index + 1}.com`}
                    value={competitor.url}
                    onChange={(e) => updateCompetitor(competitor.id, e.target.value)}
                    className={cn(
                      "flex-1 bg-slate-900/50 border-white/10 text-white placeholder:text-white/30 h-11",
                      "focus:border-neon-blue/50 focus:ring-neon-blue/20",
                      errors[`competitor_${competitor.id}`] && "border-red-500/50"
                    )}
                  />
                  {competitors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(competitor.id)}
                      className="h-11 w-11 text-white/40 hover:text-white/80 hover:bg-white/5"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {errors.competitors && (
              <p className="text-xs text-red-400">{errors.competitors}</p>
            )}
            
            {competitors.length < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addCompetitor}
                className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Competitor
              </Button>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Solutions */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Your Products / Solutions
            </label>
            
            <AnimatePresence mode="popLayout">
              {solutions.map((solution, index) => (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 p-4 rounded-xl bg-slate-900/30 border border-white/5"
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Solution name"
                      value={solution.name}
                      onChange={(e) => updateSolution(solution.id, 'name', e.target.value)}
                      className={cn(
                        "flex-1 bg-slate-900/50 border-white/10 text-white placeholder:text-white/30 h-10",
                        "focus:border-amber-500/50 focus:ring-amber-500/20"
                      )}
                    />
                    {solutions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSolution(solution.id)}
                        className="h-10 w-10 text-white/40 hover:text-white/80 hover:bg-white/5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Brief description (1-2 sentences)"
                    value={solution.description}
                    onChange={(e) => updateSolution(solution.id, 'description', e.target.value)}
                    rows={2}
                    className={cn(
                      "bg-slate-900/50 border-white/10 text-white placeholder:text-white/30 resize-none",
                      "focus:border-amber-500/50 focus:ring-amber-500/20"
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {errors.solutions && (
              <p className="text-xs text-red-400">{errors.solutions}</p>
            )}
            
            {solutions.length < 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addSolution}
                className="text-amber-400 hover:text-amber-400 hover:bg-amber-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Solution
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 px-8 py-5 border-t border-white/5 bg-slate-900/50">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-white/50 hover:text-white/80"
          >
            Skip for Now
          </Button>
          
          <motion.button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              "relative px-8 py-3 rounded-xl text-white text-sm font-semibold overflow-hidden",
              "bg-gradient-to-r from-neon-purple via-neon-blue to-neon-purple",
              "bg-[length:200%_100%] hover:bg-right transition-all duration-500",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            whileHover={!isSubmitting ? { scale: 1.03 } : {}}
            whileTap={!isSubmitting ? { scale: 0.97 } : {}}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting Up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
