import { GeneratedImageVisualData } from '@/types/enhancedChat';

export interface GeneratedContentFormat {
  content: string;
  formatId: string;
  contentId: string;
  title: string;
  generatedImages?: GeneratedImageVisualData[];
}

export interface RepurposedContentMap {
  [formatId: string]: string;
}
