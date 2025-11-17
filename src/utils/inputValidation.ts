import { z } from 'zod';

export const CampaignInputSchema = z.object({
  idea: z.string().min(10, 'Idea must be at least 10 characters').max(5000, 'Idea too long'),
  targetAudience: z.string().max(1000).optional(),
  goal: z.enum(['awareness', 'conversion', 'engagement', 'education']).optional(),
  timeline: z.enum(['1-week', '2-week', '4-week', 'ongoing']).optional(),
  solutionId: z.string().uuid().optional(),
  useSerpData: z.boolean().optional(),
  useCompetitorData: z.boolean().optional()
});

export function sanitizeHtml(input: string): string {
  // Remove all HTML tags and potential script injections
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validateCampaignInput(input: unknown) {
  const result = CampaignInputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.errors[0].message}`);
  }
  return {
    ...result.data,
    idea: sanitizeHtml(result.data.idea),
    targetAudience: result.data.targetAudience ? sanitizeHtml(result.data.targetAudience) : undefined
  };
}
