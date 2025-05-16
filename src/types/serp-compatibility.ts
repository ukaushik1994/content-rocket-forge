
import { SerpAnalysisResult as OriginalSerpAnalysisResult, SerpSearchParams } from './serp';
import { SerpAnalysisResult as NewSerpAnalysisResult } from '@/services/serp/types';

// This is a compatibility layer to ensure that we can use both types
export type { SerpSearchParams };
export type SerpAnalysisResult = OriginalSerpAnalysisResult;

// This function converts from the new type format to the original type format
export function convertSerpTypes(data: NewSerpAnalysisResult): OriginalSerpAnalysisResult {
  // Ensure all properties match the expected types in OriginalSerpAnalysisResult
  
  // Create a properly typed contentGaps array with required description field
  const contentGaps = data.contentGaps?.map(gap => ({
    topic: gap.topic,
    description: gap.description || "", // Ensure description is never undefined
    recommendation: undefined,
    content: undefined,
    opportunity: undefined,
    source: undefined
  })) || [];

  // Similarly for other fields that need conversion
  const topResults = data.topResults?.map(result => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet || "", // Ensure snippet is never undefined
    position: result.position,
    country: result.country
  })) || [];

  const peopleAlsoAsk = data.peopleAlsoAsk?.map(item => ({
    question: item.question,
    source: item.source || "", // Ensure source is never undefined
    answer: item.answer
  })) || [];

  const headings = data.headings?.map(heading => ({
    text: heading.text,
    level: heading.level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
    subtext: heading.subtext,
    type: heading.type
  })) || [];
  
  // Return a fully typed object that matches OriginalSerpAnalysisResult
  return {
    ...data,
    topResults,
    peopleAlsoAsk,
    headings,
    contentGaps
  } as unknown as OriginalSerpAnalysisResult;
}
