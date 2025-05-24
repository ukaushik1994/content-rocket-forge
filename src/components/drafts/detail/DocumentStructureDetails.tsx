
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileCode, CheckCircle2, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface DocumentStructureDetailsProps {
  documentStructure: any;
  expandedSections: any;
  toggleSection: (section: string) => void;
}

export const DocumentStructureDetails = ({ documentStructure, expandedSections, toggleSection }: DocumentStructureDetailsProps) => {
  if (!documentStructure) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCode className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Document Structure</h3>
          </div>
          <p className="text-muted-foreground">No structure analysis available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileCode className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Document Structure Analysis</h3>
        </div>
        
        <div className="space-y-6">
          {/* Structure Validation */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-4">Structure Validation</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 p-3 rounded-md border ${
                documentStructure.hasSingleH1 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                {documentStructure.hasSingleH1 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <FileText className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  documentStructure.hasSingleH1 ? 'text-green-500' : 'text-red-500'
                }`}>
                  Single H1 Tag
                </span>
              </div>
              
              <div className={`flex items-center gap-2 p-3 rounded-md border ${
                documentStructure.hasLogicalHierarchy ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                {documentStructure.hasLogicalHierarchy ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <FileText className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  documentStructure.hasLogicalHierarchy ? 'text-green-500' : 'text-red-500'
                }`}>
                  Logical Hierarchy
                </span>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-4">Content Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                <div className="text-2xl font-bold text-primary">{documentStructure.h1?.length || 0}</div>
                <div className="text-sm text-muted-foreground">H1 Tags</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                <div className="text-2xl font-bold text-primary">{documentStructure.h2?.length || 0}</div>
                <div className="text-sm text-muted-foreground">H2 Tags</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                <div className="text-2xl font-bold text-primary">{documentStructure.h3?.length || 0}</div>
                <div className="text-sm text-muted-foreground">H3 Tags</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-md text-center border border-border">
                <div className="text-2xl font-bold text-primary">{documentStructure.metadata?.wordCount || 0}</div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
            </div>
          </div>

          {/* Detailed Headings */}
          <Collapsible open={expandedSections.structure} onOpenChange={() => toggleSection('structure')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">View All Headings</span>
              </div>
              {expandedSections.structure ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-muted/30 rounded-lg p-4 space-y-4 border border-border">
                {documentStructure.h1?.length > 0 && (
                  <div>
                    <Badge variant="secondary" className="mb-2">H1 Headings</Badge>
                    <div className="space-y-2">
                      {documentStructure.h1.map((heading: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground font-medium border border-border">
                          {heading}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {documentStructure.h2?.length > 0 && (
                  <div>
                    <Badge variant="secondary" className="mb-2">H2 Headings</Badge>
                    <div className="space-y-2">
                      {documentStructure.h2.map((heading: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground border border-border">
                          {heading}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {documentStructure.h3?.length > 0 && (
                  <div>
                    <Badge variant="secondary" className="mb-2">H3 Headings</Badge>
                    <div className="space-y-2">
                      {documentStructure.h3.map((heading: string, idx: number) => (
                        <div key={idx} className="p-2 bg-muted/50 rounded-md text-foreground border border-border">
                          {heading}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
