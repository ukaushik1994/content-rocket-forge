
import React, { memo } from 'react';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import FormatBadge from './FormatBadge';

interface ContentFormatIconProps {
  formatId: string;
  isFormatUsed: boolean;
  onClick: (e: React.MouseEvent) => void;
  isMobile?: boolean;
}

const ContentFormatIcon: React.FC<ContentFormatIconProps> = memo(({
  formatId,
  isFormatUsed,
  onClick,
  isMobile = false
}) => {
  // Ensure we're working with a valid formatId
  const safeFormatId = formatId || '';
  const IconComponent = getFormatIconComponent(safeFormatId);
  const format = getFormatByIdOrDefault(safeFormatId);
  const tooltipText = `${format.name} ${isFormatUsed ? '(Click to view)' : ''}`;

  return (
    <FormatBadge 
      isActive={isFormatUsed}
      tooltipText={tooltipText}
      onClick={onClick}
      isMobile={isMobile}
    >
      <IconComponent className="h-full w-full" />
    </FormatBadge>
  );
});

ContentFormatIcon.displayName = 'ContentFormatIcon';

export default ContentFormatIcon;
