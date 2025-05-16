
import React from 'react';
import { DocumentStructureAnalysis } from '../technical/DocumentStructureAnalysis';
import { MetaInformationReview } from '../technical/MetaInformationReview';
import { SerpDataAnalysis } from '../technical/SerpDataAnalysis';
import { TechnicalValidationCard } from '../technical/TechnicalValidationCard';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

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
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main technical area */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <DocumentStructureAnalysis documentStructure={documentStructure} />
          </motion.div>
          
          <motion.div variants={item}>
            <MetaInformationReview metaTitle={metaTitle} metaDescription={metaDescription} />
          </motion.div>
          
          {serpData && Object.keys(serpData).length > 0 && (
            <motion.div variants={item}>
              <SerpDataAnalysis serpData={serpData} />
            </motion.div>
          )}
        </div>
        
        {/* Side panel */}
        <motion.div variants={item} className="space-y-6">
          <TechnicalValidationCard 
            documentStructure={documentStructure}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            serpData={serpData}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
