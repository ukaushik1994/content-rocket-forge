# Campaign Workflow Documentation

## Overview
This document describes the campaign creation, generation, and management workflow in the application.

---

## Campaign Creation Flow

### 1. Input & Validation
```
User Input → Client-side Validation → Sanitization → Edge Function
```

**Client-side validation:**
- Zod schema validation in `src/utils/inputValidation.ts`
- Idea: 10-5000 characters
- Target audience: max 1000 characters
- HTML tag stripping via `sanitizeHtml()`

**Security:**
- All inputs sanitized before database operations
- No XSS vulnerabilities via HTML injection
- SQL keywords rejected

### 2. Strategy Generation
```
Client → generate-campaign-strategy edge function → AI Proxy → Database
```

**Flow:**
1. Client calls `generate-campaign-strategy` edge function
2. Edge function validates authentication
3. Rate limiting check (10 generations/hour)
4. Input sanitization and validation
5. AI proxy invocation with retry logic
6. Structured output via tool-calling
7. Database storage

**Security:**
- API keys never exposed to client
- Rate limiting via `campaign_generation_limits` table
- Retry logic with exponential backoff

### 3. Atomic Campaign Creation
```
createCampaignAtomic() → Supabase RPC → All-or-nothing transaction
```

**Single atomic operation creates:**
- Campaign record with strategy
- Cost tracking entry (initialized to $0)
- Creation event log

**Benefits:**
- No partial campaign data on failure
- Automatic rollback on errors
- Consistent data integrity

---

## Content Generation Flow

### 1. Brief Generation
```
Strategy → campaign-content-generator → AI Proxy → Content Brief
```

**For each content piece:**
- AI generates outline/brief based on strategy
- Word count estimation
- SEO keywords
- Target channels

### 2. Content Writing
```
Brief → campaign-content-generator → AI Proxy → Full Content
```

**Generation:**
- Full content body based on brief
- Meta title/description
- SEO optimization
- Brand voice consistency

### 3. Database Storage
```
Content → content_items table → Status tracking
```

**Schema:**
- `campaign_id` (foreign key with CASCADE delete)
- `user_id` (ownership validation)
- `status` (draft → published)
- `content` (JSON with title, body, meta)

---

## Campaign Status Transitions

```
draft → planned → active → completed
```

### Status Definitions

**draft:** Initial state when campaign is created without strategy
- User can modify input
- No content generated

**planned:** Strategy selected, content not yet generated
- Auto-save triggers this status
- User can edit strategy

**active:** Content generation in progress or some content published
- Content items being created
- Publishing workflows active

**completed:** All planned content generated and published
- Analytics available
- ROI tracking enabled

---

## Publishing Workflow

### 1. Content Review
```
Content Library → Preview Modal → Edit/Approve
```

### 2. Platform Publishing
```
Publishing Panel → WordPress/Wix API → Status Tracking
```

**Supported platforms:**
- WordPress (via REST API)
- Wix (via API)
- Manual export (ZIP download)

### 3. Scheduling
```
Calendar Integration → Publication Queue → Automated Publishing
```

---

## Security Measures

### Input Sanitization
- All user inputs sanitized via `sanitizeHtml()`
- Length limits enforced
- HTML tags stripped
- Validation in multiple layers (client + server)

### RLS Policies
- Users can only access their own campaigns
- Campaign analytics tied to campaign ownership
- Content items validated against user ownership

### Rate Limiting
- 10 strategy generations per user per hour
- Automatic hourly reset trigger
- 429 response on limit exceeded

### Atomic Transactions
- Campaign creation is all-or-nothing
- Automatic rollback on errors
- No orphaned records

---

## Migration Guide

### For Developers

**Campaign Creation:**
```typescript
// ❌ OLD (deprecated):
const saved = await campaignService.saveCampaign(userId, name, idea, strategy);
await campaignService.updateCampaign(saved.id, { target_audience, goal });

// ✅ NEW (atomic):
import { createCampaignAtomic } from '@/services/campaignTransactions';
const campaign = await createCampaignAtomic(
  userId,
  name,
  description,
  { idea, targetAudience, goal, timeline, solutionId },
  strategy
);
```

**Input Validation:**
```typescript
// Always validate and sanitize:
import { validateCampaignInput, sanitizeHtml } from '@/utils/inputValidation';

const sanitized = validateCampaignInput(rawInput);
// Use sanitized.idea, sanitized.targetAudience, etc.
```

**Strategy Generation:**
```typescript
// Use edge function with retry:
import { retryWithBackoff } from '@/utils/retry';

const { data, error } = await retryWithBackoff(() =>
  supabase.functions.invoke('generate-campaign-strategy', {
    body: { input: sanitizedInput, ... }
  })
);
```

---

## Performance Optimization

### Database Indexes
- `campaigns(user_id, created_at)`
- `content_items(campaign_id)`
- `content_items(user_id, created_at)`
- `campaign_analytics(campaign_id, date)`

### Cascade Deletes
- Deleting campaign auto-deletes content_items
- Prevents orphaned records
- Maintains referential integrity

### Edge Function Retry Logic
- Exponential backoff on rate limits
- Max 3 retries by default
- 1-2s initial delay, doubles each retry
- 10s maximum delay cap

---

## Analytics & ROI

### Campaign Analytics
- Performance metrics (views, clicks, conversions)
- Platform-specific breakdowns
- Engagement tracking

### ROI Calculator
- Revenue vs. cost comparison
- Cost per conversion
- Campaign profitability

### AI Insights
- Performance recommendations
- Content optimization suggestions
- Audience insights

---

## Troubleshooting

### Common Issues

**"Rate limit exceeded":**
- Wait for hourly reset
- Check `campaign_generation_limits` table
- Verify window_start timestamp

**"Campaign creation failed":**
- Check console for rollback message
- Verify user authentication
- Ensure all required fields present

**"Content generation stuck":**
- Check edge function logs
- Verify AI provider credentials
- Check rate limits on AI provider

**"RLS policy violation":**
- Verify campaign ownership
- Check user_id in campaigns table
- Confirm authentication token valid

---

## Testing

### Unit Tests
- Input validation (`inputValidation.test.ts`)
- Sanitization functions
- Edge cases for length limits

### Integration Tests
- Campaign creation flow
- RLS policy enforcement
- Rate limiting behavior
- Atomic transaction rollback

### Manual Testing
- Create campaign with valid/invalid inputs
- Test rate limiting (10+ generations)
- Verify cascade deletes
- Check status transitions

---

## Future Enhancements

- [ ] A/B testing for campaign strategies
- [ ] Multi-language content generation
- [ ] Advanced analytics dashboards
- [ ] Content performance predictions
- [ ] Automated content refreshing
- [ ] Integration with more platforms (LinkedIn, Medium, etc.)
