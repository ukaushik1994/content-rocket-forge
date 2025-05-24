
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ContentType } from '@/contexts/content-builder/types/content-types';
import { Edit2, FileText, Tag } from 'lucide-react';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { MetadataTabContent } from './detail/MetadataTabContent';

interface DraftDetailViewProps {
  open: boolean;
  onClose: () => void;
  draft: any | null;
}

export function DraftDetailView({ open, onClose, draft }: DraftDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'metadata'>('content');
  const [serpData, setSerpData] = useState(null);
  const [documentStructure, setDocumentStructure] = useState(null);
  const [solutionMetrics, setSolutionMetrics] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    serp: false,
    solution: false,
    structure: false,
    keywords: false,
    questions: false,
    entities: false,
    gaps: false
  });
  
  // Load analysis data when metadata tab is selected
  useEffect(() => {
    if (activeTab === 'metadata' && draft && draft.content) {
      loadAnalysisData();
    }
  }, [activeTab, draft]);

  const loadAnalysisData = async () => {
    if (!draft || !draft.content) return;
    
    setIsLoadingAnalysis(true);
    
    try {
      // Extract document structure
      const structure = extractDocumentStructure(draft.content);
      setDocumentStructure(structure);
      
      // Analyze SERP data if keywords available
      if (draft.keywords && draft.keywords.length > 0) {
        const mainKeyword = draft.keywords[0];
        const serpAnalysis = await analyzeKeywordSerp(mainKeyword);
        setSerpData(serpAnalysis);
      }
      
      // Analyze solution integration if solution data is available
      if (draft.metadata?.selectedSolution) {
        const solutionAnalysis = analyzeSolutionIntegration(draft.content, draft.metadata.selectedSolution);
        setSolutionMetrics(solutionAnalysis);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  if (!draft) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{draft.title}</DialogTitle>
            <Badge variant={draft.status === 'draft' ? 'outline' : 'default'}>
              {draft.status === 'draft' ? 'Draft' : 'Published'}
            </Badge>
          </div>
          <DialogDescription>
            Created: {formatDate(draft.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'content' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('content')}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Content
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'metadata' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('metadata')}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Metadata
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'content' && (
            <div className="prose prose-invert max-w-none">
              {draft.content ? (
                <div dangerouslySetInnerHTML={{ __html: draft.content }} />
              ) : (
                <p className="text-muted-foreground italic">No content available</p>
              )}
            </div>
          )}
          
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <MetadataTabContent 
                draft={draft}
                isLoadingAnalysis={isLoadingAnalysis}
                serpData={serpData}
                documentStructure={documentStructure}
                solutionMetrics={solutionMetrics}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                formatDate={formatDate}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
