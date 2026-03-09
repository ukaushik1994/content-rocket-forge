import React from 'react';

interface VideoPlaceholderProps {
  compact?: boolean;
  videoCount?: number;
  showNotifyButton?: boolean;
  onNotify?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'card';
  title?: string;
  description?: string;
}

// Video placeholder removed per UI/UX audit — "Coming Soon" labels add visual noise
export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = () => null;

interface VideoComingSoonBadgeProps {
  className?: string;
}

export const VideoComingSoonBadge: React.FC<VideoComingSoonBadgeProps> = () => null;
