
/**
 * Outline type definitions
 */

export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  content?: string;
  children?: OutlineSection[];
  subsections?: OutlineSection[];
}
