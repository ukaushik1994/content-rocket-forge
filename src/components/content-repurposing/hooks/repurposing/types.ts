
export interface GeneratedContentFormat {
  content: string;
  formatId: string;
  contentId: string;
  title: string;
}

export interface RepurposedContentMap {
  [formatId: string]: string;
}
