import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Mail, Clock, GitBranch, User, Globe, Zap, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RuleBuilder, type Rule } from '@/components/engage/shared/RuleBuilder';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Node } from '@xyflow/react';

interface JourneyInspectorProps {
  node: Node | null;
  workspaceId: string | null;
  onUpdate: (nodeId: string, config: Record<string, any>) => void;
  onClose: () => void;
}

const nodeIcons: Record<string, any> = {
  trigger: Zap, send_email: Mail, wait: Clock, condition: GitBranch,
  update_contact: User, webhook: Globe, end: Flag,
};

const nodeColors: Record<string, string> = {
  trigger: 'bg-purple-500', send_email: 'bg-blue-500', wait: 'bg-amber-500',
  condition: 'bg-emerald-500', update_contact: 'bg-indigo-500', webhook: 'bg-pink-500', end: 'bg-gray-500',
};

export const JourneyInspector = ({ node, workspaceId, onUpdate, onClose }: JourneyInspectorProps) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const nodeType = node?.type || '';

  useEffect(() => {
    if (node) setConfig((node.data as any)?.config || {});
  }, [node?.id]);

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates-inspector', workspaceId],
    queryFn: async () => {
      const { data } = await supabase.from('email_templates').select('id, name').eq('workspace_id', workspaceId!);
      return data || [];
    },
    enabled: !!workspaceId && nodeType === 'send_email',
  });

  const handleSave = () => {
    if (node) onUpdate(node.id, config);
  };

  const Icon = nodeIcons[nodeType] || Zap;
  const colorClass = nodeColors[nodeType] || 'bg-muted';

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 right-0 h-full w-80 border-l border-border/50 bg-card/95 backdrop-blur-xl z-20 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground capitalize">{nodeType.replace('_', ' ')}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {nodeType === 'trigger' && (
              <div>
                <Label className="text-xs">Trigger Type</Label>
                <Select value={config.type || 'manual'} onValueChange={v => setConfig(c => ({ ...c, type: v }))}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="segment_entry">Segment Entry</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
                {config.type === 'event' && (
                  <div className="mt-2">
                    <Label className="text-xs">Event Name</Label>
                    <Input className="h-8 text-xs mt-1" value={config.event_name || ''} onChange={e => setConfig(c => ({ ...c, event_name: e.target.value }))} placeholder="e.g. purchase_completed" />
                  </div>
                )}
              </div>
            )}

            {nodeType === 'send_email' && (
              <div>
                <Label className="text-xs">Email Template</Label>
                <Select value={config.template_id || ''} onValueChange={v => {
                  const t = templates.find((t: any) => t.id === v);
                  setConfig(c => ({ ...c, template_id: v, template_name: t?.name || '' }));
                }}>
                  <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>
                    {templates.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {nodeType === 'wait' && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Duration</Label>
                  <Input type="number" className="h-8 text-xs mt-1" value={config.duration || ''} onChange={e => setConfig(c => ({ ...c, duration: Number(e.target.value) }))} />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Unit</Label>
                  <Select value={config.unit || 'hours'} onValueChange={v => setConfig(c => ({ ...c, unit: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {nodeType === 'condition' && (
              <div>
                <Label className="text-xs mb-1 block">Condition Rules</Label>
                <RuleBuilder
                  rules={config.rules || []}
                  onChange={rules => setConfig(c => ({ ...c, rules }))}
                />
              </div>
            )}

            {nodeType === 'update_contact' && (
              <>
                <div>
                  <Label className="text-xs">Action</Label>
                  <Select value={config.action || 'add_tag'} onValueChange={v => setConfig(c => ({ ...c, action: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add_tag">Add Tag</SelectItem>
                      <SelectItem value="remove_tag">Remove Tag</SelectItem>
                      <SelectItem value="set_attribute">Set Attribute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{config.action === 'set_attribute' ? 'Key=Value' : 'Tag'}</Label>
                  <Input className="h-8 text-xs mt-1" value={config.tag || ''} onChange={e => setConfig(c => ({ ...c, tag: e.target.value }))} placeholder={config.action === 'set_attribute' ? 'key=value' : 'tag-name'} />
                </div>
              </>
            )}

            {nodeType === 'webhook' && (
              <>
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input className="h-8 text-xs mt-1" value={config.url || ''} onChange={e => setConfig(c => ({ ...c, url: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-xs">Method</Label>
                  <Select value={config.method || 'POST'} onValueChange={v => setConfig(c => ({ ...c, method: v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {nodeType === 'end' && (
              <p className="text-xs text-muted-foreground">This node marks the end of a journey branch. No configuration needed.</p>
            )}
          </div>

          {/* Footer */}
          {nodeType !== 'end' && (
            <div className="p-4 border-t border-border/50">
              <Button size="sm" className="w-full" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save Config
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
