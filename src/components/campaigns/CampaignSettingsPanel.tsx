import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mb-3"
        >
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/20 backdrop-blur-sm">
            {/* Solution Selector */}
            <div className="flex-shrink-0">
              <Select
                value={selectedSolutionId || 'none'}
                onValueChange={(value) => onSolutionChange(value === 'none' ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-[180px] text-sm border-none bg-transparent">
                  <SelectValue placeholder="Select solution" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                  <SelectItem value="none">No solution</SelectItem>
                  {solutions.map((solution) => (
                    <SelectItem key={solution.id} value={solution.id}>
                      <div className="flex items-center gap-2">
                        {solution.logoUrl && (
                          <img 
                            src={solution.logoUrl} 
                            alt={solution.name}
                            className="h-3.5 w-3.5 rounded object-cover"
                          />
                        )}
                        <span className="text-sm">{solution.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-border/30" />

            {/* Platform Chips */}
            <div className="flex-1 min-w-0">
              <PlatformQuantitySelector
                preferences={platformPreferences}
                onChange={onPlatformPreferencesChange}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-muted-foreground/60 hover:text-muted-foreground text-xs px-2 py-1 rounded hover:bg-muted/30 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
