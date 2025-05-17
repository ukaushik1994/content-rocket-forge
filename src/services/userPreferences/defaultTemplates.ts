
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
        description: "Short, engaging Twitter thread with hashtags",
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

      // LinkedIn post template
      {
        name: "LinkedIn Post",
        formatType: "social-linkedin",
        description: "Professional LinkedIn post optimized for engagement",
        promptTemplate: `Create a professional LinkedIn post about {topic} that will engage my network and establish thought leadership.

The post should:
- Start with a powerful hook or question to grab attention
- Include 3-5 paragraphs of valuable insights about {topic}
- Use appropriate line breaks for readability
- End with a thought-provoking question or call to action
- Include 3-5 relevant hashtags

Keep the content professional but conversational, and aim for around 1,200-1,500 characters total.`,
        structureTemplate: `Hook/Attention Grabber

Context/Problem Statement

Key Insights/Solution (2-3 paragraphs)

Call to Action/Question

Hashtags`
      },

      // Facebook post template
      {
        name: "Facebook Post",
        formatType: "social-facebook",
        description: "Engaging Facebook post optimized for social sharing",
        promptTemplate: `Create an engaging Facebook post about {topic} that encourages comments and shares.

The post should:
- Start with an attention-grabbing statement or question
- Be conversational and personable in tone
- Include a brief but valuable insight about {topic}
- End with a clear call to action (comment, share, etc.)
- Be around 100-250 words total

Consider including an engaging question or prompt for discussion to boost engagement.`,
        structureTemplate: `Attention-grabbing opening

Main content (2-3 short paragraphs)

Question or discussion prompt

Call to action`
      },

      // Instagram caption template
      {
        name: "Instagram Caption",
        formatType: "social-instagram",
        description: "Engaging Instagram caption with hashtags",
        promptTemplate: `Create an engaging Instagram caption about {topic} that complements a related image.

The caption should:
- Start with a catchy hook or personal anecdote
- Be authentic and conversational in tone
- Include 2-3 paragraphs of content (150-300 characters each)
- End with a question or call to action to encourage engagement
- Include 5-10 relevant hashtags at the end (mix of popular and niche)

Remember that the caption will accompany a visual, so it should enhance rather than explain the image.`,
        structureTemplate: `Catchy opening line

Main content (2-3 short paragraphs)

Question or call to action

.
.
.

#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5`
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
      
      // Email Newsletter template
      {
        name: "Email Newsletter",
        formatType: "email",
        description: "Professional email newsletter with sections and CTA",
        promptTemplate: `Create an email newsletter about {topic} that provides value to subscribers and encourages engagement.

The email should include:
- A personal, attention-grabbing subject line
- A brief, friendly introduction
- 3-4 sections of valuable content related to {topic}
- A clear call-to-action
- A personal sign-off

Use a conversational but professional tone, and keep paragraphs short for easy scanning. Include subheadings for each section and consider incorporating a question or prompt to encourage replies.`,
        structureTemplate: `Subject Line: [Compelling subject about {topic}]

Hi [First Name],

[Brief, personal introduction]

## [Section 1 Heading]
[Content]

## [Section 2 Heading]
[Content]

## [Section 3 Heading]
[Content]

[Call to action]

[Personal sign-off],
[Name]`
      },

      // Video/Podcast Script template
      {
        name: "Video/Podcast Script",
        formatType: "script",
        description: "Engaging script format for video or podcast content",
        promptTemplate: `Create a script for a {topic} video or podcast episode that's engaging and valuable to the audience.

The script should include:
- A strong hook in the first 15 seconds
- Clear sections with smooth transitions
- Conversation prompts (for podcasts) or visual cues (for videos)
- A clear call to action at the end

Format the script with speaker names (for podcasts) or [ACTION] directions (for videos). Aim for a conversational tone that sounds natural when spoken aloud, with short sentences and easy-to-pronounce words.`,
        structureTemplate: `## INTRO (30-45 seconds)
[Hook]
[Introduction to topic]
[Overview of what will be covered]

## SECTION 1: [Title] (2-3 minutes)
[Key points]
[Examples or stories]
[Transition to next section]

## SECTION 2: [Title] (2-3 minutes)
[Key points]
[Examples or stories]
[Transition to next section]

## SECTION 3: [Title] (2-3 minutes)
[Key points]
[Examples or stories]
[Transition to conclusion]

## CONCLUSION (30-60 seconds)
[Summary of key points]
[Call to action]
[Sign-off]`
      },

      // Infographic Content template
      {
        name: "Infographic Content",
        formatType: "infographic",
        description: "Structured content optimized for visual presentation",
        promptTemplate: `Create content for an infographic about {topic} that communicates key information in a clear, visually-oriented format.

Include:
- A compelling title for the infographic
- A brief introduction to {topic} (1-2 sentences)
- 5-7 key data points, facts, or steps related to {topic}
- A conclusion or call to action
- Sources for any statistics or research (if applicable)

For each section, provide both the text content and a brief description of what visual element might accompany it. Keep text extremely concise - each point should ideally be under 15 words.`,
        structureTemplate: `# TITLE: [Compelling Title About {topic}]

## INTRODUCTION
[Brief explanation of {topic} - 1-2 sentences]
[Visual suggestion: ]

## KEY POINTS/DATA
1. [First point/statistic]
   [Visual suggestion: ]

2. [Second point/statistic]
   [Visual suggestion: ]

3. [Third point/statistic]
   [Visual suggestion: ]

4. [Fourth point/statistic]
   [Visual suggestion: ]

5. [Fifth point/statistic]
   [Visual suggestion: ]

## CONCLUSION
[Final insight or call to action]
[Visual suggestion: ]

## SOURCES
[List of sources for data/research]`
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
      },

      // Case Study template
      {
        name: "Case Study",
        formatType: "case-study",
        description: "Detailed case study following problem-solution-results format",
        promptTemplate: `Create a comprehensive case study about how a company or individual successfully addressed challenges related to {topic}.

The case study should include:
1. A compelling title
2. An executive summary (2-3 sentences)
3. Background information on the client/subject
4. Clear description of the challenge or problem faced
5. The strategy or solution implemented
6. The process of implementation
7. Measurable results and outcomes
8. Key takeaways or lessons learned
9. A testimonial or quote (if applicable)

Use a professional tone and include specific details, metrics, and outcomes where possible. Structure the content to tell a compelling story of transformation.`,
        structureTemplate: `# [Case Study Title]

## Executive Summary
[Brief overview of the case study]

## Client Background
[Information about the client/company]

## Challenge
[Detailed description of the problem]

## Solution
[Strategy and implementation details]

## Process
[Steps taken to implement the solution]

## Results
[Measurable outcomes and benefits]

## Key Takeaways
[Lessons learned and insights]

## Testimonial
[Client quote or testimonial]`
      },

      // Product Description template
      {
        name: "Product Description",
        formatType: "product-description",
        description: "Compelling product description optimized for conversions",
        promptTemplate: `Create a compelling product description for a {topic} that persuades potential customers to purchase.

The description should include:
1. An attention-grabbing headline
2. A captivating opening that addresses customer pain points
3. 3-5 key features with benefits (not just features, but how they improve the customer's life)
4. Technical specifications (if applicable)
5. Social proof elements (suggested testimonial or review)
6. A strong call to action

Use sensory language, emotional triggers, and persuasive techniques. Write in second person ("you") to speak directly to the customer, and keep sentences concise and impactful.`,
        structureTemplate: `# [Product Name/Headline]

## Opening
[Captivating introduction addressing customer needs]

## Key Features & Benefits
• [Feature 1]: [Benefit explanation]

• [Feature 2]: [Benefit explanation]

• [Feature 3]: [Benefit explanation]

## Technical Specifications
[List relevant specifications]

## What Customers Are Saying
[Suggested testimonial]

## Call to Action
[Strong closing with clear next steps]`
      },

      // White Paper template
      {
        name: "White Paper",
        formatType: "white-paper",
        description: "In-depth, authoritative report on a specific topic",
        promptTemplate: `Create an outline and executive summary for a white paper about {topic} that positions the organization as a thought leader in the industry.

Include:
1. An attention-grabbing title
2. An executive summary (250-300 words)
3. A detailed outline with section headings and key points for each section
4. Suggestions for data points, case studies, or research to include
5. A conclusion with key takeaways and next steps

The white paper should be informative, research-backed, and solution-oriented. Use a professional tone and focus on providing valuable insights rather than overtly selling a product or service.`,
        structureTemplate: `# [White Paper Title]

## Executive Summary
[Comprehensive summary of the white paper content]

## 1. Introduction
- [Background on the issue/topic]
- [Why this matters to the industry]
- [Brief overview of what the paper will cover]

## 2. Current Industry Landscape
- [Analysis of current situation]
- [Key challenges and pain points]
- [Relevant statistics and trends]

## 3. [Key Issue/Challenge #1]
- [Detailed examination]
- [Impact on businesses/users]
- [Case example or data point]

## 4. [Key Issue/Challenge #2]
- [Detailed examination]
- [Impact on businesses/users]
- [Case example or data point]

## 5. Solutions and Strategies
- [Approach 1]
- [Approach 2]
- [Approach 3]
- [Implementation considerations]

## 6. Future Outlook
- [Emerging trends]
- [Predictions]
- [Opportunities]

## 7. Conclusion and Recommendations
- [Summary of key points]
- [Actionable recommendations]
- [Call to action]`
      },

      // Press Release template
      {
        name: "Press Release",
        formatType: "press-release",
        description: "Professional press release following AP style guidelines",
        promptTemplate: `Create a professional press release about {topic} that follows AP style guidelines and effectively communicates newsworthy information.

The press release should include:
1. A compelling headline
2. Dateline (City, State - Date)
3. Strong lead paragraph answering who, what, when, where, why
4. 2-3 body paragraphs with supporting details
5. A quote from a relevant stakeholder
6. Boilerplate company/organization description
7. Contact information placeholder

Write in the third person, use an objective tone, and follow the inverted pyramid style (most important information first). Limit the entire press release to 400-500 words.`,
        structureTemplate: `# [HEADLINE IN ALL CAPS]

## [CITY, STATE] - [Month Day, Year] - 

[First paragraph: Who, what, when, where, why - the most critical information]

[Second paragraph: Additional important details that expand on the lead]

[Third paragraph: Additional context, background, or supporting information]

"[Quote from relevant executive/stakeholder]," said [Name], [Title] at [Organization].

[Additional paragraph if needed]

### About [Organization]
[Boilerplate description - 2-3 sentences about the organization]

### Contact:
[Name]
[Title]
[Email]
[Phone]`
      },

      // Custom Format template
      {
        name: "Custom Format Template",
        formatType: "custom",
        description: "Highly customizable template for specialized content needs",
        promptTemplate: `Create content about {topic} based on the following custom specifications:

[REPLACE THIS SECTION WITH YOUR SPECIFIC REQUIREMENTS]

Some guidance to consider including in your custom instructions:
- Target audience and their level of familiarity with the topic
- Desired tone and style (formal, conversational, technical, etc.)
- Specific sections or elements to include
- Word count targets
- SEO requirements
- Calls to action
- Any industry-specific conventions to follow

The more specific your instructions, the better the results will be.`,
        structureTemplate: `# [Title]

## [Section 1]
[Content]

## [Section 2]
[Content]

## [Section 3]
[Content]

## [Conclusion]
[Content]`
      }
    ];
    
    // Save default templates
    for (const template of defaultTemplates) {
      await savePromptTemplate(template);
    }
    
    console.log('Default prompt templates initialized');
  }
}
