import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { Save, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const EmailProviderSettings = () => {
  const { currentWorkspaceId, canManage } = useWorkspace();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ from_name: '', from_email: '', reply_to: '' });

  const { data: settings } = useQuery({
    queryKey: ['email-provider-settings', currentWorkspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_provider_settings')
        .select('*')
        .eq('workspace_id', currentWorkspaceId!)
        .single();
      return data;
    },
    enabled: !!currentWorkspaceId,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        from_name: settings.from_name || '',
        from_email: settings.from_email || '',
        reply_to: settings.reply_to || '',
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      const payload = {
        workspace_id: currentWorkspaceId!,
        provider: 'resend',
        config: {},
        from_name: form.from_name,
        from_email: form.from_email,
        reply_to: form.reply_to,
      };
      if (settings) {
        const { error } = await supabase.from('email_provider_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_provider_settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-provider-settings'] });
      toast.success('Settings saved');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {/* API Key Note */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">API Key Configuration</p>
                <p className="text-xs text-muted-foreground">Manage your Resend API key in Engage Settings</p>
              </div>
            </div>
            <Link to="/engage/settings">
              <Button variant="outline" size="sm" className="gap-1">
                Go to Settings <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      {/* Sender Config */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Sender Configuration</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">From Name</Label><Input className="h-9 mt-1" value={form.from_name} onChange={e => setForm(f => ({ ...f, from_name: e.target.value }))} disabled={!canManage} /></div>
              <div><Label className="text-xs">From Email</Label><Input className="h-9 mt-1" value={form.from_email} onChange={e => setForm(f => ({ ...f, from_email: e.target.value }))} disabled={!canManage} /></div>
            </div>
            <div><Label className="text-xs">Reply To</Label><Input className="h-9 mt-1" value={form.reply_to} onChange={e => setForm(f => ({ ...f, reply_to: e.target.value }))} disabled={!canManage} /></div>
            {canManage && (
              <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending} size="sm">
                <Save className="h-3.5 w-3.5 mr-1" /> Save Settings
              </Button>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};