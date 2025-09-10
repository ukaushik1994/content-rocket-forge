import React from 'react';
import { EnterpriseHub } from '@/components/enterprise/EnterpriseHub';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const EnterpriseHubPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <EnterpriseHub />
      </div>
    </ErrorBoundary>
  );
};