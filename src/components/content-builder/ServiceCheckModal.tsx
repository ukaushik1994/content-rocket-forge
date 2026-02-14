import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Settings, Sparkles, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { useSerpServiceStatus } from '@/hooks/useSerpServiceStatus';
import { useNavigate } from 'react-router-dom';

const SESSION_KEY = 'contentBuilderServiceCheckDismissed';

export const ServiceCheckModal: React.FC = () => {
  const navigate = useNavigate();
  const ai = useAIServiceStatus();
  const serp = useSerpServiceStatus();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');

  const isLoading = ai.isLoading || serp.isLoading;
  const hasSerpProvider = serp.hasProviders;
  const hasAiProvider = ai.hasProviders;
  const allGood = hasSerpProvider && hasAiProvider;

  // Auto-close when both services are configured
  useEffect(() => {
    if (allGood) setDismissed(true);
  }, [allGood]);

  const isOpen = !isLoading && !allGood && !dismissed;

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setDismissed(true);
  };

  const handleGoToSettings = () => {
    handleDismiss();
    navigate('/settings');
  };

  const services = [
    {
      label: 'Web Search API',
      description: 'SerpAPI or Serpstack',
      icon: Search,
      ok: hasSerpProvider,
    },
    {
      label: 'AI Provider',
      description: 'OpenRouter, OpenAI, Anthropic, etc.',
      icon: Sparkles,
      ok: hasAiProvider,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">Services Required</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Some services need to be configured for full functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {services.map((svc) => (
            <motion.div
              key={svc.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/40"
            >
              <div className={`p-2 rounded-lg ${svc.ok ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <svc.icon className={`h-4 w-4 ${svc.ok ? 'text-green-500' : 'text-destructive'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{svc.label}</p>
                <p className="text-xs text-muted-foreground">{svc.description}</p>
              </div>
              {svc.ok ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleDismiss} className="bg-background/60 border-border/50">
            Dismiss
          </Button>
          <Button onClick={handleGoToSettings} className="gap-2">
            <Settings className="h-4 w-4" />
            Go to Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
