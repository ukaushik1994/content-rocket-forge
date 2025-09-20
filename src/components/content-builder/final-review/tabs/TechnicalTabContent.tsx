import React from 'react';
import { TechnicalTabContent as SimpleTechnicalTabContent } from '../TechnicalTabContent';
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
    <SimpleTechnicalTabContent
      documentStructure={documentStructure}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      serpData={serpData}
    />
  );
};
