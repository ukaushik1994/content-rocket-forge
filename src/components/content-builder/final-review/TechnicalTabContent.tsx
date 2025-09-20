
import React from 'react';
import { DocumentStructureAnalysis } from './technical/DocumentStructureAnalysis';
import { SelectedSerpItemsCard } from '@/components/content-builder/outline/SelectedSerpItemsCard';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <DocumentStructureAnalysis documentStructure={documentStructure} />
        </motion.div>
        
        <motion.div variants={item}>
          <SelectedSerpItemsCard />
        </motion.div>
      </div>
    </motion.div>
  );
};
