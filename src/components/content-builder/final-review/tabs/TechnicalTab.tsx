import React from 'react';
import { DocumentStructureCard } from '../DocumentStructureCard';
import { EntitiesAnalysisCard } from '../EntitiesAnalysisCard';
import { HeadingsAnalysisCard } from '../HeadingsAnalysisCard';
import { ContentGapsCard } from '../ContentGapsCard';
import { FeaturedSnippetsCard } from '../FeaturedSnippetsCard';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { SerpAnalysisResult } from '@/types/serp';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, FileCode, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface TechnicalTabProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
  serpData: SerpAnalysisResult | null;
}

export const TechnicalTab = ({ 
  documentStructure,
  metaTitle,
  metaDescription,
  serpData
}: TechnicalTabProps) => {
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
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Main technical area */}
      <div className="lg:col-span-2 space-y-6">
        <motion.div variants={item}>
          <DocumentStructureCard documentStructure={documentStructure} />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <EntitiesAnalysisCard entities={serpData?.entities} />
          </motion.div>
          <motion.div variants={item}>
            <HeadingsAnalysisCard headings={serpData?.headings} />
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <ContentGapsCard contentGaps={serpData?.contentGaps} />
          </motion.div>
          <motion.div variants={item}>
            <FeaturedSnippetsCard snippets={serpData?.featuredSnippets} />
          </motion.div>
        </div>
      </div>
      
      {/* Side panel - keep the validation section */}
      <motion.div variants={item}>
        <Card className="h-full bg-gradient-to-br from-violet-500/5 to-indigo-500/5 shadow-lg border border-violet-500/20">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-muted/30 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Technical Health Check
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="bg-card/50 rounded-md p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-medium">HTML Structure</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Ensures proper HTML5 semantic structure for better accessibility and SEO.
                </p>
                {!!documentStructure?.hasSingleH1 && !!documentStructure?.hasLogicalHierarchy ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">Valid HTML structure</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500">Structure needs improvement</span>
                  </div>
                )}
              </div>
              
              <div className="bg-card/50 rounded-md p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium">Metadata</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Validates meta title and description for search engine optimization.
                </p>
                {!!metaTitle && !!metaDescription && metaTitle.length <= 60 && metaDescription.length >= 50 && metaDescription.length <= 160 ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">Valid metadata</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500">Metadata needs improvement</span>
                  </div>
                )}
              </div>
              
              <div className="bg-card/50 rounded-md p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-medium">SERP Features</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Analyzes content for featured snippet and entity optimization.
                </p>
                {(serpData?.featuredSnippets && serpData.featuredSnippets.length > 0) || 
                 (serpData?.entities && serpData.entities.length > 0) ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">SERP data available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-500">SERP data missing</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
