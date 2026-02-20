import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Solution {
  id: string;
  name: string;
  category: string;
  logoUrl?: string;
}

interface ProposalSolutionStepProps {
  onSelect: (solutionIds: string[]) => void;
  isGenerating: boolean;
}

export const ProposalSolutionStep: React.FC<ProposalSolutionStepProps> = ({
  onSelect,
  isGenerating
}) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('solutions')
          .select('id, name, category, logo_url')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setSolutions((data || []).map(s => ({
          id: s.id,
          name: s.name,
          category: s.category || 'Solution',
          logoUrl: s.logo_url
        })));
      } catch (err) {
        console.error('Error fetching solutions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSolutions();
  }, []);

  const toggleSolution = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getInitials = (name: string) =>
    name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-sm text-muted-foreground">No solutions found.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Add solutions in your Offerings page first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3">
        <h3 className="text-sm font-medium text-foreground">Select Solutions</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Pick which solutions to generate AI proposals for
        </p>
      </div>

      <ScrollArea className="flex-1 px-5">
        <TooltipProvider>
          <div className="grid grid-cols-3 gap-4 py-4">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className="flex flex-col items-center gap-2"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative cursor-pointer transition-all duration-300 rounded-full ${
                        selectedIds.includes(solution.id)
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/30'
                          : 'hover:ring-2 hover:ring-primary/40'
                      }`}
                      onClick={() => toggleSolution(solution.id)}
                    >
                      <Avatar className="h-16 w-16 border-2 border-border/50">
                        {solution.logoUrl ? (
                          <AvatarImage src={solution.logoUrl} alt={solution.name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold text-sm">
                            {getInitials(solution.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <AnimatePresence>
                        {selectedIds.includes(solution.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center border-2 border-background"
                          >
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs font-medium">{solution.name}</p>
                    <p className="text-xs text-muted-foreground">{solution.category}</p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground text-center line-clamp-1 max-w-[80px]">
                  {solution.name}
                </span>
              </motion.div>
            ))}
          </div>
        </TooltipProvider>
      </ScrollArea>

      <div className="flex-shrink-0 px-5 py-4 border-t border-border/20">
        <Button
          onClick={() => onSelect(selectedIds)}
          disabled={selectedIds.length === 0 || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Proposals...
            </>
          ) : (
            `Generate Proposals${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`
          )}
        </Button>
      </div>
    </div>
  );
};
