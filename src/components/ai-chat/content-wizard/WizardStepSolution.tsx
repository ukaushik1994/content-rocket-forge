import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface WizardStepSolutionProps {
  selectedSolution: EnhancedSolution | null;
  onSelect: (solution: EnhancedSolution) => void;
  preSelectedId?: string | null;
}

export const WizardStepSolution: React.FC<WizardStepSolutionProps> = ({
  selectedSolution,
  onSelect,
  preSelectedId,
}) => {
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('solutions').select('*');
        if (error) throw error;
        const formatted: EnhancedSolution[] = (data || []).map(s => ({
          id: s.id,
          name: s.name,
          features: Array.isArray(s.features) ? s.features.map(String) : [],
          useCases: Array.isArray(s.use_cases) ? s.use_cases.map(String) : [],
          painPoints: Array.isArray(s.pain_points) ? s.pain_points.map(String) : [],
          targetAudience: Array.isArray(s.target_audience) ? s.target_audience.map(String) : [],
          description: `${s.name} - Business Solution`,
          category: s.category || 'Business Solution',
          logoUrl: s.logo_url,
          externalUrl: s.external_url,
          resources: [],
        }));
        setSolutions(formatted);
        if (preSelectedId && !selectedSolution) {
          const match = formatted.find(s => s.id === preSelectedId);
          if (match) onSelect(match);
        }
      } catch { setSolutions([]); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, []);

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!solutions.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">No solutions found</p>
        <p className="text-xs text-muted-foreground mt-1">Add offerings in the Offerings module first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Choose Your Solution</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Select the solution to create content for</p>
      </div>
      <TooltipProvider>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
          {solutions.map(solution => (
            <motion.div key={solution.id} whileHover={{ scale: 1.08 }} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => onSelect(solution)}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className={`h-14 w-14 border-2 transition-colors ${selectedSolution?.id === solution.id ? 'border-primary ring-2 ring-primary/30' : 'border-border/30 hover:border-primary/40'}`}>
                      {solution.logoUrl ? <AvatarImage src={solution.logoUrl} alt={solution.name} className="object-cover" /> : (
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold text-sm">{getInitials(solution.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    {selectedSolution?.id === solution.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium text-sm">{solution.name}</p>
                  {solution.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {solution.features.slice(0, 3).map((f, i) => <Badge key={i} variant="secondary" className="text-[10px]">{f}</Badge>)}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
              <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[60px] truncate">{solution.name}</span>
            </motion.div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};
