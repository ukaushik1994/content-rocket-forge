import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const loadSeedData = async (workspaceId: string, userId: string) => {
  try {
    // 1. Create 10 contacts
    const contacts = [
      { email: 'alice@example.com', first_name: 'Alice', last_name: 'Johnson', tags: ['lead', 'newsletter'], attributes: { plan: 'pro', source: 'website' }, lifecycle_stage: 'customer' },
      { email: 'bob@example.com', first_name: 'Bob', last_name: 'Smith', tags: ['customer', 'newsletter'], attributes: { plan: 'free', source: 'referral' }, lifecycle_stage: 'lead' },
      { email: 'carol@example.com', first_name: 'Carol', last_name: 'Williams', tags: ['lead'], attributes: { plan: 'trial', source: 'ads' }, lifecycle_stage: 'subscriber' },
      { email: 'dave@example.com', first_name: 'Dave', last_name: 'Brown', tags: ['customer', 'vip'], attributes: { plan: 'enterprise', source: 'sales' }, lifecycle_stage: 'customer' },
      { email: 'eve@example.com', first_name: 'Eve', last_name: 'Davis', tags: ['newsletter'], attributes: { plan: 'free', source: 'organic' }, lifecycle_stage: 'subscriber' },
      { email: 'frank@example.com', first_name: 'Frank', last_name: 'Miller', tags: ['lead', 'webinar'], attributes: { plan: 'trial', source: 'webinar' }, lifecycle_stage: 'lead' },
      { email: 'grace@example.com', first_name: 'Grace', last_name: 'Wilson', tags: ['customer'], attributes: { plan: 'pro', source: 'website' }, lifecycle_stage: 'customer' },
      { email: 'henry@example.com', first_name: 'Henry', last_name: 'Moore', tags: ['lead', 'newsletter'], attributes: { plan: 'free', source: 'social' }, lifecycle_stage: 'lead' },
      { email: 'iris@example.com', first_name: 'Iris', last_name: 'Taylor', tags: ['customer', 'newsletter', 'vip'], attributes: { plan: 'enterprise', source: 'partner' }, lifecycle_stage: 'customer' },
      { email: 'jack@example.com', first_name: 'Jack', last_name: 'Anderson', tags: ['lead'], attributes: { plan: 'trial', source: 'ads' }, lifecycle_stage: 'subscriber' },
    ].map(c => ({ ...c, workspace_id: workspaceId }));

    const { data: insertedContacts, error: cErr } = await supabase
      .from('engage_contacts')
      .insert(contacts)
      .select('id, email, first_name');
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

    // 5. Create 2 sample automations
    const automations = [
      {
        workspace_id: workspaceId,
        name: 'Tag new leads',
        trigger_config: { type: 'contact_created', match: 'all' },
        conditions: [{ field: 'lifecycle_stage', operator: 'equals', value: 'subscriber' }],
        actions: [{ type: 'add_tag', config: { tag: 'new-subscriber' } }],
        status: 'active' as const,
        created_by: userId,
      },
      {
        workspace_id: workspaceId,
        name: 'Welcome email on signup',
        trigger_config: { type: 'contact_created', match: 'any' },
        conditions: [],
        actions: [{ type: 'send_email', config: { template_id: insertedTemplates?.[0]?.id, subject: 'Welcome!' } }],
        status: 'paused' as const,
        created_by: userId,
      },
    ];
    const { data: insertedAutomations, error: aErr } = await supabase
      .from('engage_automations')
      .insert(automations)
      .select('id');
    if (aErr) throw aErr;

    // 6. Create sample automation runs
    if (insertedAutomations?.length && insertedContacts?.length) {
      const runs = [
        {
          workspace_id: workspaceId,
          automation_id: insertedAutomations[0].id,
          contact_id: insertedContacts[0].id,
          status: 'success',
          duration_ms: 142,
          trigger_event: { type: 'contact_created', contact_email: insertedContacts[0].email },
          actions_executed: [{ type: 'add_tag', tag: 'new-subscriber', result: 'ok' }],
        },
        {
          workspace_id: workspaceId,
          automation_id: insertedAutomations[0].id,
          contact_id: insertedContacts[1].id,
          status: 'success',
          duration_ms: 98,
          trigger_event: { type: 'contact_created', contact_email: insertedContacts[1].email },
          actions_executed: [{ type: 'add_tag', tag: 'new-subscriber', result: 'ok' }],
        },
        {
          workspace_id: workspaceId,
          automation_id: insertedAutomations[1].id,
          contact_id: insertedContacts[2].id,
          status: 'failed',
          duration_ms: 2100,
          error: 'No email provider configured',
          trigger_event: { type: 'contact_created', contact_email: insertedContacts[2].email },
          actions_executed: [],
        },
      ];
      await supabase.from('automation_runs').insert(runs);
    }

    // 7. Create social inbox items
    if (insertedContacts?.length) {
      const socialItems = [
        {
          workspace_id: workspaceId,
          type: 'mention',
          content: 'Just discovered @YourBrand — absolutely love the new features! 🔥',
          author_name: 'Sarah Tech',
          author_profile_url: 'https://twitter.com/sarahtech',
          status: 'open',
          linked_contact_id: insertedContacts[0].id,
        },
        {
          workspace_id: workspaceId,
          type: 'comment',
          content: 'This is exactly what I needed for my workflow. Any plans for a mobile app?',
          author_name: 'DesignGuru',
          status: 'open',
        },
        {
          workspace_id: workspaceId,
          type: 'dm',
          content: 'Hi, I\'m interested in your enterprise plan. Can we schedule a call?',
          author_name: 'Mark Johnson',
          author_profile_url: 'https://linkedin.com/in/markjohnson',
          status: 'assigned',
          linked_contact_id: insertedContacts[3].id,
        },
        {
          workspace_id: workspaceId,
          type: 'comment',
          content: 'Great webinar yesterday! Very insightful presentation.',
          author_name: 'Lisa Wang',
          status: 'done',
        },
      ];
      await supabase.from('social_inbox_items').insert(socialItems);
    }

    // 8. Create social saved replies
    const savedReplies = [
      { workspace_id: workspaceId, title: 'Thank You', content: 'Thanks for reaching out! We appreciate your support. 🙏' },
      { workspace_id: workspaceId, title: 'Schedule Call', content: 'We\'d love to chat! You can book a time here: [link]. Looking forward to it!' },
      { workspace_id: workspaceId, title: 'Feature Request', content: 'Great suggestion! We\'ve added this to our roadmap. Stay tuned for updates!' },
    ];
    await supabase.from('social_saved_replies').insert(savedReplies);

    // 9. Create social posts
    const socialPosts = [
      {
        workspace_id: workspaceId,
        content: '🚀 Excited to announce our new automation features! Build workflows in minutes, not hours. #MarketingAutomation #SaaS',
        status: 'posted',
        scheduled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_by: userId,
      },
      {
        workspace_id: workspaceId,
        content: 'How we helped 500+ businesses streamline their customer engagement. Read the full case study on our blog. 📊',
        status: 'scheduled',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        created_by: userId,
      },
      {
        workspace_id: workspaceId,
        content: 'Behind the scenes of our product team sprint! 💡 Building the future of customer engagement.',
        status: 'draft',
        created_by: userId,
      },
    ];
    await supabase.from('social_posts').insert(socialPosts);

    // 10. Create activity log entries
    const activities = [
      { workspace_id: workspaceId, channel: 'system', type: 'seed_data', message: 'Demo data loaded: 10 contacts, 2 segments, 2 templates, 1 journey, 2 automations', payload: {} },
      { workspace_id: workspaceId, channel: 'email', type: 'email_sent', message: 'Welcome email sent to alice@example.com', payload: { subject: 'Welcome Alice!' }, contact_id: insertedContacts?.[0]?.id },
      { workspace_id: workspaceId, channel: 'email', type: 'email_sent', message: 'Follow-up sent to bob@example.com', payload: { subject: 'How\'s it going, Bob?' }, contact_id: insertedContacts?.[1]?.id },
      { workspace_id: workspaceId, channel: 'automation', type: 'automation_triggered', message: 'Automation "Tag new leads" triggered for carol@example.com', payload: { automation: 'Tag new leads' }, contact_id: insertedContacts?.[2]?.id },
      { workspace_id: workspaceId, channel: 'social', type: 'social_mention', message: 'New mention from @SarahTech on Twitter', payload: { platform: 'twitter' } },
      { workspace_id: workspaceId, channel: 'system', type: 'journey_activated', message: 'Journey "Welcome Journey" activated', payload: { journey: 'Welcome Journey' } },
    ];
    await supabase.from('engage_activity_log').insert(activities);

    // 11. Create audit log entries
    const auditLogs = [
      { workspace_id: workspaceId, user_id: userId, action: 'create', resource_type: 'contact', resource_id: insertedContacts?.[0]?.id, details: { email: 'alice@example.com' } },
      { workspace_id: workspaceId, user_id: userId, action: 'create', resource_type: 'template', resource_id: insertedTemplates?.[0]?.id, details: { name: 'Welcome Email' } },
      { workspace_id: workspaceId, user_id: userId, action: 'create', resource_type: 'journey', resource_id: journey?.id, details: { name: 'Welcome Journey' } },
      { workspace_id: workspaceId, user_id: userId, action: 'update', resource_type: 'settings', details: { field: 'sender_name', value: 'My Brand' } },
      { workspace_id: workspaceId, user_id: userId, action: 'export', resource_type: 'contact', details: { count: 10, format: 'csv' } },
    ];
    await supabase.from('engage_audit_log').insert(auditLogs);

    toast.success('Demo data loaded successfully!');
    return true;
  } catch (error: any) {
    toast.error(`Failed to load demo data: ${error.message}`);
    return false;
  }
};
