
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { DocumentStructure } from '@/contexts/content-builder/types';

interface DocumentStructureCardProps {
  documentStructure: DocumentStructure | null;
}

export const DocumentStructureCard = ({ documentStructure }: DocumentStructureCardProps) => {
  if (!documentStructure) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Document Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground text-sm text-center">No document structure available.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { h1, h2, h3, h4, hasSingleH1, hasLogicalHierarchy } = documentStructure;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Document Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 overflow-hidden">
        {/* Structure validation */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/20">
            <span className="text-sm">Single H1 tag</span>
            {hasSingleH1 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/20">
            <span className="text-sm">Logical heading hierarchy</span>
            {hasLogicalHierarchy ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        
        {/* Heading list */}
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          <h4 className="text-xs text-muted-foreground font-medium">Heading Structure</h4>
          
          {h1 && h1.length > 0 && (
            <div className="mb-2">
              <Badge variant="secondary" className="mb-1">H1</Badge>
              <ul className="space-y-1 pl-4 text-sm">
                {h1.map((heading, i) => (
                  <li key={`h1-${i}`} className="list-disc text-sm">{heading}</li>
                ))}
              </ul>
            </div>
          )}
          
          {h2 && h2.length > 0 && (
            <div className="mb-2">
              <Badge variant="secondary" className="mb-1">H2</Badge>
              <ul className="space-y-1 pl-4 text-sm">
                {h2.map((heading, i) => (
                  <li key={`h2-${i}`} className="list-disc text-sm">{heading}</li>
                ))}
              </ul>
            </div>
          )}
          
          {h3 && h3.length > 0 && (
            <div className="mb-2">
              <Badge variant="secondary" className="mb-1">H3</Badge>
              <ul className="space-y-1 pl-4 text-sm">
                {h3.map((heading, i) => (
                  <li key={`h3-${i}`} className="list-disc text-sm">{heading}</li>
                ))}
              </ul>
            </div>
          )}
          
          {h4 && h4.length > 0 && (
            <div className="mb-2">
              <Badge variant="secondary" className="mb-1">H4</Badge>
              <ul className="space-y-1 pl-4 text-sm">
                {h4.map((heading, i) => (
                  <li key={`h4-${i}`} className="list-disc text-sm">{heading}</li>
                ))}
              </ul>
            </div>
          )}
          
          {(!h1 || h1.length === 0) && (!h2 || h2.length === 0) && (!h3 || h3.length === 0) && (!h4 || h4.length === 0) && (
            <p className="text-muted-foreground text-sm italic">No headings found in your content.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
