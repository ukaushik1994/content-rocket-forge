import { v4 as uuidv4 } from 'uuid';
import {
  Type, Image, MousePointerClick, Minus, ArrowUpDown,
  Columns, Share2, FileText, Play, Heading
} from 'lucide-react';

export type BlockType =
  | 'header' | 'text' | 'image' | 'button' | 'divider'
  | 'spacer' | 'columns' | 'social' | 'footer' | 'video';

export interface EmailBlock {
  id: string;
  type: BlockType;
  props: Record<string, any>;
  order: number;
  locked?: boolean;
  hidden?: boolean;
}

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: any;
  category: 'content' | 'layout' | 'social';
  defaultProps: Record<string, any>;
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    icon: Heading,
    category: 'content',
    defaultProps: {
      text: 'Your Heading',
      alignment: 'center',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      logoUrl: '',
      fontSize: 28,
      paddingX: 24,
      paddingY: 32,
      gradientEnabled: false,
      gradientEndColor: '#3b82f6',
      gradientDirection: '135deg',
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
    },
  },
  {
    type: 'text',
    label: 'Text',
    icon: Type,
    category: 'content',
    defaultProps: {
      content: 'Write your content here. You can use <b>bold</b>, <i>italic</i>, and other HTML formatting.',
      fontSize: 16,
      textColor: '#333333',
      alignment: 'left',
      lineHeight: 1.6,
      paddingX: 24,
      paddingY: 12,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    category: 'content',
    defaultProps: {
      url: '',
      alt: 'Image',
      width: '100%',
      linkUrl: '',
      alignment: 'center',
      paddingX: 24,
      paddingY: 12,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderRadius: 0,
      borderStyle: 'solid',
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: MousePointerClick,
    category: 'content',
    defaultProps: {
      text: 'Click Here',
      url: '#',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderRadius: 6,
      alignment: 'center',
      paddingX: 32,
      paddingY: 14,
      fontSize: 16,
      gradientEnabled: false,
      gradientEndColor: '#8b5cf6',
      gradientDirection: '135deg',
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'layout',
    defaultProps: {
      color: '#e2e8f0',
      thickness: 1,
      marginY: 20,
      paddingX: 24,
      width: '100%',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: ArrowUpDown,
    category: 'layout',
    defaultProps: {
      height: 32,
    },
  },
  {
    type: 'columns',
    label: 'Columns',
    icon: Columns,
    category: 'layout',
    defaultProps: {
      columnCount: 2,
      columns: [
        { content: '<p>Column 1 content</p>' },
        { content: '<p>Column 2 content</p>' },
      ],
      gap: 16,
      paddingX: 24,
      paddingY: 12,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
    },
  },
  {
    type: 'social',
    label: 'Social Links',
    icon: Share2,
    category: 'social',
    defaultProps: {
      platforms: [
        { name: 'Twitter', url: '#', enabled: true },
        { name: 'LinkedIn', url: '#', enabled: true },
        { name: 'Facebook', url: '#', enabled: true },
        { name: 'Instagram', url: '#', enabled: false },
      ],
      alignment: 'center',
      iconStyle: 'filled',
      paddingX: 24,
      paddingY: 16,
    },
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: FileText,
    category: 'social',
    defaultProps: {
      companyName: 'Your Company',
      address: '123 Main St, City, State 12345',
      unsubscribeText: 'Unsubscribe',
      textColor: '#999999',
      fontSize: 12,
      paddingX: 24,
      paddingY: 24,
    },
  },
  {
    type: 'video',
    label: 'Video',
    icon: Play,
    category: 'content',
    defaultProps: {
      thumbnailUrl: 'https://placehold.co/600x340/1e293b/94a3b8?text=▶+Play+Video',
      videoUrl: '#',
      alt: 'Video thumbnail',
      alignment: 'center',
      paddingX: 24,
      paddingY: 12,
      borderWidth: 0,
      borderColor: '#e2e8f0',
      borderRadius: 0,
      borderStyle: 'solid',
    },
  },
];

export function createBlock(type: BlockType, order: number): EmailBlock {
  const def = BLOCK_DEFINITIONS.find(d => d.type === type);
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return {
    id: uuidv4(),
    type,
    props: { ...def.defaultProps },
    order,
    locked: false,
    hidden: false,
  };
}

export function getBlockDef(type: BlockType): BlockDefinition {
  return BLOCK_DEFINITIONS.find(d => d.type === type)!;
}
