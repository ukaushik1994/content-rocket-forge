import { CampaignStrategy } from '@/types/campaign-types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CalendarDays, FileEdit, Download, FileText, Mail } from 'lucide-react';

interface OptionalAddonsTileProps {
  strategy: CampaignStrategy;
  onAddonClick?: (addon: string) => void;
}

export const OptionalAddonsTile = ({ strategy, onAddonClick }: OptionalAddonsTileProps) => {
  const optionalAddons = strategy.optionalAddons;

  if (!optionalAddons) {
    return (
      <GlassCard 
        className="p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20"
      >
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-indigo-400" />
          <h3 className="text-lg font-semibold">Optional Add-ons</h3>
          <Badge variant="outline" className="ml-2">Expand Your Campaign</Badge>
        </div>
        <div className="text-center py-4 text-muted-foreground">
          <p>Add-ons will be available soon...</p>
        </div>
      </GlassCard>
    );
  }

  const addons = [
    {
      key: 'contentCalendar',
      icon: CalendarDays,
      title: 'Generate Content Calendar',
      description: 'Auto-schedule all content pieces',
      color: 'indigo',
    },
    {
      key: 'draftCopies',
      icon: FileEdit,
      title: 'Create Draft Copies',
      description: 'AI-written first drafts for all formats',
      color: 'purple',
    },
    {
      key: 'fullSeoBriefs',
      icon: FileText,
      title: 'Full SEO Briefs',
      description: 'Detailed content briefs with keywords',
      color: 'green',
    },
    {
      key: 'landingPageCopy',
      icon: FileText,
      title: 'Landing Page Copy',
      description: 'Complete landing page content',
      color: 'blue',
    },
    {
      key: 'emailSequences',
      icon: Mail,
      title: 'Email Sequences',
      description: 'Automated email campaign drafts',
      color: 'pink',
    },
    {
      key: 'export',
      icon: Download,
      title: 'Export Options',
      description: optionalAddons.exportOptions?.join(', ') || 'PDF, Notion, Google Docs',
      color: 'amber',
    },
  ];

  return (
    <GlassCard 
      className="p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <Plus className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold">Optional Add-ons</h3>
        <Badge variant="outline" className="ml-2">Expand Your Campaign</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {addons.map((addon) => {
          const Icon = addon.icon;
          const isEnabled = optionalAddons[addon.key as keyof typeof optionalAddons];
          
          return (
            <Button
              key={addon.key}
              variant="outline"
              className="h-auto p-3 justify-start text-left bg-background/40 hover:border-indigo-400/50 transition-all"
              onClick={() => onAddonClick?.(addon.key)}
              disabled={!isEnabled && addon.key !== 'export'}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 text-${addon.color}-400 shrink-0`} />
                <div>
                  <p className="font-medium text-sm">{addon.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </GlassCard>
  );
};
