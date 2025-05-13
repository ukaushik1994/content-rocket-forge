
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { DocumentStructure } from '@/contexts/content-builder/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface DocumentStructureAnalysisProps {
  documentStructure: DocumentStructure | null;
}

export const DocumentStructureAnalysis = ({ documentStructure }: DocumentStructureAnalysisProps) => {
  if (!documentStructure) {
    return (
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Document Structure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center p-6 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 mx-auto opacity-30" />
            <p>No document structure available. Please run a technical analysis.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Document Structure Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div className="font-medium text-sm">Document Structure</div>
            <div className="flex flex-wrap gap-2">
              <div className={`px-3 py-1 text-xs rounded-full ${documentStructure.hasSingleH1 ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'}`}>
                {documentStructure.hasSingleH1 ? 'Single H1 Tag ✓' : 'Missing Single H1 Tag ✕'}
              </div>
              <div className={`px-3 py-1 text-xs rounded-full ${documentStructure.hasLogicalHierarchy ? 'bg-green-500/20 text-green-600 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-600 border border-yellow-500/30'}`}>
                {documentStructure.hasLogicalHierarchy ? 'Logical Hierarchy ✓' : 'Incorrect Heading Hierarchy ✕'}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Headings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentStructure.h1.length > 0 && (
                <div className="bg-card border rounded-md p-3">
                  <div className="text-xs font-semibold mb-2 text-purple-500 flex items-center">
                    <FileText className="h-3 w-3 mr-1" /> H1 Headings ({documentStructure.h1.length})
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {documentStructure.h1.map((heading, i) => (
                      <li key={`h1-${i}`} className="truncate">{heading.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {documentStructure.h2.length > 0 && (
                <div className="bg-card border rounded-md p-3">
                  <div className="text-xs font-semibold mb-2 text-blue-500 flex items-center">
                    <FileText className="h-3 w-3 mr-1" /> H2 Headings ({documentStructure.h2.length})
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {documentStructure.h2.map((heading, i) => (
                      <li key={`h2-${i}`} className="truncate">{heading.text}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {documentStructure.h3.length > 0 && (
                <div className="bg-card border rounded-md p-3">
                  <div className="text-xs font-semibold mb-2 text-cyan-500 flex items-center">
                    <FileText className="h-3 w-3 mr-1" /> H3 Headings ({documentStructure.h3.length})
                  </div>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {documentStructure.h3.map((heading, i) => (
                      <li key={`h3-${i}`} className="truncate">{heading.text}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
