import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Layers, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlatformQuantitySelector } from './PlatformQuantitySelector';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { solutionService } from '@/services/solutionService';

interface CampaignSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSolutionId: string | null;
  onSolutionChange: (solutionId: string | null) => void;
  platformPreferences: Record<string, number>;
  onPlatformPreferencesChange: (preferences: Record<string, number>) => void;
}

export function CampaignSettingsPanel({
  isOpen,
  onClose,
  selectedSolutionId,
  onSolutionChange,
  platformPreferences,
  onPlatformPreferencesChange,
}: CampaignSettingsPanelProps) {
  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => solutionService.getAllSolutions(),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden mb-4"
        >
          <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5 overflow-hidden">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative space-y-6 p-6">
              {/* Premium Header */}
              <div className="flex items-center justify-between p-4 -mx-6 -mt-6 mb-2 bg-gradient-to-r from-primary/10 via-background/50 to-background/50 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 ring-1 ring-primary/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Package className="h-5 w-5 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Campaign Settings
                    </h3>
                    <p className="text-xs text-muted-foreground">Customize your campaign parameters</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-background/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Solution Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <label className="text-sm font-semibold text-foreground">
                    Link to Solution
                  </label>
                </div>
                <Select
                  value={selectedSolutionId || 'none'}
                  onValueChange={(value) => onSolutionChange(value === 'none' ? null : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full bg-background/80 border-border/50 hover:border-primary/30 focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="No specific solution" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                    <SelectItem value="none">No specific solution</SelectItem>
                    {solutions.map((solution) => (
                      <SelectItem key={solution.id} value={solution.id}>
                        <div className="flex items-center gap-2">
                          {solution.logoUrl && (
                            <img 
                              src={solution.logoUrl} 
                              alt={solution.name}
                              className="h-4 w-4 rounded object-cover"
                            />
                          )}
                          <span>{solution.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Link this campaign to a solution from your hub
                </div>
              </div>

              {/* Gradient separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

              {/* Platform Quantity Selector */}
              <div>
                <PlatformQuantitySelector
                  preferences={platformPreferences}
                  onChange={onPlatformPreferencesChange}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
