/**
 * Shared utility: maps offering (solution) data + brand guidelines
 * into auto-populated content brief fields and writing defaults.
 */

import type { EnhancedOffering } from '@/contexts/content-builder/types/enhanced-offering-types';

export interface OfferingBriefResult {
  contentBrief: {
    targetAudience: string;
    contentGoal: string;
    tone: string;
    specificPoints: string;
  };
  writingStyle: 'conversational' | 'professional' | 'academic' | 'casual';
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
}

interface BrandGuidelines {
  tone?: string[] | any;
}

/**
 * Maps offering target-audience keywords to the dropdown value.
 */
function inferAudience(audienceText: string): string {
  const t = audienceText.toLowerCase();
  if (t.includes('enterprise') || t.includes('cto') || t.includes('ceo') || t.includes('executive')) return 'enterprise';
  if (t.includes('developer') || t.includes('engineer') || t.includes('technical')) return 'developers';
  if (t.includes('marketer') || t.includes('marketing')) return 'marketers';
  if (t.includes('beginner') || t.includes('student') || t.includes('consumer')) return 'beginners';
  if (t.includes('business') || t.includes('professional') || t.includes('manager')) return 'professionals';
  return 'general';
}

/**
 * Maps brand-guidelines tone array to the brief tone dropdown value.
 */
function inferToneFromBrand(brandTones: string[]): string {
  if (!brandTones.length) return '';
  const first = brandTones[0].toLowerCase();
  const MAP: Record<string, string> = {
    professional: 'professional',
    casual: 'casual',
    technical: 'technical',
    friendly: 'friendly',
    authoritative: 'authoritative',
    formal: 'professional',
    informal: 'casual',
    conversational: 'friendly',
  };
  return MAP[first] || 'professional';
}

/**
 * Infers tone from the offering audience when no brand tone is available.
 */
function inferToneFromAudience(audience: string): string {
  if (audience === 'enterprise' || audience === 'professionals') return 'professional';
  if (audience === 'developers') return 'technical';
  if (audience === 'beginners') return 'friendly';
  return 'professional';
}

/**
 * Infers content goal from content intent or defaults.
 */
export function inferContentGoal(contentIntent?: string, priorityTag?: string): string {
  if (contentIntent === 'inform' || contentIntent === 'educate') return 'educate';
  if (contentIntent === 'convert') return 'convert';
  if (contentIntent === 'entertain') return 'engage';
  if (priorityTag === 'quick-win') return 'rank';
  if (priorityTag === 'authority') return 'authority';
  return '';
}

/**
 * Compose specific-points text from offering data.
 */
function composeSpecificPoints(offering: EnhancedOffering): string {
  const sections: string[] = [];
  if (offering.painPoints?.length) {
    sections.push(`Pain points: ${offering.painPoints.join(', ')}`);
  }
  if (offering.useCases?.length) {
    sections.push(`Key use cases: ${offering.useCases.join(', ')}`);
  }
  if (offering.uniqueValuePropositions?.length) {
    sections.push(`Value propositions: ${offering.uniqueValuePropositions.join(', ')}`);
  }
  return sections.join('\n');
}

/**
 * Main utility: derive content brief + writing defaults from offering data.
 */
export function mapOfferingToBrief(
  offering: EnhancedOffering,
  brandGuidelines?: BrandGuidelines | null,
  contentIntent?: string,
  priorityTag?: string
): OfferingBriefResult {
  const audienceText = (offering.targetAudience || []).join(' ');
  const audience = inferAudience(audienceText);

  // Tone: brand guidelines take priority, then infer from audience
  let tone = '';
  if (brandGuidelines?.tone) {
    const tones = Array.isArray(brandGuidelines.tone) ? brandGuidelines.tone : [brandGuidelines.tone];
    tone = inferToneFromBrand(tones.map(String));
  }
  if (!tone) {
    tone = inferToneFromAudience(audience);
  }

  const contentGoal = inferContentGoal(contentIntent, priorityTag);
  const specificPoints = composeSpecificPoints(offering);

  // Writing style + expertise from audience
  let writingStyle: OfferingBriefResult['writingStyle'] = 'conversational';
  let expertiseLevel: OfferingBriefResult['expertiseLevel'] = 'intermediate';

  if (audience === 'enterprise' || audience === 'professionals') {
    writingStyle = 'professional';
    expertiseLevel = 'intermediate';
  } else if (audience === 'developers') {
    writingStyle = 'professional';
    expertiseLevel = 'expert';
  } else if (audience === 'beginners') {
    writingStyle = 'conversational';
    expertiseLevel = 'beginner';
  }

  return {
    contentBrief: { targetAudience: audience, contentGoal, tone, specificPoints },
    writingStyle,
    expertiseLevel,
  };
}
