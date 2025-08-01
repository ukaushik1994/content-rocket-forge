
import { ContentTemplate } from '@/contexts/ContentTemplatesContext';
import { sendChatRequest } from './aiService';
import { toast } from 'sonner';

export class TemplateService {
  private defaultTemplates: ContentTemplate[] = [
    {
      id: '1',
      name: 'Blog Post Template',
      description: 'Comprehensive blog post structure with introduction, main points, and conclusion',
      category: 'blog',
      structure: 'Title\nIntroduction\nMain Point 1\nMain Point 2\nMain Point 3\nConclusion\nCall to Action',
      promptTemplate: 'Write a comprehensive blog post about {topic}. Target keyword: {keyword}. Structure: {structure}. Word count: {wordCount}.',
      variables: ['topic', 'keyword', 'structure', 'wordCount'],
      isCustom: false,
      createdAt: new Date(),
      usage: 0
    },
    {
      id: '2',
      name: 'Landing Page Copy',
      description: 'High-converting landing page template with headline, benefits, and CTA',
      category: 'landing-page',
      structure: 'Headline\nSubheadline\nProblem Statement\nSolution\nBenefits\nFeatures\nTestimonials\nCTA',
      promptTemplate: 'Create compelling landing page copy for {product}. Target audience: {audience}. Key benefit: {benefit}.',
      variables: ['product', 'audience', 'benefit'],
      isCustom: false,
      createdAt: new Date(),
      usage: 0
    },
    {
      id: '3',
      name: 'Social Media Post',
      description: 'Engaging social media content with hook, value, and call-to-action',
      category: 'social-media',
      structure: 'Hook\nValue Proposition\nKey Points\nCall to Action\nHashtags',
      promptTemplate: 'Create a {platform} post about {topic}. Tone: {tone}. Include relevant hashtags.',
      variables: ['platform', 'topic', 'tone'],
      isCustom: false,
      createdAt: new Date(),
      usage: 0
    },
    {
      id: '4',
      name: 'Email Newsletter',
      description: 'Newsletter template with subject line, content blocks, and engagement elements',
      category: 'email',
      structure: 'Subject Line\nPersonalized Greeting\nMain Content\nValue Addition\nCall to Action\nFooter',
      promptTemplate: 'Write an email newsletter about {topic}. Audience: {audience}. Goal: {goal}.',
      variables: ['topic', 'audience', 'goal'],
      isCustom: false,
      createdAt: new Date(),
      usage: 0
    },
    {
      id: '5',
      name: 'Product Description',
      description: 'Converting product descriptions with features, benefits, and specifications',
      category: 'ecommerce',
      structure: 'Product Title\nKey Features\nBenefits\nTechnical Specs\nUsage Instructions\nWarranty/Support',
      promptTemplate: 'Write a product description for {product}. Target customer: {customer}. Key features: {features}.',
      variables: ['product', 'customer', 'features'],
      isCustom: false,
      createdAt: new Date(),
      usage: 0
    }
  ];

  getDefaultTemplates(): ContentTemplate[] {
    return [...this.defaultTemplates];
  }

  getTemplateCategories(): string[] {
    return ['all', 'blog', 'landing-page', 'social-media', 'email', 'ecommerce', 'custom'];
  }

  filterTemplates(
    templates: ContentTemplate[], 
    category: string, 
    searchQuery: string
  ): ContentTemplate[] {
    let filtered = templates;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(template => template.category === category);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  async generateContent(
    template: ContentTemplate, 
    variables: Record<string, string>
  ): Promise<string> {
    try {
      // Replace variables in prompt template
      let prompt = template.promptTemplate;
      Object.entries(variables).forEach(([key, value]) => {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      // Add structure information
      const structureInfo = template.structure 
        ? `\n\nUse this structure:\n${template.structure}` 
        : '';

      const response = await sendChatRequest('openai', {
        messages: [
          {
            role: 'system',
            content: `You are an expert content writer. Create high-quality content following the provided template structure and requirements.`
          },
          {
            role: 'user',
            content: prompt + structureInfo
          }
        ]
      });

      if (response?.choices?.[0]?.message?.content) {
        return response.choices[0].message.content;
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error('Content generation error:', error);
      toast.error('Failed to generate content');
      throw error;
    }
  }

  createCustomTemplate(templateData: Partial<ContentTemplate>): ContentTemplate {
    const newTemplate: ContentTemplate = {
      id: Date.now().toString(),
      name: templateData.name || 'Custom Template',
      description: templateData.description || '',
      category: 'custom',
      structure: templateData.structure || '',
      promptTemplate: templateData.promptTemplate || '',
      variables: templateData.variables || [],
      isCustom: true,
      createdAt: new Date(),
      usage: 0
    };

    return newTemplate;
  }

  extractVariables(promptTemplate: string): string[] {
    const matches = promptTemplate.match(/{([^}]+)}/g);
    if (!matches) return [];
    
    return matches.map(match => match.slice(1, -1)).filter((value, index, self) => 
      self.indexOf(value) === index
    );
  }

  getTemplateRecommendations(keyword: string, serpData: any): ContentTemplate[] {
    // Analyze SERP data to recommend templates
    const recommendations: ContentTemplate[] = [];
    
    if (serpData?.topResults) {
      // Analyze top results to suggest template types
      const hasListContent = serpData.topResults.some((result: any) => 
        result.title.toLowerCase().includes('best') || 
        result.title.toLowerCase().includes('top')
      );
      
      if (hasListContent) {
        recommendations.push(this.defaultTemplates.find(t => t.id === '1') as ContentTemplate);
      }

      // Add more recommendation logic based on SERP analysis
    }

    return recommendations;
  }
}

export const templateService = new TemplateService();
