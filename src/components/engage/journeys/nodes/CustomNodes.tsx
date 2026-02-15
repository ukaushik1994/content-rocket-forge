import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Mail, Clock, GitBranch, User, Globe, Flag, Zap } from 'lucide-react';

const baseStyle = 'rounded-xl border border-border/50 bg-card/90 backdrop-blur-md shadow-lg min-w-[160px] transition-all duration-200 hover:shadow-xl hover:border-primary/30';

const NodeWrapper = ({ children, color, selected }: { children: React.ReactNode; color: string; selected?: boolean }) => (
  <div className={`${baseStyle} ${selected ? 'ring-2 ring-primary/50' : ''}`}>
    <div className={`h-1.5 rounded-t-xl ${color}`} />
    <div className="px-3 py-2.5">{children}</div>
  </div>
);

const NodeLabel = ({ icon: Icon, label, summary, iconBg }: { icon: any; label: string; summary?: string; iconBg: string }) => (
  <div className="flex items-center gap-2">
    <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${iconBg}`}>
      <Icon className="h-3.5 w-3.5 text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold text-foreground leading-tight">{label}</p>
      {summary && <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 max-w-[120px] truncate">{summary}</p>}
    </div>
  </div>
);

export const TriggerNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-purple-500" selected={selected}>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <NodeLabel icon={Zap} label="Trigger" summary={(data as any)?.config?.type || 'Manual'} iconBg="bg-purple-500" />
  </NodeWrapper>
));

export const SendEmailNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-blue-500" selected={selected}>
    <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <NodeLabel icon={Mail} label="Send Email" summary={(data as any)?.config?.template_name || 'No template'} iconBg="bg-blue-500" />
  </NodeWrapper>
));

export const WaitNode = memo(({ data, selected }: NodeProps) => {
  const cfg = (data as any)?.config || {};
  const summary = cfg.duration ? `${cfg.duration} ${cfg.unit || 'hours'}` : 'Not set';
  return (
    <NodeWrapper color="bg-amber-500" selected={selected}>
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-2.5 !h-2.5 !border-2 !border-background" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-2.5 !h-2.5 !border-2 !border-background" />
      <NodeLabel icon={Clock} label="Wait" summary={summary} iconBg="bg-amber-500" />
    </NodeWrapper>
  );
});

export const ConditionNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-emerald-500" selected={selected}>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <Handle type="source" position={Position.Bottom} id="yes" className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-background !left-[30%]" />
    <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-400 !w-2.5 !h-2.5 !border-2 !border-background !left-[70%]" />
    <NodeLabel icon={GitBranch} label="Condition" summary={(data as any)?.config?.field || 'No condition'} iconBg="bg-emerald-500" />
    <div className="flex justify-between mt-1.5 px-1">
      <span className="text-[9px] text-emerald-400 font-medium">Yes</span>
      <span className="text-[9px] text-red-400 font-medium">No</span>
    </div>
  </NodeWrapper>
));

export const UpdateContactNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-indigo-500" selected={selected}>
    <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <NodeLabel icon={User} label="Update Contact" summary={(data as any)?.config?.action || 'Add tag'} iconBg="bg-indigo-500" />
  </NodeWrapper>
));

export const WebhookNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-pink-500" selected={selected}>
    <Handle type="target" position={Position.Top} className="!bg-pink-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <NodeLabel icon={Globe} label="Webhook" summary={(data as any)?.config?.url ? new URL((data as any).config.url).hostname : 'Not set'} iconBg="bg-pink-500" />
  </NodeWrapper>
));

export const EndNode = memo(({ data, selected }: NodeProps) => (
  <NodeWrapper color="bg-gray-500" selected={selected}>
    <Handle type="target" position={Position.Top} className="!bg-gray-500 !w-2.5 !h-2.5 !border-2 !border-background" />
    <NodeLabel icon={Flag} label="End" iconBg="bg-gray-500" />
  </NodeWrapper>
));

export const customNodeTypes = {
  trigger: TriggerNode,
  send_email: SendEmailNode,
  wait: WaitNode,
  condition: ConditionNode,
  update_contact: UpdateContactNode,
  webhook: WebhookNode,
  end: EndNode,
};
