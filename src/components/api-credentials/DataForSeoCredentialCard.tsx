
import React from 'react';
import { DataForSeoProvider } from '@/components/api';
import { ApiCredentialProps } from './types';

/**
 * Component for displaying and managing DataForSEO credentials
 */
export const DataForSeoCredentialCard: React.FC<ApiCredentialProps> = ({
  provider,
  className,
}) => {
  return (
    <DataForSeoProvider provider={provider} className={className} />
  );
};
