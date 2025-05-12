
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

  // Build solution-specific instructions if a solution is selected
  let solutionInstructions = '';
  if (selectedSolution) {
    solutionInstructions = `
    This content should highlight and promote "${selectedSolution.name}" as a solution. 
    
    Key features to emphasize:
    ${selectedSolution.features.slice(0, 5).map(feature => `- ${feature}`).join('\n')}
    
    Target audience:
    ${selectedSolution.targetAudience ? selectedSolution.targetAudience.map(audience => `- ${audience}`).join('\n') : '- General audience'}
    
    Pain points to address:
    ${selectedSolution.painPoints ? selectedSolution.painPoints.map(pain => `- ${pain}`).join('\n') : '- General needs in this area'}
    
    Include at least one persuasive call-to-action related to ${selectedSolution.name}.
    Naturally integrate the solution within the content without making it feel like an advertisement.
    `;
  }

  return `
    Write comprehensive, high-quality content for an article about "${mainKeyword}".
    
    Title: ${contentTitle}
    Primary Keyword: ${mainKeyword}
    ${secondaryKeywords ? `Secondary Keywords: ${secondaryKeywords}` : ''}
    
    Use this outline structure:
    ${outlineString}
    
    ${solutionInstructions}
    
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
    
    ${countryInstructions}
    
    Format the content using Markdown syntax, with proper headings, paragraphs, and emphasis. 
    Include a compelling introduction and a strong conclusion. 
    Optimize the content for readability and search engines.
  `;
};
