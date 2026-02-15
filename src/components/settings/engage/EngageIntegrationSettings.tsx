import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ArrowRight, Mail, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const EngageIntegrationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: membership } = useQuery({
    queryKey: ['user-workspace-membership', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('workspace_id, role').eq('user_id', user!.id).limit(1).single();
      return data;
    },
    enabled: !!user,
  });

  const workspaceId = membership?.workspace_id;

  const { data: resendKeyConfigured } = useQuery({
    queryKey: ['resend-key-status', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_keys_metadata')
        .select('is_active')
        .eq('user_id', user!.id)
        .eq('service', 'resend')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const { data: emailSettings } = useQuery({
    queryKey: ['email-provider-settings-global', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_provider_settings').select('from_email').eq('workspace_id', workspaceId!).single();
      return data;
    },
    enabled: !!workspaceId,
  });

  const senderConfigured = !!emailSettings?.from_email;

  if (!workspaceId) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No workspace found. Visit Engage to auto-create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Connection Status</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${resendKeyConfigured ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {resendKeyConfigured ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Resend API Key</p>
                <p className="text-[10px] text-muted-foreground">{resendKeyConfigured ? 'Configured' : 'Not configured'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border/30">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${senderConfigured ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                {senderConfigured ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Sender Details</p>
                <p className="text-[10px] text-muted-foreground">{senderConfigured ? 'Set' : 'Missing'}</p>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate('/engage/settings')}>
            Go to Engage Settings <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
};