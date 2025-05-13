
export interface DocumentHeading {
  level: number;
  text: string;
  id?: string;
}

export interface DocumentStructure {
  h1: DocumentHeading[];
  h2: DocumentHeading[];
  h3: DocumentHeading[];
  h4: DocumentHeading[];
  h5: DocumentHeading[];
  h6: DocumentHeading[];
  paragraphs: string[];
  images: string[];
  links: {
    url: string;
    text: string;
    isExternal: boolean;
  }[];
  lists: {
    type: 'ordered' | 'unordered';
    items: string[];
  }[];
  tables: any[];
  wordCount: number;
  headings: DocumentHeading[];
  hasSingleH1: boolean;
  hasLogicalHierarchy: boolean;
}
