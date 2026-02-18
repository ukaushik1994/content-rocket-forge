import React from 'react';

interface FeatureChipProps {
  label: string;
  color: string;
}

export const FeatureChip: React.FC<FeatureChipProps> = ({ label, color }) => (
  <span
    className="px-3.5 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md"
    style={{
      background: `${color}10`,
      borderColor: `${color}25`,
      color,
    }}
  >
    {label}
  </span>
);
