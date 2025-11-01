import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSolution } from '@/contexts/content-builder/types';

interface SolutionSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedSolutionIds: string[]) => void;
  isGenerating?: boolean;
}

export const SolutionSelectionModal = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  isGenerating = false 
}: SolutionSelectionModalProps) => {
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSolutions();
    }
  }, [open]);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      if (data) {
        const formattedSolutions: EnhancedSolution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) ? solution.features.map(f => String(f)) : [],
          useCases: Array.isArray(solution.use_cases) ? solution.use_cases.map(u => String(u)) : [],
          painPoints: Array.isArray(solution.pain_points) ? solution.pain_points.map(p => String(p)) : [],
          targetAudience: Array.isArray(solution.target_audience) ? solution.target_audience.map(t => String(t)) : [],
          description: `${solution.name} - Business Solution`,
          category: solution.category || "Business Solution",
          logoUrl: solution.logo_url,
          externalUrl: solution.external_url,
          resources: []
        }));
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSolution = (solutionId: string) => {
    setSelectedIds(prev => 
      prev.includes(solutionId) 
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    );
  };

  const handleConfirm = () => {
    if (selectedIds.length > 0) {
      onConfirm(selectedIds);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <GlassCard className="border-0 shadow-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Select Solutions
            </DialogTitle>
          </DialogHeader>

          <div className="py-8 px-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : solutions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No solutions found</p>
                <p className="text-xs text-muted-foreground/70 mt-2">Add solutions to generate proposals</p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="w-full overflow-x-auto">
                  <div className="flex flex-nowrap gap-6 pb-2 px-1">
                    {solutions.map((solution, index) => (
                      <motion.div
                        key={solution.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.08 }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative cursor-pointer transition-all duration-300 rounded-full flex-shrink-0 ${
                                selectedIds.includes(solution.id)
                                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/50'
                                  : 'hover:ring-2 hover:ring-primary/50 hover:shadow-md'
                              }`}
                              onClick={() => toggleSolution(solution.id)}
                            >
                              <Avatar className="h-20 w-20 rounded-full border-2 border-border/50 transition-all duration-300">
                                {solution.logoUrl ? (
                                  <AvatarImage 
                                    src={solution.logoUrl} 
                                    alt={solution.name}
                                    className="object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground font-semibold text-lg">
                                    {getInitials(solution.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              
                              <AnimatePresence>
                                {selectedIds.includes(solution.id) && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 180 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className="absolute -top-1 -right-1 h-7 w-7 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-md"
                                  >
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="bottom"
                            className="bg-popover/95 backdrop-blur-sm border border-border shadow-lg"
                          >
                            <div className="text-center max-w-48">
                              <p className="font-medium text-foreground">{solution.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{solution.category}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TooltipProvider>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-border/50 pt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0 || isGenerating}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`
              )}
            </Button>
          </DialogFooter>
        </GlassCard>
      </DialogContent>
    </Dialog>
  );
};
