
import React from 'react';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import FormatBadge from './FormatBadge';

interface ContentFormatIconProps {
  formatId: string;
  isFormatUsed: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const ContentFormatIcon: React.FC<ContentFormatIconProps> = ({
  formatId,
  isFormatUsed,
  onClick
}) => {
  const IconComponent = getFormatIconComponent(formatId);
  const format = getFormatByIdOrDefault(formatId);
  const tooltipText = `${format.name} ${isFormatUsed ? '(Click to view)' : ''}`;

  return (
    <FormatBadge 
      isActive={isFormatUsed}
      tooltipText={tooltipText}
      onClick={onClick}
    >
      <IconComponent className="h-full w-full" />
    </FormatBadge>
  );
};

export default ContentFormatIcon;
