
# Continue Engage Implementation: Journey Builder, Automations, Campaigns, and Settings

## What We're Building

The remaining Engage pages (Journeys, Automations, Email Campaigns) use plain Card components and lack the glassmorphism, framer-motion animations, and feature depth that the Social page now has. The Settings page also needs a proper connection flow so Engage actually works end-to-end.

This plan covers 4 areas:
1. Journey Builder -- custom nodes, inspector panel, validation
2. Campaigns -- audience selector, scheduling, polished cards
3. Automations -- condition/action config, design upgrade
4. Settings -- Resend API key integration, test connection, status indicators

---

## 1. Journey Builder Upgrade

**Current state**: Generic colored rectangles, no inspector, no node config forms, no validation.

**Changes to `JourneyBuilder.tsx`**:
- Replace generic `type: 'default'` nodes with custom React Flow node components per type (Trigger, SendEmail, Wait, Condition, UpdateContact, Webhook, End)
- Each custom node renders with its own icon, colored header bar, and a summary of its config
- Clicking a node opens a right-side inspector panel

**New file: `src/components/engage/journeys/nodes/CustomNodes.tsx`**
- 7 custom node components using React Flow's `Handle` for source/target ports
- Each has a glassmorphism card style: rounded corners, backdrop-blur, colored top border
- Icons: Mail for SendEmail, Clock for Wait, GitBranch for Condition, User for UpdateContact, Globe for Webhook, Flag for End, Zap for Trigger

**New file: `src/components/engage/journeys/JourneyInspector.tsx`**
- Slide-in panel on the right (w-80) when a node is selected
- Per-node config forms:
  - **Trigger**: select trigger type (manual, segment_entry, event)
  - **SendEmail**: template picker dropdown (queries email_templates)
  - **Wait**: duration input (number + unit: minutes/hours/days)
  - **Condition**: field/operator/value rule builder
  - **UpdateContact**: tag add/remove, attribute set
  - **Webhook**: URL input + method select
  - **End**: just a label
- Save button updates the node's `config` in local state
- Close button deselects

**Journey validation** (added to toolbar):
- "Validate" button checks: at least 1 trigger, no orphan nodes (every node must be reachable from trigger), all branches end at an End node
- Shows toast with errors or "Journey is valid"

**Manual enroll button**:
- Opens dialog to pick a contact from engage_contacts
- Inserts into journey_enrollments + creates first journey_step for the trigger node

---

## 2. Campaigns List and Wizard Upgrade

**Changes to `CampaignsList.tsx`**:
- Upgrade to GlassCard + framer-motion stagger animation
- Add stat cards header: Draft, Sending, Complete counts with gradient icons
- Campaign cards get: status badge with icons, template name, scheduled time, recipient count, action dropdown (Edit, Delete, Duplicate)

**Audience selection** (in create/edit dialog):
- Step 1: Name + Template (existing)
- Step 2: Audience -- choose "All contacts", a specific segment, or filter by tags
- Show estimated recipient count based on selection
- Step 3: Schedule -- "Send now" or pick date/time

**Changes to launch logic**:
- If audience is a segment, query engage_segment_memberships for contact_ids
- If audience is tag-based, filter engage_contacts by tags
- Respect scheduled_at: if future date, set status to "scheduled" instead of "sending"

---

## 3. Automations List Upgrade

**Changes to `AutomationsList.tsx`**:
- GlassCard + framer-motion stagger
- Hero section with stat cards: Active, Paused, Total count
- Automation cards get: trigger type badge, action summary, last run timestamp, edit/delete dropdown

**Expanded create/edit dialog**:
- Trigger config: type selector + value input (e.g., segment name for segment_entry, tag name for tag_added, event name for event_occurred)
- Condition builder (optional): field/operator/value to further filter
- Actions list: support multiple actions with type-specific config:
  - send_email: template picker
  - add_tag / remove_tag: tag input
  - enroll_journey: journey picker
  - webhook: URL + method

---

## 4. Settings -- Making Engage Work

**Current state**: Email provider form exists but saves API key in the database `email_provider_settings.config` column (plain JSON). No RESEND_API_KEY secret exists.

**What needs to happen for email to actually send**:
The `engage-email-send` edge function reads `Deno.env.get("RESEND_API_KEY")`. This secret needs to be added.

**Changes to `EngageIntegrationSettings.tsx`**:
- Add a "Connection Status" section at the top showing:
  - Email: Connected/Not configured (based on email_provider_settings existence)
  - API Key: Configured/Missing (based on whether the form has been saved)
- Add a "Test Connection" button that:
  - Calls the `engage-email-send` edge function with a test payload
  - Shows success/error toast
- Add a "Send Test Email" button that queues a single test email_message and invokes the edge function
- Upgrade styling to glassmorphism to match the rest of Engage
- Add helper text explaining: "Get your Resend API key from resend.com/api-keys" with a link

**Secret management**:
- The Resend API key will be requested via the add_secret tool during implementation
- This gets stored as a Supabase Edge Function secret (RESEND_API_KEY)
- The edge function already reads it -- no code change needed there

**Social accounts section**:
- Keep "Coming Soon" badges but upgrade to glassmorphism card style
- Each provider card shows its icon with colored background

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/engage/journeys/nodes/CustomNodes.tsx` | 7 custom React Flow node components |
| `src/components/engage/journeys/JourneyInspector.tsx` | Right-side config panel |
| `src/components/engage/shared/RuleBuilder.tsx` | Reusable field/operator/value rule component |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/engage/journeys/JourneyBuilder.tsx` | Custom nodes, inspector, validation, enroll |
| `src/components/engage/journeys/JourneysList.tsx` | GlassCard, framer-motion, stats, delete action |
| `src/components/engage/email/campaigns/CampaignsList.tsx` | GlassCard, stats, audience selector, scheduling |
| `src/components/engage/automations/AutomationsList.tsx` | GlassCard, stats, expanded config, delete |
| `src/components/settings/engage/EngageIntegrationSettings.tsx` | Connection status, test button, glassmorphism |

## Implementation Order

1. RuleBuilder shared component (used by Journey Condition + Automation conditions)
2. Custom journey nodes + inspector
3. JourneyBuilder integration (wire custom nodes, inspector, validation, enroll)
4. JourneysList design upgrade
5. CampaignsList upgrade with audience + scheduling
6. AutomationsList upgrade with expanded config
7. EngageIntegrationSettings upgrade with connection status + test
8. Add RESEND_API_KEY secret (will prompt you for the key)
