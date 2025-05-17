
import { savePromptTemplate } from './promptTemplates';
import { getPromptTemplates } from './promptTemplates';

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
