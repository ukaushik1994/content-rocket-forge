
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, BarChart2, Clock, CheckCircle2 } from 'lucide-react';
import { SerpAnalysisDetails } from './SerpAnalysisDetails';
import { SolutionIntegrationDetails } from './SolutionIntegrationDetails';
import { DocumentStructureDetails } from './DocumentStructureDetails';

interface MetadataTabContentProps {
  draft: any;
  isLoadingAnalysis: boolean;
  serpData: any;
  documentStructure: any;
  solutionMetrics: any;
  expandedSections: any;
  toggleSection: (section: string) => void;
  formatDate: (dateString: string) => string;
}

export const MetadataTabContent = ({ 
  draft, 
  isLoadingAnalysis, 
  serpData, 
  documentStructure, 
  solutionMetrics, 
  expandedSections, 
  toggleSection, 
  formatDate 
}: MetadataTabContentProps) => {
  if (isLoadingAnalysis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-lg text-muted-foreground">Loading detailed analysis...</span>
      </div>
    );
  }

  return (
    <>
      {/* Detailed Analysis Sections */}
      <div className="space-y-6">
        <SerpAnalysisDetails 
          serpData={serpData}
          draft={draft}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
        <SolutionIntegrationDetails 
          draft={draft}
          solutionMetrics={solutionMetrics}
        />
        <DocumentStructureDetails 
          documentStructure={documentStructure}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      </div>

      {/* Original metadata information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium flex items-center">
            <Tag className="w-4 h-4 mr-2" /> 
            Keywords
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {draft.keywords && draft.keywords.length > 0 ? draft.keywords.map((keyword: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            )) : (
              <span className="text-sm text-muted-foreground">No keywords</span>
            )}
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium flex items-center">
            <BarChart2 className="w-4 h-4 mr-2" /> 
            SEO Score
          </h3>
          <div className="mt-2">
            <div className="flex items-center mt-1">
              <div className="bg-muted w-full h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    draft.seo_score >= 80 ? 'bg-green-500' : 
                    draft.seo_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${draft.seo_score || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 font-medium text-sm">{draft.seo_score || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" /> 
            Timestamps
          </h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(draft.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated:</span>
              <span>{formatDate(draft.updated_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2" /> 
            Status
          </h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content Type:</span>
              <span>{draft.contentType || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
                {draft.status === 'draft' ? 'Draft' : 'Published'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {(draft.metaTitle || draft.metaDescription) && (
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-medium mb-2">Meta Information</h3>
          {draft.metaTitle && (
            <div className="mb-2">
              <div className="text-xs text-muted-foreground">Meta Title</div>
              <div className="text-sm">{draft.metaTitle}</div>
            </div>
          )}
          {draft.metaDescription && (
            <div>
              <div className="text-xs text-muted-foreground">Meta Description</div>
              <div className="text-sm">{draft.metaDescription}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
