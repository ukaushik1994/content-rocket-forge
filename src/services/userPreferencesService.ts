
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PromptTemplate {
  id: string;
  name: string;
  formatType: string; // e.g., 'blog', 'social-twitter', etc.
  description?: string;
  promptTemplate: string;
  structureTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandGuidelines {
  brandName: string;
  brandTone: string;
  targetAudience: string;
  keyValues: string[];
  doGuidelines: string[];
  dontGuidelines: string[];
  companyDescription?: string;
  updatedAt: Date;
}

interface UserPreferences {
  defaultAiProvider?: 'openai' | 'anthropic' | 'gemini';
  enableAiFallback?: boolean;
  promptTemplates?: PromptTemplate[];
  brandGuidelines?: BrandGuidelines;
  // We can add more user preferences here in the future
}

/**
 * Save user preferences to localStorage
 */
export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
  try {
    // Get existing preferences
    const existing = getUserPreferences();
    
    // Merge with new preferences
    const merged = { ...existing, ...preferences };
    
    // Save to localStorage
    localStorage.setItem('user_preferences', JSON.stringify(merged));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  try {
    const preferences = localStorage.getItem('user_preferences');
    return preferences ? JSON.parse(preferences) : {};
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {};
  }
}

/**
 * Get a specific user preference
 */
export function getUserPreference<K extends keyof UserPreferences>(key: K): UserPreferences[K] | undefined {
  const preferences = getUserPreferences();
  return preferences[key];
}

/**
 * Save a specific user preference
 */
export async function saveUserPreference<K extends keyof UserPreferences>(
  key: K, 
  value: UserPreferences[K]
): Promise<boolean> {
  return saveUserPreferences({ [key]: value } as Partial<UserPreferences>);
}

/**
 * Get all prompt templates
 */
export function getPromptTemplates(): PromptTemplate[] {
  const preferences = getUserPreferences();
  return preferences.promptTemplates || [];
}

/**
 * Get prompt templates for a specific format type
 */
export function getPromptTemplatesByType(formatType: string): PromptTemplate[] {
  const templates = getPromptTemplates();
  return templates.filter(template => template.formatType === formatType);
}

/**
 * Get a specific prompt template by ID
 */
export function getPromptTemplateById(id: string): PromptTemplate | undefined {
  const templates = getPromptTemplates();
  return templates.find(template => template.id === id);
}

/**
 * Save a prompt template
 */
export async function savePromptTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
  const templates = getPromptTemplates();
  const newTemplate: PromptTemplate = {
    ...template,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedTemplates = [...templates, newTemplate];
  return saveUserPreference('promptTemplates', updatedTemplates);
}

/**
 * Update an existing prompt template
 */
export async function updatePromptTemplate(template: PromptTemplate): Promise<boolean> {
  const templates = getPromptTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  
  if (index === -1) {
    return false;
  }
  
  const updatedTemplate = {
    ...template,
    updatedAt: new Date()
  };
  
  const updatedTemplates = [...templates];
  updatedTemplates[index] = updatedTemplate;
  
  return saveUserPreference('promptTemplates', updatedTemplates);
}

/**
 * Delete a prompt template
 */
export async function deletePromptTemplate(id: string): Promise<boolean> {
  const templates = getPromptTemplates();
  const updatedTemplates = templates.filter(template => template.id !== id);
  
  return saveUserPreference('promptTemplates', updatedTemplates);
}

/**
 * Get brand guidelines
 */
export function getBrandGuidelines(): BrandGuidelines | undefined {
  const preferences = getUserPreferences();
  return preferences.brandGuidelines;
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
 * Create default prompt templates if none exist
 */
export async function initializeDefaultPromptTemplates(): Promise<void> {
  const templates = getPromptTemplates();
  
  // Only initialize if no templates exist
  if (templates.length === 0) {
    const defaultTemplates: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Blog Post',
        formatType: 'blog',
        description: 'Standard blog post template with introduction, body, and conclusion',
        promptTemplate: `Create a comprehensive blog post about {topic} with the following structure:

1. Engaging introduction that hooks the reader
2. Main body with 3-5 sections covering key aspects
3. Practical examples or case studies
4. Actionable takeaways
5. Conclusion that summarizes the main points

Use a conversational but professional tone and include relevant statistics or facts where appropriate.`,
        structureTemplate: '# Introduction\n\n## Main Section 1\n\n## Main Section 2\n\n## Main Section 3\n\n# Conclusion'
      },
      {
        name: 'Twitter/X Post',
        formatType: 'social-twitter',
        description: 'Concise Twitter post with hashtags and engaging hook',
        promptTemplate: `Create an engaging Twitter post about {topic} that:
1. Hooks readers in the first few words
2. Provides value in under 280 characters
3. Includes 2-3 relevant hashtags
4. Has a clear call to action

Make it conversational and shareable.`,
        structureTemplate: 'Hook: [Attention-grabbing statement]\nMessage: [Value proposition]\nHashtags: #tag1 #tag2\nCTA: [Call to action]'
      },
      {
        name: 'LinkedIn Post',
        formatType: 'social-linkedin',
        description: 'Professional LinkedIn post with industry insights',
        promptTemplate: `Create a professional LinkedIn post about {topic} that:
1. Opens with an industry insight or question
2. Shares valuable information or perspective
3. Includes personal experience where relevant
4. Ends with a thought-provoking question or call to action
5. Uses 3-5 relevant hashtags

Keep the tone professional yet conversational, and structure it with short paragraphs for readability.`,
        structureTemplate: 'Opening Insight: [Industry observation]\n\nMain Value: [Key information]\n\nPersonal Connection: [Relevant experience]\n\nClosing: [Question or CTA]\n\nHashtags: #professional #industry #topic'
      },
      {
        name: 'Video Script',
        formatType: 'script',
        description: 'Video script with intro, main points, and conclusion',
        promptTemplate: `Create a video script about {topic} with the following elements:
1. A 30-second hook that grabs attention
2. Introduction stating what viewers will learn
3. 3-5 main points with supporting details
4. Visual cues and B-roll suggestions in [brackets]
5. A conclusion that reinforces the main message
6. Clear call to action

Write in a conversational tone appropriate for video delivery. Include timing guidelines.`,
        structureTemplate: "[0:00-0:30] HOOK: Attention-grabbing opening\n\n[0:30-1:00] INTRO: \"In this video, you will learn...\"\n\n[1:00-3:00] MAIN POINT 1: [Description with visual cues]\n\n[3:00-5:00] MAIN POINT 2: [Description with visual cues]\n\n[5:00-7:00] MAIN POINT 3: [Description with visual cues]\n\n[7:00-7:30] CONCLUSION: Summary of key points\n\n[7:30-8:00] CTA: \"Subscribe/Comment/Visit website\""
      },
      {
        name: 'Email Newsletter',
        formatType: 'email',
        description: 'Email newsletter template with sections and CTA',
        promptTemplate: `Create an email newsletter about {topic} with:
1. An attention-grabbing subject line
2. Personal greeting
3. Opening paragraph that states the value of this email
4. 2-4 main sections with headers
5. A relevant story or example
6. Clear call to action button text
7. Brief sign-off

Use a conversational, friendly tone and keep paragraphs short for easy reading on mobile devices.`,
        structureTemplate: 'SUBJECT: [Compelling subject line]\n\nGREETING: Hi {first_name},\n\nOPENING: [Value statement paragraph]\n\n[SECTION HEADER 1]\n[Content for section 1]\n\n[SECTION HEADER 2]\n[Content for section 2]\n\n[STORY/EXAMPLE]\n[Brief relevant story]\n\nCTA BUTTON: [Call to action text]\n\nSIGN-OFF: [Brief closing and signature]'
      },
      {
        name: 'Glossary Entry',
        formatType: 'glossary',
        description: 'Detailed glossary entry with definition, examples, and related terms',
        promptTemplate: `Create a comprehensive glossary entry for the term "{topic}" with the following elements:
1. Concise definition (1-2 sentences)
2. Extended explanation (3-4 sentences)
3. Example usage in context
4. Historical context or etymology if relevant
5. Related terms or concepts
6. Industry-specific applications where applicable

Use clear, precise language appropriate for educational purposes.`,
        structureTemplate: '## {Term}\n\n### Definition\n[Concise 1-2 sentence definition]\n\n### Extended Explanation\n[Detailed 3-4 sentence explanation]\n\n### Example Usage\n[Example of term used in context]\n\n### Historical Context\n[Brief history or etymology]\n\n### Related Terms\n- [Related term 1]\n- [Related term 2]\n- [Related term 3]\n\n### Industry Applications\n[How the term is used in specific industries]'
      },
      {
        name: 'Carousel Post',
        formatType: 'carousel',
        description: 'Content formatted for social media carousel slides',
        promptTemplate: `Create a carousel post about {topic} with:
1. An attention-grabbing first slide (headline and hook)
2. 5-7 content slides, each focused on a single point or tip
3. A final slide with call-to-action
4. Each slide should be concise (30-50 words max)
5. Include suggested visuals for each slide in [brackets]

Make sure each slide can stand alone but also flows naturally from one to the next.`,
        structureTemplate: 'SLIDE 1: [Headline/Hook]\n[Attention-grabbing opening that introduces the topic]\n[Suggested visual: Eye-catching image related to topic]\n\nSLIDE 2: [First Point/Tip]\n[Brief explanation in 30-50 words]\n[Suggested visual: Relevant illustration]\n\nSLIDE 3: [Second Point/Tip]\n[Brief explanation in 30-50 words]\n[Suggested visual: Relevant illustration]\n\n... continue for all content slides ...\n\nFINAL SLIDE: [Call-to-Action]\n[Brief CTA that encourages engagement]\n[Suggested visual: Brand-related image]'
      },
      {
        name: 'Meme Template',
        formatType: 'meme',
        description: 'Humorous meme concept with image suggestion and text',
        promptTemplate: `Create a humorous meme concept related to {topic} with:
1. A popular meme format suggestion (e.g., "Distracted Boyfriend," "Two Buttons," etc.)
2. Exact text to appear on each part of the meme
3. Brief explanation of the joke for context
4. Alternative format suggestion as a backup option

Keep it clean, clever, and relevant to the target audience. Avoid controversial topics or offensive humor.`,
        structureTemplate: '### Meme Format\n[Suggested popular meme template/format]\n\n### Meme Text\nText Element 1: [Exact text]\nText Element 2: [Exact text]\n... (additional text elements as needed)\n\n### Joke Explanation\n[Brief explanation of why this is humorous/relevant]\n\n### Alternative Format\n[Alternative meme format if the first isn\'t suitable]'
      }
    ];
    
    for (const template of defaultTemplates) {
      await savePromptTemplate(template);
    }
    
    console.log('Default prompt templates initialized');
  }
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
