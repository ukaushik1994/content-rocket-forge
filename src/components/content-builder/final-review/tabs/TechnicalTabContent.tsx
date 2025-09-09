import React from 'react';
import { EnhancedTechnicalTabContent } from '../technical/EnhancedTechnicalTabContent';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { SerpAnalysisResult } from '@/types/serp';

interface TechnicalTabContentProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: SerpAnalysisResult | null;
}

export const TechnicalTabContent = ({ 
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}: TechnicalTabContentProps) => {
  return (
    <EnhancedTechnicalTabContent
      documentStructure={documentStructure}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      serpData={serpData}
    />
  );
};
