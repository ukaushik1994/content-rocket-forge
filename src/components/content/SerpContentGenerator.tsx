
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Layout,
  FileText,
  CheckSquare,
  HelpCircle,
  ListOrdered,
  Table,
  BarChart3,
} from 'lucide-react';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ContentTemplateProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const ContentTemplate = ({ title, description, icon, onClick, className }: ContentTemplateProps) => (
  <Card 
    className={cn(
      "cursor-pointer hover:border-primary transition-all hover:bg-primary/5", 
      className
    )}
    onClick={onClick}
  >
    <CardContent className="p-4 flex flex-col items-center text-center">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h5 className="font-medium">{title}</h5>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

interface SerpContentGeneratorProps {
  serpData: SerpAnalysisResult | null;
  onGenerateContent: (template: string) => void;
  mainKeyword: string;
}

export function SerpContentGenerator({ 
  serpData, 
  onGenerateContent,
  mainKeyword
}: SerpContentGeneratorProps) {
  if (!serpData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Run a SERP analysis first to generate content templates
        </p>
      </div>
    );
  }

  const generateFeaturedSnippetTemplate = () => {
    if (!serpData.featuredSnippets || serpData.featuredSnippets.length === 0) {
      toast.error("No featured snippet data available");
      return;
    }

    const snippet = serpData.featuredSnippets[0];
    
    let template = `# The Ultimate Guide to ${mainKeyword}\n\n`;
    
    if (snippet.type === 'definition') {
      template += `## What is ${mainKeyword}?\n\n${snippet.content}\n\n`;
      template += `## Why ${mainKeyword} Matters\n\n[Explain why this topic is important...]\n\n`;
    } else if (snippet.type === 'list') {
      template += `## Essential Steps for ${mainKeyword}\n\n${snippet.content}\n\n`;
      template += `## Detailed Breakdown\n\n[Expand on each point from the list with details...]\n\n`;
    } else {
      template += `## Understanding ${mainKeyword}\n\n${snippet.content}\n\n`;
    }
    
    template += `## Key Benefits\n\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\n`;
    template += `## Conclusion\n\n[Summarize the main points...]\n\n`;
    
    onGenerateContent(template);
    toast.success("Featured snippet template created!");
  };

  const generateListArticleTemplate = () => {
    const relatedTopics = serpData.relatedSearches?.map(item => item.query) || [];
    
    let template = `# Top 10 ${mainKeyword} Solutions in 2025\n\n`;
    template += `## Introduction\n\n[Introduce the concept of ${mainKeyword} and why it matters...]\n\n`;
    
    // Add list items
    for (let i = 1; i <= 10; i++) {
      template += `## ${i}. [Solution Name]\n\n`;
      template += `### Key Features:\n- Feature 1\n- Feature 2\n- Feature 3\n\n`;
      template += `### Pricing: [Price details]\n\n`;
      template += `### Best For: [Target audience]\n\n`;
    }
    
    // Add comparison table
    template += `## Comparison Table\n\n`;
    template += `| Solution | Key Feature | Price | Best For |\n`;
    template += `| --- | --- | --- | --- |\n`;
    template += `| Solution 1 | Feature | $XX | Audience |\n`;
    template += `| Solution 2 | Feature | $XX | Audience |\n\n`;
    
    // Add FAQ using People Also Ask
    if (serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) {
      template += `## Frequently Asked Questions\n\n`;
      serpData.peopleAlsoAsk.forEach(item => {
        template += `### ${item.question}\n\n[Your answer...]\n\n`;
      });
    }
    
    // Add related topics
    if (relatedTopics.length > 0) {
      template += `## Related Topics\n\n`;
      relatedTopics.slice(0, 3).forEach(topic => {
        template += `- ${topic}\n`;
      });
      template += `\n`;
    }
    
    template += `## Conclusion\n\n[Summarize key takeaways and provide a final recommendation...]\n\n`;
    
    onGenerateContent(template);
    toast.success("List article template created!");
  };

  const generateHowToGuideTemplate = () => {
    const questions = serpData.peopleAlsoAsk?.map(item => item.question) || [];
    
    let template = `# How to Master ${mainKeyword}: Step-by-Step Guide\n\n`;
    template += `## Introduction\n\n[Explain the importance of ${mainKeyword} and what readers will learn...]\n\n`;
    template += `## Prerequisites\n\n- Required item/knowledge 1\n- Required item/knowledge 2\n\n`;
    
    // Add steps
    template += `## Step 1: Getting Started\n\n[Detailed explanation of the first step...]\n\n`;
    template += `## Step 2: [Second Step Name]\n\n[Detailed explanation...]\n\n`;
    template += `## Step 3: [Third Step Name]\n\n[Detailed explanation...]\n\n`;
    template += `## Step 4: [Fourth Step Name]\n\n[Detailed explanation...]\n\n`;
    template += `## Step 5: [Fifth Step Name]\n\n[Detailed explanation...]\n\n`;
    
    // Add troubleshooting
    template += `## Common Issues and Troubleshooting\n\n`;
    template += `### Issue 1: [Common Problem]\n\n[Solution...]\n\n`;
    template += `### Issue 2: [Common Problem]\n\n[Solution...]\n\n`;
    
    // Add FAQ using People Also Ask
    if (questions.length > 0) {
      template += `## Frequently Asked Questions\n\n`;
      questions.forEach(question => {
        template += `### ${question}\n\n[Your answer...]\n\n`;
      });
    }
    
    template += `## Conclusion\n\n[Summarize the guide and next steps...]\n\n`;
    
    onGenerateContent(template);
    toast.success("How-to guide template created!");
  };

  const generateComparisonTemplate = () => {
    let template = `# ${mainKeyword} Comparison: Which Option Is Best in 2025?\n\n`;
    template += `## Introduction\n\n[Introduce the concept of ${mainKeyword} and explain the importance of choosing the right option...]\n\n`;
    
    // Add comparison sections
    template += `## Methodology\n\n[Explain how the comparison was conducted and what criteria were used...]\n\n`;
    
    template += `## Option 1: [First Option]\n\n`;
    template += `### Pros:\n- Advantage 1\n- Advantage 2\n- Advantage 3\n\n`;
    template += `### Cons:\n- Disadvantage 1\n- Disadvantage 2\n\n`;
    
    template += `## Option 2: [Second Option]\n\n`;
    template += `### Pros:\n- Advantage 1\n- Advantage 2\n- Advantage 3\n\n`;
    template += `### Cons:\n- Disadvantage 1\n- Disadvantage 2\n\n`;
    
    template += `## Option 3: [Third Option]\n\n`;
    template += `### Pros:\n- Advantage 1\n- Advantage 2\n- Advantage 3\n\n`;
    template += `### Cons:\n- Disadvantage 1\n- Disadvantage 2\n\n`;
    
    // Add comparison table
    template += `## Feature Comparison\n\n`;
    template += `| Feature | Option 1 | Option 2 | Option 3 |\n`;
    template += `| --- | --- | --- | --- |\n`;
    template += `| Feature 1 | ✅ | ✅ | ❌ |\n`;
    template += `| Feature 2 | ✅ | ❌ | ✅ |\n`;
    template += `| Feature 3 | ❌ | ✅ | ✅ |\n`;
    template += `| Price | $XX | $XX | $XX |\n\n`;
    
    template += `## Best For Different Use Cases\n\n`;
    template += `### Best for Beginners: [Option]\n\n[Explanation...]\n\n`;
    template += `### Best for Advanced Users: [Option]\n\n[Explanation...]\n\n`;
    template += `### Best Value for Money: [Option]\n\n[Explanation...]\n\n`;
    
    template += `## Conclusion and Recommendations\n\n[Summarize findings and provide final recommendations based on different user needs...]\n\n`;
    
    onGenerateContent(template);
    toast.success("Comparison template created!");
  };

  const generateUltimateGuideTemplate = () => {
    const keywords = serpData.keywords || [];
    const relatedTopics = serpData.relatedSearches?.map(item => item.query) || [];
    
    let template = `# The Ultimate Guide to ${mainKeyword} in 2025\n\n`;
    template += `## Introduction\n\n[Provide a comprehensive introduction to ${mainKeyword}, including its importance and relevance in 2025...]\n\n`;
    
    // Add definition section
    template += `## What is ${mainKeyword}?\n\n[Provide a clear and detailed definition...]\n\n`;
    
    // Add key concepts section
    template += `## Key Concepts You Need to Understand\n\n`;
    if (keywords.length > 0) {
      keywords.forEach((keyword, index) => {
        if (index < 5) {
          template += `### ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}\n\n[Explanation of this concept...]\n\n`;
        }
      });
    } else {
      template += `### Concept 1\n\n[Explanation...]\n\n`;
      template += `### Concept 2\n\n[Explanation...]\n\n`;
      template += `### Concept 3\n\n[Explanation...]\n\n`;
    }
    
    // Add history/evolution section
    template += `## The Evolution of ${mainKeyword}\n\n[Trace the history and development...]\n\n`;
    
    // Add best practices
    template += `## Best Practices for ${mainKeyword}\n\n`;
    template += `### Best Practice 1\n\n[Detailed explanation...]\n\n`;
    template += `### Best Practice 2\n\n[Detailed explanation...]\n\n`;
    template += `### Best Practice 3\n\n[Detailed explanation...]\n\n`;
    
    // Add case studies
    template += `## Case Studies\n\n`;
    template += `### Case Study 1: [Company/Example Name]\n\n[Detailed case study...]\n\n`;
    template += `### Case Study 2: [Company/Example Name]\n\n[Detailed case study...]\n\n`;
    
    // Add tools and resources
    template += `## Tools and Resources for ${mainKeyword}\n\n`;
    template += `### Tools\n\n- Tool 1: [Description]\n- Tool 2: [Description]\n- Tool 3: [Description]\n\n`;
    template += `### Resources\n\n- Resource 1: [Description]\n- Resource 2: [Description]\n- Resource 3: [Description]\n\n`;
    
    // Add future trends
    template += `## Future Trends in ${mainKeyword}\n\n[Discuss upcoming trends and predictions...]\n\n`;
    
    // Add related topics
    if (relatedTopics.length > 0) {
      template += `## Related Topics\n\n`;
      relatedTopics.forEach(topic => {
        template += `### ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\n[Brief explanation of how this relates to ${mainKeyword}...]\n\n`;
      });
    }
    
    // Add FAQ using People Also Ask
    if (serpData.peopleAlsoAsk && serpData.peopleAlsoAsk.length > 0) {
      template += `## Frequently Asked Questions\n\n`;
      serpData.peopleAlsoAsk.forEach(item => {
        template += `### ${item.question}\n\n[Your answer...]\n\n`;
      });
    }
    
    template += `## Conclusion\n\n[Comprehensive summary and final thoughts...]\n\n`;
    
    onGenerateContent(template);
    toast.success("Ultimate guide template created!");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium">Content Templates</h3>
      <p className="text-muted-foreground">
        Generate content templates based on SERP analysis to boost your SEO rankings.
      </p>
      
      <TooltipProvider>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="Featured Snippet" 
                  description="Optimized for position zero" 
                  icon={<FileText className="h-5 w-5 text-primary" />} 
                  onClick={generateFeaturedSnippetTemplate}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Creates content optimized to win featured snippets</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="List Article" 
                  description="Top 10 style content" 
                  icon={<ListOrdered className="h-5 w-5 text-primary" />} 
                  onClick={generateListArticleTemplate}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Creates a ranked list of items with comparisons</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="How-to Guide" 
                  description="Step-by-step tutorial" 
                  icon={<CheckSquare className="h-5 w-5 text-primary" />} 
                  onClick={generateHowToGuideTemplate}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Creates instructional content with clear steps</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="Comparison" 
                  description="Product/service comparison" 
                  icon={<Table className="h-5 w-5 text-primary" />} 
                  onClick={generateComparisonTemplate}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Creates side-by-side comparison content</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="Ultimate Guide" 
                  description="Comprehensive resource" 
                  icon={<Layout className="h-5 w-5 text-primary" />} 
                  onClick={generateUltimateGuideTemplate}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Creates a comprehensive long-form guide</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ContentTemplate 
                  title="Custom Template" 
                  description="Create your own" 
                  icon={<BarChart3 className="h-5 w-5 text-primary" />} 
                  onClick={() => {
                    toast("Coming soon!", {
                      description: "Custom template generator will be available soon."
                    });
                  }}
                  className="border-dashed"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Create a custom template (coming soon)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-2">Content Strategy Tips</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Use keywords from SERP analysis in headings (H2, H3) for better ranking</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Include related keywords throughout your content for semantic relevance</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Add a FAQ section using "People Also Ask" questions to target featured snippets</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckSquare className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Use tables, lists, and structured data to increase chances of rich snippets</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
