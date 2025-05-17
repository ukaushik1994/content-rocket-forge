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
  const existingTemplates = getPromptTemplates();
  
  // Only initialize if no templates exist
  if (existingTemplates.length === 0) {
    const defaultTemplates = [
      // Blog post template
      {
        name: "SEO-Optimized Blog Post",
        formatType: "blog",
        description: "Template for creating long-form, SEO-optimized blog content",
        promptTemplate: `Write a comprehensive, SEO-optimized blog post about {topic}. 

The post should be informative, engaging, and structured with proper headings and subheadings. 

Include relevant statistics, examples, and actionable takeaways for readers.

Make sure to naturally incorporate related keywords and maintain a conversational yet authoritative tone.`,
        structureTemplate: `# Introduction
- Hook the reader with an interesting fact or question about {topic}
- Brief overview of why this topic matters
- What the reader will learn (value proposition)

## Understanding {topic}
- Definition and key concepts
- Historical context or background information

## Main Sections (3-5 key points)
- Key point 1 with supporting evidence
- Key point 2 with supporting evidence
- Key point 3 with supporting evidence

## Practical Applications
- How to apply this knowledge
- Real-world examples or case studies

# Conclusion
- Summary of key points
- Final thoughts or call to action`
      },

      // Twitter/X post template
      {
        name: "Twitter/X Thread",
        formatType: "social-twitter",
        description: "Short, engaging Twitter post with hashtags",
        promptTemplate: `Create an engaging Twitter thread about {topic}. 

The first tweet should hook the reader and introduce the topic.
Each subsequent tweet should expand on a specific point.
The final tweet should include a call to action.

Keep each tweet under 280 characters and use appropriate hashtags.
Use emoji sparingly for emphasis 👍
Include 1-2 relevant hashtags per tweet.`,
        structureTemplate: `Tweet 1: Hook and introduction
Tweet 2-5: Key points and insights
Tweet 6: Summary and call to action with hashtags`
      },
      
      // Carousel post template
      {
        name: "Educational Carousel Post",
        formatType: "carousel",
        description: "Multi-slide carousel for social media with educational content",
        promptTemplate: `Create a 5-7 slide carousel post about {topic} that educates the audience in an engaging way. 

Each slide should focus on ONE key point with concise, easy-to-digest information.
For each slide, describe both the text content AND a suggestion for a complementary visual.
First slide should hook the viewer and introduce what they'll learn.
Final slide should have a clear call to action.

Number each slide clearly (Slide 1, Slide 2, etc.) and provide a title for each slide.
Keep text minimal - aim for 15-30 words per slide for readability.`,
        structureTemplate: `Slide 1: Title + Hook
Slide 2-6: Key Points (one per slide)
Slide 7: Summary + Call to Action`
      },
      
      // Meme template
      {
        name: "Trending Meme Format",
        formatType: "meme",
        description: "Humorous meme concept using popular formats",
        promptTemplate: `Create a meme concept about {topic} that would resonate with our target audience.

Describe:
1. Which meme format/template to use (choose a well-known, trending format)
2. Exactly what text should appear at the top and/or bottom of the meme
3. How the image and text work together to create humor related to {topic}
4. Why this would resonate with our audience

The meme should be clever but accessible, on-brand, and avoid controversial topics.`,
        structureTemplate: ``
      },
      
      // Glossary entry template
      {
        name: "Technical Glossary Entry",
        formatType: "glossary",
        description: "Clear, concise definition with examples for technical terms",
        promptTemplate: `Create a comprehensive glossary entry for the term "{topic}".

Include:
1. A concise definition (1-2 sentences)
2. A more detailed explanation (2-3 paragraphs)
3. Examples of usage in context
4. Related terms or concepts
5. Any industry-specific variations in meaning

Use clear, precise language that would help someone completely unfamiliar with the term understand it. Avoid jargon unless explaining the jargon itself.`,
        structureTemplate: `## {topic}

### Definition
[Concise definition here]

### Detailed Explanation
[Expanded explanation here]

### Examples
- [Example 1]
- [Example 2]

### Related Terms
- [Related term 1]
- [Related term 2]`
      }
    ];
    
    // Save default templates
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
