
import React from 'react';
import { Card } from "@/components/ui/card";
import { ApiProviderWithCategory } from './types';

interface ApiKeyCardProps {
  children: React.ReactNode;
  provider: ApiProviderWithCategory;
  keyExists: boolean;
  testSuccessful: boolean;
}

export const ApiKeyCard = ({ 
  children, 
  provider, 
  keyExists, 
  testSuccessful 
}: ApiKeyCardProps) => {
  return (
    <Card 
      className={`p-6 space-y-4 bg-glass ${
        provider.required && !keyExists 
          ? 'border-red-500/40' 
          : testSuccessful 
            ? 'border-green-500/40' 
            : 'border-white/10'
      }`}
    >
      {children}
    </Card>
  );
};
