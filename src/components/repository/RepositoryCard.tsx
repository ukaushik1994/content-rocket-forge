// This component has been simplified. Use SimplifiedRepositoryCard for the clean version.
import { SimplifiedRepositoryCard } from './SimplifiedRepositoryCard';
import { ContentItemType } from '@/contexts/content/types';
import React from 'react';

interface RepositoryCardProps {
  content: ContentItemType;
  onView: () => void;
  repurposedFormats?: string[];
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = (props) => (
  <SimplifiedRepositoryCard {...props} />
);
