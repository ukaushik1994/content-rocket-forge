
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DocumentStructureCard } from '../DocumentStructureCard';
import { AlertTriangle, CheckCircle2, FileCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentStructure } from '@/contexts/content-builder/types';

interface TechnicalTabContentProps {
  documentStructure: DocumentStructure | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export const TechnicalTabContent = ({ 
  documentStructure,
  metaTitle,
  metaDescription
}: TechnicalTabContentProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main technical area */}
      <div className="lg:col-span-2">
        <DocumentStructureCard documentStructure={documentStructure} />
      </div>
      
      {/* Side panel */}
      <div>
        <Card className="h-full bg-gradient-to-br from-violet-500/5 to-indigo-500/5 shadow-md">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-muted/30 to-transparent">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Technical Validation
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
