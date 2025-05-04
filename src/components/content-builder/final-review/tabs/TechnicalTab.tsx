
import React from 'react';
import { TechnicalTabContent } from '../TechnicalTabContent';

interface TechnicalTabProps {
  documentStructure: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
    hasSingleH1: boolean;
    hasLogicalHierarchy: boolean;
  } | null;
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
