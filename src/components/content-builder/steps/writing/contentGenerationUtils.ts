
import { Solution } from '@/contexts/content-builder/types/solution-types';

type PromptParams = {
  mainKeyword: string;
  contentTitle: string;
  outlineString: string;
  secondaryKeywords: string;
  selectedSolution: Solution | null;
  additionalInstructions?: string;
  selectedCountries?: string[];
};

export const generatePrompt = ({
  mainKeyword,
  contentTitle,
  outlineString,
  secondaryKeywords,
  selectedSolution,
  additionalInstructions,
  selectedCountries = ['us']
}: PromptParams): string => {
  // Build country-specific instructions
  const countryInstructions = selectedCountries.length > 0 
    ? `Optimize this content for the following regions: ${selectedCountries.join(', ').toUpperCase()}. 
      Consider regional language preferences, spellings, and search trends.`
    : '';

  return `
    Write comprehensive, high-quality content for an article about "${mainKeyword}".
    
    Title: ${contentTitle}
    Primary Keyword: ${mainKeyword}
    ${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
    
    Use this outline structure:
    ${outlineString}
    
    ${selectedSolution ? `This content should mention the solution "${selectedSolution.name}" and highlight these features: ${selectedSolution.features.slice(0,3).join(', ')}.` : ''}
    
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
    
    ${countryInstructions}
    
    Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
    Include a compelling introduction and a strong conclusion. 
    Optimize the content for readability and search engines.
  `;
};
