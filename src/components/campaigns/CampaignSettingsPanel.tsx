import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X } from 'lucide-react';
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
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-4 mb-4 rounded-lg border border-border/50 bg-background/60 backdrop-blur-xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Campaign Settings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Solution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Solution (Optional)
              </label>
              <Select
                value={selectedSolutionId || 'none'}
                onValueChange={(value) => onSolutionChange(value === 'none' ? null : value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background/80">
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
              <p className="text-xs text-muted-foreground">
                Link this campaign to a specific solution from your hub
              </p>
            </div>

            {/* Platform Quantity Selector */}
            <div className="pt-2">
              <PlatformQuantitySelector
                preferences={platformPreferences}
                onChange={onPlatformPreferencesChange}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
