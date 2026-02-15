import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const loadSeedData = async (workspaceId: string, userId: string) => {
  try {
    // 1. Create 10 contacts
    const contacts = [
      { email: 'alice@example.com', first_name: 'Alice', last_name: 'Johnson', tags: ['lead', 'newsletter'], attributes: { plan: 'pro', source: 'website' } },
      { email: 'bob@example.com', first_name: 'Bob', last_name: 'Smith', tags: ['customer', 'newsletter'], attributes: { plan: 'free', source: 'referral' } },
      { email: 'carol@example.com', first_name: 'Carol', last_name: 'Williams', tags: ['lead'], attributes: { plan: 'trial', source: 'ads' } },
      { email: 'dave@example.com', first_name: 'Dave', last_name: 'Brown', tags: ['customer', 'vip'], attributes: { plan: 'enterprise', source: 'sales' } },
      { email: 'eve@example.com', first_name: 'Eve', last_name: 'Davis', tags: ['newsletter'], attributes: { plan: 'free', source: 'organic' } },
      { email: 'frank@example.com', first_name: 'Frank', last_name: 'Miller', tags: ['lead', 'webinar'], attributes: { plan: 'trial', source: 'webinar' } },
      { email: 'grace@example.com', first_name: 'Grace', last_name: 'Wilson', tags: ['customer'], attributes: { plan: 'pro', source: 'website' } },
      { email: 'henry@example.com', first_name: 'Henry', last_name: 'Moore', tags: ['lead', 'newsletter'], attributes: { plan: 'free', source: 'social' } },
      { email: 'iris@example.com', first_name: 'Iris', last_name: 'Taylor', tags: ['customer', 'newsletter', 'vip'], attributes: { plan: 'enterprise', source: 'partner' } },
      { email: 'jack@example.com', first_name: 'Jack', last_name: 'Anderson', tags: ['lead'], attributes: { plan: 'trial', source: 'ads' } },
    ].map(c => ({ ...c, workspace_id: workspaceId }));

    const { data: insertedContacts, error: cErr } = await supabase
      .from('engage_contacts')
      .insert(contacts)
      .select('id');
    if (cErr) throw cErr;

    // 2. Create 2 segments
    const segments = [
      { workspace_id: workspaceId, name: 'Active Users', description: 'Users with active plans', definition: { match: 'all', rules: [{ field: 'plan', operator: 'not_equals', value: 'free' }] } },
      { workspace_id: workspaceId, name: 'Newsletter Subscribers', description: 'Contacts tagged with newsletter', definition: { match: 'all', rules: [{ field: 'tags', operator: 'includes', value: 'newsletter' }] } },
    ];
    const { error: sErr } = await supabase.from('engage_segments').insert(segments);
    if (sErr) throw sErr;

    // 3. Create 2 email templates
    const templates = [
      {
        workspace_id: workspaceId,
        name: 'Welcome Email',
        subject: 'Welcome {{first_name}}!',
        body_html: '<h1>Welcome {{first_name}}!</h1><p>Thanks for joining us. We\'re excited to have you on board.</p><p>Best,<br/>The Team</p>',
        body_text: 'Welcome {{first_name}}! Thanks for joining us.',
        variables: ['first_name'],
        created_by: userId,
      },
      {
        workspace_id: workspaceId,
        name: 'Follow-up',
        subject: 'How\'s it going, {{first_name}}?',
        body_html: '<h1>Hi {{first_name}}</h1><p>Just checking in! Have you had a chance to explore all our features?</p><p>Let us know if you need help.</p>',
        body_text: 'Hi {{first_name}}, just checking in!',
        variables: ['first_name'],
        created_by: userId,
      },
    ];
    const { data: insertedTemplates, error: tErr } = await supabase.from('email_templates').insert(templates).select('id');
    if (tErr) throw tErr;

    // 4. Create 1 sample journey
    const { data: journey, error: jErr } = await supabase.from('journeys').insert({
      workspace_id: workspaceId,
      name: 'Welcome Journey',
      status: 'draft',
      trigger_config: { type: 'segment_entry', segment: 'Active Users' },
      created_by: userId,
    }).select('id').single();
    if (jErr) throw jErr;

    if (journey) {
      const nodes = [
        { workspace_id: workspaceId, journey_id: journey.id, node_id: 'trigger_1', type: 'trigger', config: { label: 'Segment Entry' }, position: { x: 250, y: 50 } },
        { workspace_id: workspaceId, journey_id: journey.id, node_id: 'wait_1', type: 'wait', config: { label: 'Wait 1 Day', duration_hours: 24 }, position: { x: 250, y: 180 } },
        { workspace_id: workspaceId, journey_id: journey.id, node_id: 'send_email_1', type: 'send_email', config: { label: 'Send Welcome', template_id: insertedTemplates?.[0]?.id }, position: { x: 250, y: 310 } },
        { workspace_id: workspaceId, journey_id: journey.id, node_id: 'end_1', type: 'end', config: { label: 'End' }, position: { x: 250, y: 440 } },
      ];
      await supabase.from('journey_nodes').insert(nodes);

      const edges = [
        { workspace_id: workspaceId, journey_id: journey.id, source_node_id: 'trigger_1', target_node_id: 'wait_1' },
        { workspace_id: workspaceId, journey_id: journey.id, source_node_id: 'wait_1', target_node_id: 'send_email_1' },
        { workspace_id: workspaceId, journey_id: journey.id, source_node_id: 'send_email_1', target_node_id: 'end_1' },
      ];
      await supabase.from('journey_edges').insert(edges);
    }

    // 5. Activity log entries
    const activities = [
      { workspace_id: workspaceId, channel: 'system', type: 'seed_data', message: 'Demo data loaded: 10 contacts, 2 segments, 2 templates, 1 journey', payload: {} },
    ];
    await supabase.from('engage_activity_log').insert(activities);

    toast.success('Demo data loaded successfully!');
    return true;
  } catch (error: any) {
    toast.error(`Failed to load demo data: ${error.message}`);
    return false;
  }
};
