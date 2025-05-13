
/**
 * Outline-related type definitions
 */

export type OutlineSectionType = 
  | 'heading' 
  | 'subheading' 
  | 'paragraph' 
  | 'bullet' 
  | 'numbered'
  | 'blockquote'
  | 'custom';

export interface OutlineSection {
  id: string;
  title: string;
  type: OutlineSectionType;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  children?: OutlineSection[];
}

export interface OutlineGenerationOptions {
  includeIntroduction: boolean;
  includeConclusion: boolean;
  headingStyle: 'question' | 'statement' | 'mixed';
  sectionsCount: number;
  depth: 'simple' | 'detailed' | 'comprehensive';
}
