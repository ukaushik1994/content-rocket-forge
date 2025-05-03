import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpActionButton } from './SerpActionButton';

interface SerpOverviewSectionProps {
  serpData: SerpAnalysisResult;
  mainKeyword: string;
  expanded: boolean;
  onAddToContent: (content: string, type: string) => void;
}

export function SerpOverviewSection({
  serpData,
  mainKeyword,
  expanded,
  onAddToContent
}: SerpOverviewSectionProps) {
  if (!expanded) return null;

  const handleAddToContent = (section: string) => {
    let contentStrategy = `## Content Strategy for "${mainKeyword}"\n\n`;

    if (serpData.titleAnalysis) {
      contentStrategy += `### Title Optimization\n`;
      contentStrategy += `- **Ideal Title Length:** Aim for ${serpData.titleAnalysis.idealTitleLength} characters.\n`;
      contentStrategy += `- **Keywords in Title:** Include primary and secondary keywords naturally.\n\n`;
    }

    if (serpData.metaDescriptionAnalysis) {
      contentStrategy += `### Meta Description\n`;
      contentStrategy += `- **Description Length:** Keep it around ${serpData.metaDescriptionAnalysis.idealDescriptionLength} characters.\n`;
      contentStrategy += `- **Call to Action:** Add a compelling call to action to improve click-through rate.\n\n`;
    }

    if (serpData.contentOutline) {
      contentStrategy += `### Content Outline\n`;
      contentStrategy += `Here's a suggested content outline based on top-ranking pages:\n`;
      serpData.contentOutline.forEach((outline, index) => {
        contentStrategy += `${index + 1}. ${outline}\n`;
      });
      contentStrategy += `\n`;
    }

    onAddToContent(contentStrategy, section);
    toast.success('Added content strategy to the content builder!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
    
    <div className="flex flex-col gap-3 mt-4">
      
      
      <SerpActionButton
        onClick={() => handleAddToContent('content-strategy')}
        variant="outline"
        icon={<Sparkles className="h-4 w-4 mr-2" />}
        actionType="add"
      >
        Add Content Strategy
      </SerpActionButton>
      
      
    </div>
    
    </motion.div>
  );
}
