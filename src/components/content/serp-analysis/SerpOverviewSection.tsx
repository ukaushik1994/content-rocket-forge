
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

    // Add recommendations if available
    if (serpData.recommendations && serpData.recommendations.length > 0) {
      contentStrategy += `### Content Recommendations\n`;
      contentStrategy += serpData.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
      contentStrategy += `\n\n`;
    }

    // Add keywords section
    if (serpData.keywords && serpData.keywords.length > 0) {
      contentStrategy += `### Target Keywords\n`;
      contentStrategy += `Primary: ${mainKeyword}\n`;
      contentStrategy += `Secondary: ${serpData.keywords.slice(0, 5).join(', ')}\n\n`;
    }

    // Add content structure suggestion
    contentStrategy += `### Suggested Content Structure\n`;
    contentStrategy += `- Introduction (with primary keyword)\n`;
    contentStrategy += `- Main sections covering key aspects\n`;
    contentStrategy += `- FAQ section addressing common questions\n`;
    contentStrategy += `- Conclusion with call-to-action\n\n`;

    // Competition insights
    if (serpData.competitionScore !== undefined) {
      const competitionLevel = 
        serpData.competitionScore < 0.3 ? 'Low' : 
        serpData.competitionScore < 0.7 ? 'Medium' : 'High';
      
      contentStrategy += `### Competition Analysis\n`;
      contentStrategy += `- Competition Level: ${competitionLevel}\n`;
      contentStrategy += `- To stand out, focus on creating comprehensive, well-structured content with unique insights.\n\n`;
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
