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

// Helper function to check heading hierarchy
function checkHeadingHierarchy(structure: DocumentStructure | null): boolean {
  if (!structure) return false;
  
  const headings = structure.headings || [];
  if (headings.length === 0) return false;
  
  // Check that there's exactly one H1
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count !== 1) return false;
  
  // Check that H2s come before H3s in the hierarchy
  let lastLevel = 0;
  for (const heading of headings) {
    if (heading.level > lastLevel + 1) {
      // Skipped a level (e.g., H1 -> H3)
      return false;
    }
    lastLevel = heading.level;
  }
  
  return true;
}

export const EnhancedTechnicalTabContent: React.FC<EnhancedTechnicalTabContentProps> = ({
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}) => {
  // Calculate REAL technical scores based on available data
  const calculateTechnicalScores = () => {
    const hasMetaTitle = metaTitle && metaTitle.length > 0;
    const hasMetaDescription = metaDescription && metaDescription.length > 0;
    const hasDocumentStructure = documentStructure && Object.keys(documentStructure).length > 0;
    
    // SEO Score - based on actual meta analysis
    let seoScore = 0;
    if (hasMetaTitle) {
      seoScore += 25;
      if (metaTitle.length >= 30 && metaTitle.length <= 60) seoScore += 15;
      else if (metaTitle.length > 0 && metaTitle.length < 30) seoScore += 5;
      else if (metaTitle.length > 60 && metaTitle.length <= 70) seoScore += 10;
    }
    if (hasMetaDescription) {
      seoScore += 25;
      if (metaDescription.length >= 120 && metaDescription.length <= 160) seoScore += 15;
      else if (metaDescription.length > 0 && metaDescription.length < 120) seoScore += 5;
      else if (metaDescription.length > 160 && metaDescription.length <= 200) seoScore += 10;
    }
    
    // Check document structure for SEO
    const headings = documentStructure?.headings || [];
    const h1Count = headings.filter(h => h.level === 1).length;
    const h2Count = headings.filter(h => h.level === 2).length;
    
    if (h1Count === 1) seoScore += 10; // Exactly one H1
    if (h2Count >= 2) seoScore += 10; // At least 2 H2s
    
    // Performance Score - based on content size and structure
    let performanceScore = 100;
    const totalWordCount = documentStructure?.metadata?.wordCount || 0;
    const imageCount = documentStructure?.images?.length || 0;
    const linkCount = documentStructure?.links?.length || 0;
    
    if (totalWordCount > 3000) performanceScore -= 10;
    if (totalWordCount > 5000) performanceScore -= 10;
    if (imageCount > 10) performanceScore -= 10;
    if (imageCount > 20) performanceScore -= 10;
    if (linkCount > 15) performanceScore -= 5;
    
    // Check for missing alt text
    const imagesWithoutAlt = documentStructure?.images?.filter(img => !img.alt || img.alt.trim() === '').length || 0;
    if (imagesWithoutAlt > 0) performanceScore -= Math.min(15, imagesWithoutAlt * 3);
    
    // Accessibility Score - check heading hierarchy, alt text, link text
    let accessibilityScore = 50;
    const hasProperHeadingHierarchy = checkHeadingHierarchy(documentStructure);
    if (hasProperHeadingHierarchy) accessibilityScore += 25;
    
    const imagesWithAlt = (documentStructure?.images?.length || 0) - imagesWithoutAlt;
    const totalImages = documentStructure?.images?.length || 0;
    if (totalImages > 0 && imagesWithAlt === totalImages) accessibilityScore += 15;
    else if (totalImages > 0 && imagesWithAlt / totalImages >= 0.8) accessibilityScore += 10;
    
    // Check link text
    const linksWithText = documentStructure?.links?.filter(link => link.text && link.text.trim().length > 0).length || 0;
    const totalLinks = documentStructure?.links?.length || 0;
    if (totalLinks > 0 && linksWithText >= totalLinks * 0.9) accessibilityScore += 10;
    
    // Schema Score - based on structured data opportunities
    let schemaScore = 0;
    if (hasDocumentStructure) schemaScore += 30;
    if (hasMetaTitle && hasMetaDescription) schemaScore += 20;
    
    // Lists indicate FAQ potential
    const listCount = documentStructure?.lists?.length || 0;
    if (listCount > 0) schemaScore += 15;
    if (listCount >= 3) schemaScore += 5;
    
    // Multiple H2s indicate article structure
    if (h2Count >= 3) schemaScore += 15;
    if (h2Count >= 5) schemaScore += 5;
    
    // Has structured content like tables
    if ((documentStructure as any)?.tables?.length > 0) schemaScore += 10;
    
    // Mobile Score - content-based estimates
    let mobileScore = 80;
    if (totalWordCount < 2000) mobileScore += 10; // Shorter loads faster on mobile
    if (totalWordCount > 4000) mobileScore -= 10;
    
    // Tables break mobile layouts
    const tableCount = (documentStructure as any)?.tables?.length || 0;
    if (tableCount > 2) mobileScore -= 15;
    else if (tableCount > 0) mobileScore -= 5;
    
    // Reasonable image count
    if (imageCount <= 5) mobileScore += 10;
    else if (imageCount > 15) mobileScore -= 10;
    
    return {
      seo: Math.min(100, Math.max(0, seoScore)),
      performance: Math.min(100, Math.max(0, performanceScore)),
      accessibility: Math.min(100, Math.max(0, accessibilityScore)),
      schema: Math.min(100, Math.max(0, schemaScore)),
      mobile: Math.min(100, Math.max(0, mobileScore))
    };
  };

  const scores = calculateTechnicalScores();
  
  // Calculate real issue counts based on scores
  const calculateIssues = () => {
    let criticalIssues = 0;
    let totalIssues = 0;
    
    // Count issues based on score thresholds
    if (scores.seo < 50) { criticalIssues++; totalIssues++; }
    else if (scores.seo < 70) { totalIssues++; }
    
    if (scores.performance < 50) { criticalIssues++; totalIssues++; }
    else if (scores.performance < 70) { totalIssues++; }
    
    if (scores.accessibility < 50) { criticalIssues++; totalIssues++; }
    else if (scores.accessibility < 70) { totalIssues++; }
    
    if (scores.schema < 40) { totalIssues++; }
    if (scores.mobile < 60) { totalIssues++; }
    
    // Specific checks
    if (!metaTitle || metaTitle.length === 0) { criticalIssues++; totalIssues++; }
    if (!metaDescription || metaDescription.length === 0) { totalIssues++; }
    
    const h1Count = documentStructure?.headings?.filter(h => h.level === 1).length || 0;
    if (h1Count !== 1) { criticalIssues++; totalIssues++; }
    
    return { criticalIssues, totalIssues };
  };
  
  const { criticalIssues, totalIssues } = calculateIssues();

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
