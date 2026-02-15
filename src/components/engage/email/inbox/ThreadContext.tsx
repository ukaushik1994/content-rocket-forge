import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Tag, GitBranch, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ThreadContextProps {
  thread: any;
}

export const ThreadContext: React.FC<ThreadContextProps> = ({ thread }) => {
  const contact = thread.engage_contacts;

  const { data: journeyEnrollments = [] } = useQuery({
    queryKey: ['contact-journeys', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_enrollments')
        .select('*, journeys(name, status)')
        .eq('contact_id', contact.id)
        .order('enrolled_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  const { data: recentEmails = [] } = useQuery({
    queryKey: ['contact-recent-emails', contact?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('email_messages')
        .select('id, subject, status, sent_at')
        .eq('contact_id', contact.id)
        .order('queued_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!contact?.id,
  });

  if (!contact) {
    return <div className="p-4 text-sm text-muted-foreground">No contact linked</div>;
  }

  const contactName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown';

  return (
    <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
      {/* Contact Card */}
      <GlassCard className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{contactName}</p>
            <p className="text-[10px] text-muted-foreground">{contact.email}</p>
          </div>
        </div>
        {thread.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {thread.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-[10px] h-5">{tag}</Badge>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Thread Info */}
      <GlassCard className="p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> Thread Info
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="text-[10px] h-4">{thread.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">{format(new Date(thread.created_at), 'MMM d, yyyy')}</span>
          </div>
          {thread.sentiment && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sentiment</span>
              <span className="text-foreground">{thread.sentiment}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Active Journeys */}
      <GlassCard className="p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <GitBranch className="h-3 w-3" /> Journeys
        </h4>
        {journeyEnrollments.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">No active journeys</p>
        ) : (
          <div className="space-y-1">
            {journeyEnrollments.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between">
                <span className="text-xs text-foreground truncate">{e.journeys?.name || 'Unknown'}</span>
                <Badge variant="secondary" className="text-[9px] h-4">{e.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Recent Emails */}
      <GlassCard className="p-3 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Mail className="h-3 w-3" /> Recent Emails
        </h4>
        {recentEmails.length === 0 ? (
          <p className="text-[10px] text-muted-foreground">No emails yet</p>
        ) : (
          <div className="space-y-1">
            {recentEmails.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between">
                <span className="text-xs text-foreground truncate max-w-[120px]">{e.subject || '(no subject)'}</span>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[9px] h-4">{e.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
