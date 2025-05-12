
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentType, ContentFormat, ContentIntent } from '@/contexts/content-builder/types/content-types';
import { ContentTypeCard } from './content-type/ContentTypeCard';
import { ContentFormatCard } from './content-type/ContentFormatCard';
import { ContentIntentCard } from './content-type/ContentIntentCard';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronRight } from 'lucide-react';

export const ContentTypeStep = () => {
  const { state, setContentType, setContentFormat, setContentIntent, navigateToStep } = useContentBuilder();
  const { contentType, contentFormat, contentIntent } = state;
  const [selectedType, setSelectedType] = useState<string>(contentType || ContentType.BLOG_POST);
  const [selectedFormat, setSelectedFormat] = useState<string>(contentFormat || ContentFormat.ARTICLE);
  const [selectedIntent, setSelectedIntent] = useState<string>(contentIntent || ContentIntent.INFORM);

  const contentTypes = [
    { 
      id: ContentType.BLOG_POST, 
      title: 'Blog Post', 
      description: 'Informative and engaging content to attract and educate your audience',
      icon: '📝' 
    },
    { 
      id: ContentType.LANDING_PAGE, 
      title: 'Landing Page', 
      description: 'Focused content designed to convert visitors into leads or customers',
      icon: '🌐' 
    },
    { 
      id: ContentType.PRODUCT_DESCRIPTION, 
      title: 'Product Description', 
      description: 'Compelling content that highlights features and benefits of your product',
      icon: '📦' 
    },
    { 
      id: ContentType.ARTICLE, 
      title: 'Article', 
      description: 'Longer in-depth content to establish authority in your field',
      icon: '📰' 
    },
    { 
      id: ContentType.EMAIL, 
      title: 'Email', 
      description: 'Targeted content for email marketing campaigns',
      icon: '📧' 
    },
    { 
      id: ContentType.SOCIAL_POST, 
      title: 'Social Post', 
      description: 'Shareable content for social media platforms',
      icon: '💬' 
    }
  ];

  const contentFormats = [
    { 
      id: ContentFormat.ARTICLE, 
      title: 'Standard Article', 
      description: 'Traditional article format with paragraphs and headings',
      icon: '📄' 
    },
    { 
      id: ContentFormat.LISTICLE, 
      title: 'Listicle', 
      description: 'Content organized as a numbered or bulleted list',
      icon: '🔢' 
    },
    { 
      id: ContentFormat.HOW_TO, 
      title: 'How-To Guide', 
      description: 'Step-by-step instructions for completing a task',
      icon: '🔧' 
    },
    { 
      id: ContentFormat.COMPARISON, 
      title: 'Comparison', 
      description: 'Evaluating multiple items, services or concepts side by side',
      icon: '⚖️' 
    },
    { 
      id: ContentFormat.CASE_STUDY, 
      title: 'Case Study', 
      description: 'Detailed analysis of a specific subject or example',
      icon: '🔍' 
    },
    { 
      id: ContentFormat.OPINION, 
      title: 'Opinion/Editorial', 
      description: 'Subjective content that presents a personal viewpoint',
      icon: '💭' 
    }
  ];

  const contentIntents = [
    { 
      id: ContentIntent.INFORM, 
      title: 'Inform', 
      description: 'Educate your audience about a topic',
      icon: '📚' 
    },
    { 
      id: ContentIntent.CONVERT, 
      title: 'Convert', 
      description: 'Persuade the reader to take a specific action',
      icon: '🎯' 
    },
    { 
      id: ContentIntent.ENTERTAIN, 
      title: 'Entertain', 
      description: 'Engage and amuse your audience',
      icon: '🎭' 
    },
    { 
      id: ContentIntent.EDUCATE, 
      title: 'Educate', 
      description: 'Provide detailed knowledge or training',
      icon: '🎓' 
    },
    { 
      id: ContentIntent.INSPIRE, 
      title: 'Inspire', 
      description: 'Motivate your audience to feel or do something',
      icon: '✨' 
    }
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };

  const handleIntentSelect = (intentId: string) => {
    setSelectedIntent(intentId);
  };

  const handleContinue = () => {
    // Save the selected values to context
    setContentType(selectedType);
    setContentFormat(selectedFormat);
    setContentIntent(selectedIntent);
    
    // Navigate to next step
    navigateToStep(state.currentStep + 1);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Content Type</h2>
        <p className="text-muted-foreground">
          Choose the type, format, and intent for your content piece
        </p>
      </div>
      
      {/* Content Type Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3">Type of Content</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentTypes.map(type => (
            <ContentTypeCard
              key={type.id}
              title={type.title}
              description={type.description}
              icon={type.icon}
              selected={selectedType === type.id}
              onClick={() => handleTypeSelect(type.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Content Format Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3">Content Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentFormats.map(format => (
            <ContentFormatCard
              key={format.id}
              title={format.title}
              description={format.description}
              icon={format.icon}
              selected={selectedFormat === format.id}
              onClick={() => handleFormatSelect(format.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Content Intent Selection */}
      <div>
        <h3 className="text-lg font-medium mb-3">Content Goal/Intent</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentIntents.map(intent => (
            <ContentIntentCard
              key={intent.id}
              title={intent.title}
              description={intent.description}
              icon={intent.icon}
              selected={selectedIntent === intent.id}
              onClick={() => handleIntentSelect(intent.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleContinue}
          className="min-w-[160px] bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
        >
          <span>Continue</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
