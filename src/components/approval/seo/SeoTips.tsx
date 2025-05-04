
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeoTipsProps {
  content: ContentItemType;
}

export const SeoTips: React.FC<SeoTipsProps> = ({ content }) => {
  const seoTips = generateSeoTips(content);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>SEO Improvement Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {seoTips.map((tip, index) => (
            <li 
              key={index}
              className="flex items-start gap-2"
            >
              {tip.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className={cn(
                  "h-5 w-5 mt-0.5 flex-shrink-0",
                  tip.status === 'warning' ? 'text-amber-500' : 'text-red-500'
                )} />
              )}
              <div>
                <p className="font-medium">{tip.title}</p>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

// Helper function to generate SEO tips based on content
function generateSeoTips(content: ContentItemType) {
  const tips = [];
  const text = content.content || '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Check for title
  if (content.title && content.title.length > 0) {
    tips.push({
      title: 'Page Title',
      description: 'Your content has a title. Make sure it includes your primary keyword.',
      status: 'success'
    });
  } else {
    tips.push({
      title: 'Missing Page Title',
      description: 'Add a descriptive title that includes your primary keyword.',
      status: 'error'
    });
  }
  
  // Check for headings
  const hasHeadings = /^#+\s.+/gm.test(text);
  if (hasHeadings) {
    tips.push({
      title: 'Headings Structure',
      description: 'Your content includes headings, which improves readability and SEO.',
      status: 'success'
    });
  } else {
    tips.push({
      title: 'Missing Headings',
      description: 'Add headings (H2, H3) to structure your content and include keywords in them.',
      status: 'warning'
    });
  }
  
  // Check for content length
  if (wordCount >= 600) {
    tips.push({
      title: 'Content Length',
      description: 'Your content has a good length, which helps with SEO ranking.',
      status: 'success'
    });
  } else {
    tips.push({
      title: 'Short Content',
      description: 'Add more content to reach at least 600 words for better SEO performance.',
      status: 'warning'
    });
  }
  
  // Check for keywords
  if (content.keywords && content.keywords.length > 0) {
    tips.push({
      title: 'Keywords',
      description: 'You have defined keywords. Make sure they are used naturally throughout the content.',
      status: 'success'
    });
  } else {
    tips.push({
      title: 'Missing Keywords',
      description: 'Define target keywords to optimize your content for search engines.',
      status: 'error'
    });
  }
  
  // Check for images (look for markdown image syntax)
  const hasImages = /!\[.*\]\(.*\)/g.test(text);
  if (hasImages) {
    tips.push({
      title: 'Images',
      description: 'Your content includes images. Make sure they have descriptive alt text.',
      status: 'success'
    });
  } else {
    tips.push({
      title: 'No Images',
      description: 'Add relevant images with descriptive alt text to enhance your content.',
      status: 'warning'
    });
  }
  
  return tips;
}
