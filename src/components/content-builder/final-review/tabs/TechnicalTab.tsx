
import React from 'react';
import { TechnicalTabContent } from '../TechnicalTabContent';
import { DocumentStructure } from '@/contexts/content-builder/types';

interface TechnicalTabProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: any;
}

export const TechnicalTab = ({
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}: TechnicalTabProps) => {
  return (
    <TechnicalTabContent
      documentStructure={documentStructure}
      metaTitle={metaTitle}
      metaDescription={metaDescription}
      serpData={serpData}
    />
  );
};
