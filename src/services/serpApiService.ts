
// This file is kept for backwards compatibility
// It re-exports everything from the new modular structure
export * from './serp';

// For any code that imports SerpAnalysisResult directly from here
import { SerpAnalysisResult } from './serp/types';
export type { SerpAnalysisResult };
