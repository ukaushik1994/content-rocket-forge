
export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  content?: string;
  type?: string;
  children?: OutlineSection[];
}
