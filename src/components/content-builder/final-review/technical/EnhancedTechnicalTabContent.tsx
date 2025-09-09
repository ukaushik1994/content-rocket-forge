import React from 'react';
import { TechnicalOverviewCard } from './TechnicalOverviewCard';
import { SeoAuditCard } from './SeoAuditCard';
import { PerformanceAnalysisCard } from './PerformanceAnalysisCard';
import { AccessibilityComplianceCard } from './AccessibilityComplianceCard';
import { SchemaStructuredDataCard } from './SchemaStructuredDataCard';
import { MobileTechnicalStandardsCard } from './MobileTechnicalStandardsCard';
import { DocumentStructureAnalysis } from './DocumentStructureAnalysis';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { SerpAnalysisResult } from '@/types/serp';
import { motion } from 'framer-motion';

interface EnhancedTechnicalTabContentProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: SerpAnalysisResult | null;
}

export const EnhancedTechnicalTabContent: React.FC<EnhancedTechnicalTabContentProps> = ({
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}) => {
  // Calculate technical scores based on available data
  const calculateTechnicalScores = () => {
    const hasMetaTitle = metaTitle && metaTitle.length > 0;
    const hasMetaDescription = metaDescription && metaDescription.length > 0;
    const hasDocumentStructure = documentStructure && Object.keys(documentStructure).length > 0;
    
    const seoScore = hasMetaTitle && hasMetaDescription ? 85 : hasMetaTitle || hasMetaDescription ? 65 : 45;
    const performanceScore = 78; // Mock score - could be calculated from actual metrics
    const accessibilityScore = 72; // Mock score - could be from real a11y checks
    const schemaScore = hasDocumentStructure ? 65 : 40; // Based on document structure
    const mobileScore = 85; // Mock score - could be from responsive checks
    
    return {
      seo: seoScore,
      performance: performanceScore,
      accessibility: accessibilityScore,
      schema: schemaScore,
      mobile: mobileScore
    };
  };

  const scores = calculateTechnicalScores();
  const totalIssues = 8; // Mock total issues
  const criticalIssues = 2; // Mock critical issues

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

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Technical Overview */}
      <TechnicalOverviewCard 
        scores={scores}
        totalIssues={totalIssues}
        criticalIssues={criticalIssues}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <SeoAuditCard 
            score={scores.seo}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            headingStructure={documentStructure}
          />
          
          <PerformanceAnalysisCard 
            score={scores.performance}
          />
          
          <SchemaStructuredDataCard 
            score={scores.schema}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AccessibilityComplianceCard 
            score={scores.accessibility}
          />
          
          <MobileTechnicalStandardsCard 
            score={scores.mobile}
          />
          
          {/* Enhanced Document Structure */}
          {documentStructure && (
            <DocumentStructureAnalysis 
              documentStructure={documentStructure} 
            />
          )}
        </div>
      </div>

      {/* SERP Data Analysis - Full Width if Available */}
      {serpData && Object.keys(serpData).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-6"
        >
          {/* We can reuse the existing SerpDataAnalysis component here if needed */}
        </motion.div>
      )}
    </motion.div>
  );
};