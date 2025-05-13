
import { v4 as uuid } from 'uuid';

export interface OutlineSection {
  id: string;
  title: string;
  level: number;
  parent?: string;
  children?: string[];
  content?: string;
}

export const createOutlineSection = (title: string, level: number = 1): OutlineSection => {
  return {
    id: uuid(),
    title,
    level
  };
};

export type OutlineFormat = 'basic' | 'hierarchical' | 'clustered';
