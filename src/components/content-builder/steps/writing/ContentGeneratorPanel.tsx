
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Clipboard, Users, Code } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const ContentGeneratorPanel: React.FC = () => {
  const { state, setContent } = useContentBuilder();
  const { mainKeyword, contentTitle, outline } = state;

  const generateTemplate = (type: string) => {
    // Generate a basic template based on the outline
    let template = '';
    const title = contentTitle || `Complete Guide to ${mainKeyword}`;

    switch (type) {
      case 'blog':
        template = `# ${title}

## Introduction
An engaging introduction about ${mainKeyword} that hooks the reader and outlines what they'll learn.

${outline.map((section, index) => `## ${section}
Key insights and information about "${section}" with practical examples and actionable advice.

`).join('')}
## Conclusion
A summary of the key points covered about ${mainKeyword}, with final thoughts and a call to action.
`;
        break;
        
      case 'guide':
        template = `# The Ultimate ${title}

## What You'll Learn
This comprehensive guide will teach you everything you need to know about ${mainKeyword}.

${outline.map((section, index) => `## ${section}
Detailed explanation and step-by-step instructions for this section.

### Key Points:
- Important point about ${section}
- Another crucial aspect to understand
- Practical application tip

`).join('')}
## Next Steps
Now that you understand ${mainKeyword}, here's what you should do next to apply this knowledge.
`;
        break;
        
      case 'technical':
        template = `# Technical Documentation: ${title}

\`\`\`
Status: Draft
Last Updated: ${new Date().toLocaleDateString()}
\`\`\`

## Overview
Technical specifications and implementation details for ${mainKeyword}.

${outline.map((section, index) => `## ${section}
Technical details, specifications, and implementation guidance.

\`\`\`
// Example code or configuration
const ${mainKeyword.replace(/\s+/g, '')} = {
  configuration: {
    option1: true,
    option2: false
  }
};
\`\`\`

`).join('')}
## References
- Technical documentation
- API specifications
- Implementation guides
`;
        break;
        
      default:
        template = `# ${title}

${outline.map((section, index) => `## ${section}
Content for ${section}

`).join('')}`;
    }

    setContent(template);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} template applied`);
  };

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-sm font-medium">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Content Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground">
          Choose a template to quickly generate content based on your outline.
        </p>
        
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => generateTemplate('blog')}
          >
            <FileText className="h-4 w-4 mr-2 text-neon-purple" />
            Blog Post Template
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => generateTemplate('guide')}
          >
            <Clipboard className="h-4 w-4 mr-2 text-neon-blue" />
            How-to Guide Template
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => generateTemplate('technical')}
          >
            <Code className="h-4 w-4 mr-2 text-green-500" />
            Technical Doc Template
          </Button>
        </div>
        
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Templates provide a starting structure that you can customize.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
