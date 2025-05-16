
import { SerpAnalysisResult as OriginalSerpAnalysisResult, SerpSearchParams } from './serp';
import { SerpAnalysisResult as NewSerpAnalysisResult } from '@/services/serp/types';

// This is a compatibility layer to ensure that we can use both types
export type { SerpSearchParams };
export type SerpAnalysisResult = OriginalSerpAnalysisResult;

// This function can be used to convert between the two types if needed
export function convertSerpTypes(data: NewSerpAnalysisResult): OriginalSerpAnalysisResult {
  // In this case, the NewSerpAnalysisResult should be compatible with OriginalSerpAnalysisResult
  // If we need to transform data in the future, we can do it here
  return data as unknown as OriginalSerpAnalysisResult;
}
