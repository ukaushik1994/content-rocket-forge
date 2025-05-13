
export interface OutlineSection {
  id: string;
  title: string;
  content?: string;  // Made optional since many places don't set it
  type?: 'heading' | 'subheading' | 'paragraph' | 'bullet' | 'numbered' | 'blockquote' | 'custom';  // Made optional for backward compatibility
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  expanded?: boolean;
  children?: OutlineSection[];
  metadata?: {
    source?: string;
    relevance?: number;
    keywords?: string[];
    [key: string]: any;
  };
}

export interface OutlineGenerationOptions {
  style?: 'formal' | 'conversational' | 'educational' | 'persuasive';
  depth?: 'shallow' | 'medium' | 'deep';
  structure?: 'basic' | 'detailed' | 'academic';
  includeIntroduction?: boolean;
  includeConclusion?: boolean;
  includeCallToAction?: boolean;
}
