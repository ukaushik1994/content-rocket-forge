
import React, { memo } from 'react';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import FormatBadge from './FormatBadge';

interface ContentFormatIconProps {
  formatId: string;
  isFormatUsed: boolean;
  onClick: (e: React.MouseEvent) => void;
  isMobile?: boolean;
  isSaved?: boolean;
}

const ContentFormatIcon: React.FC<ContentFormatIconProps> = memo(({
  formatId,
  isFormatUsed,
  onClick,
  isMobile = false,
  isSaved = false
}) => {
  const safeFormatId = formatId || '';
  const IconComponent = getFormatIconComponent(safeFormatId);
  const format = getFormatByIdOrDefault(safeFormatId);
  const tooltipText = `${format.name} ${isFormatUsed ? (isSaved ? '(Saved - Click to view)' : '(Click to view)') : ''}`;

  return (
    <FormatBadge 
      isActive={isFormatUsed}
      tooltipText={tooltipText}
      onClick={onClick}
      isMobile={isMobile}
      isSaved={isSaved}
    >
      <IconComponent className="h-full w-full" />
    </FormatBadge>
  );
});

ContentFormatIcon.displayName = 'ContentFormatIcon';

export default ContentFormatIcon;
