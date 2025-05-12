import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentType, ContentFormat, ContentIntent } from '@/contexts/content-builder/types/content-types';
import { ContentTypeCard } from './content-type/ContentTypeCard';
import { ContentFormatCard } from './content-type/ContentFormatCard';
import { ContentIntentCard } from './content-type/ContentIntentCard';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SolutionSelection } from './solutions/SolutionSelection';
import { toast } from 'sonner';

const contentTypes = [
  {
    type: ContentType.BLOG_POST,
    title: 'Blog Post',
    description: 'Create an engaging article for your blog',
    icon: '📝'
  },
  {
    type: ContentType.ARTICLE,
    title: 'Article',
    description: 'In-depth informative content with research',
    icon: '📚'
  },
  {
    type: ContentType.LANDING_PAGE,
    title: 'Landing Page',
    description: 'High-converting page focused on a CTA',
    icon: '🚀'
  },
  {
    type: ContentType.PRODUCT_PAGE,
    title: 'Product Page',
    description: 'Showcase your product features and benefits',
    icon: '🛍️'
  },
  {
    type: ContentType.EMAIL,
    title: 'Email',
    description: 'Engaging email content for campaigns',
    icon: '📧'
  },
  {
    type: ContentType.SOCIAL_POST,
    title: 'Social Post',
    description: 'Content optimized for social media platforms',
    icon: '📱'
  }
];

const contentFormats = [
  {
    format: ContentFormat.ARTICLE,
    title: 'Article',
    description: 'Standard article format with paragraphs and sections',
    icon: '📄'
  },
  {
    format: ContentFormat.LISTICLE,
    title: 'Listicle',
    description: 'Content organized in a numbered list format',
    icon: '🔢'
  },
  {
    format: ContentFormat.HOW_TO,
    title: 'How-to Guide',
    description: 'Step-by-step instructions for processes or tasks',
    icon: '🔍'
  },
  {
    format: ContentFormat.COMPARISON,
    title: 'Comparison',
    description: 'Side-by-side analysis of different options',
    icon: '⚖️'
  },
  {
    format: ContentFormat.CASE_STUDY,
    title: 'Case Study',
    description: 'In-depth examination of a specific example',
    icon: '🔬'
  },
  {
    format: ContentFormat.INTERVIEW,
    title: 'Interview',
    description: 'Q&A style format with expert insights',
    icon: '🎙️'
  }
];

const contentIntents = [
  {
    intent: ContentIntent.INFORM,
    title: 'Inform',
    description: 'Educate your audience with valuable information',
    icon: '📚'
  },
  {
    intent: ContentIntent.PERSUADE,
    title: 'Persuade',
    description: 'Convince your audience to take a specific action',
    icon: '🎯'
  },
  {
    intent: ContentIntent.ENTERTAIN,
    title: 'Entertain',
    description: 'Engage your audience with interesting content',
    icon: '🎭'
  },
  {
    intent: ContentIntent.CONVERT,
    title: 'Convert',
    description: 'Turn visitors into leads or customers',
    icon: '💰'
  }
];

export const ContentTypeStep = () => {
  const { state, setContentType, setContentFormat, setContentIntent, navigateToStep } = useContentBuilder();
  const [activeTab, setActiveTab] = useState('content-type');
  const [selectedType, setSelectedType] = useState(state.contentType || '');
  const [selectedFormat, setSelectedFormat] = useState(state.contentFormat || '');
  const [selectedIntent, setSelectedIntent] = useState(state.contentIntent || '');
  
  const handleContinue = () => {
    if (!selectedType) {
      toast.error('Please select a content type');
      return;
    }
    
    if (!selectedFormat) {
      toast.error('Please select a content format');
      return;
    }
    
    if (!selectedIntent) {
      toast.error('Please select a content intent');
      return;
    }
    
    // Save selections to context - cast to proper enum types
    setContentType(selectedType as ContentType);
    setContentFormat(selectedFormat as ContentFormat);
    setContentIntent(selectedIntent as ContentIntent);
    
    // Mark step as completed and go to the next step
    navigateToStep(2);
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="content-type" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="content-type">Content Type</TabsTrigger>
          <TabsTrigger value="content-format">Content Format</TabsTrigger>
          <TabsTrigger value="content-intent">Content Intent</TabsTrigger>
          <TabsTrigger value="solution">Solution Integration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content-type" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((item) => (
              <ContentTypeCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                selected={selectedType === item.type}
                onClick={() => setSelectedType(item.type)}
              />
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => setActiveTab('content-format')}
              disabled={!selectedType}
            >
              Next: Format
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="content-format" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentFormats.map((item) => (
              <ContentFormatCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                selected={selectedFormat === item.format}
                onClick={() => setSelectedFormat(item.format)}
              />
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('content-type')}
            >
              Back
            </Button>
            <Button 
              onClick={() => setActiveTab('content-intent')}
              disabled={!selectedFormat}
            >
              Next: Intent
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="content-intent" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIntents.map((item) => (
              <ContentIntentCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                selected={selectedIntent === item.intent}
                onClick={() => setSelectedIntent(item.intent)}
              />
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('content-format')}
            >
              Back
            </Button>
            <Button 
              onClick={() => setActiveTab('solution')}
              disabled={!selectedIntent}
            >
              Next: Solution
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="solution" className="mt-6">
          <SolutionSelection 
            selectedSolution={state.selectedSolution}
            onSolutionSelect={(solution) => state.dispatch({ type: 'SELECT_SOLUTION', payload: solution })}
          />
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('content-intent')}
            >
              Back
            </Button>
            <Button 
              onClick={handleContinue}
            >
              Continue
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
