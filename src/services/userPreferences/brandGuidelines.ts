
import { BrandGuidelines } from './types';
import { getUserPreference, saveUserPreference } from './storage';

/**
 * Get brand guidelines
 */
export function getBrandGuidelines(): BrandGuidelines | undefined {
  const preferences = getUserPreference('brandGuidelines');
  return preferences;
}

/**
 * Save brand guidelines
 */
export async function saveBrandGuidelines(guidelines: Omit<BrandGuidelines, 'updatedAt'>): Promise<boolean> {
  const updatedGuidelines: BrandGuidelines = {
    ...guidelines,
    updatedAt: new Date()
  };
  
  return saveUserPreference('brandGuidelines', updatedGuidelines);
}

/**
 * Initialize default brand guidelines if none exist
 */
export async function initializeDefaultBrandGuidelines(): Promise<void> {
  const guidelines = getBrandGuidelines();
  
  // Only initialize if no guidelines exist
  if (!guidelines) {
    const defaultGuidelines: Omit<BrandGuidelines, 'updatedAt'> = {
      brandName: 'Your Company',
      brandTone: 'Professional yet conversational',
      targetAudience: 'Business professionals aged 25-45',
      keyValues: ['Quality', 'Innovation', 'Reliability', 'Customer Service'],
      doGuidelines: [
        'Use a friendly, conversational tone',
        'Focus on benefits, not features',
        'Include a clear call to action',
        'Use consistent terminology'
      ],
      dontGuidelines: [
        'Don\'t use jargon or complex language',
        'Avoid negative language',
        'Don\'t make unsubstantiated claims',
        'Don\'t use overly sales-focused language'
      ],
      companyDescription: 'A brief description of your company and its mission.'
    };
    
    await saveBrandGuidelines(defaultGuidelines);
    
    console.log('Default brand guidelines initialized');
  }
}
