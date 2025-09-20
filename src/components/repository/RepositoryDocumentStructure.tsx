import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertTriangle, Hash } from 'lucide-react';
import { DocumentStructure } from '@/contexts/content-builder/types';

interface RepositoryDocumentStructureProps {
  documentStructure: DocumentStructure;
}

export const RepositoryDocumentStructure: React.FC<RepositoryDocumentStructureProps> = ({ 
  documentStructure 
}) => {
  const hasHeadings = documentStructure.headings && documentStructure.headings.length > 0;
  
  if (!hasHeadings) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Structure Quality Indicators */}
      <div className="flex flex-wrap gap-2">
        {documentStructure.hasSingleH1 ? (
          <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Single H1
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Multiple H1s
          </Badge>
        )}
        
        {documentStructure.hasLogicalHierarchy ? (
          <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Logical Hierarchy
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Hierarchy Issues
          </Badge>
        )}
      </div>

      {/* Heading Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((level) => {
          const count = documentStructure[level]?.length || 0;
          if (count === 0) return null;
          
          return (
            <div key={level} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium uppercase">{level}</span>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Heading List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Hash className="h-4 w-4" />
          Heading Structure
        </h4>
        
        <div className="space-y-2 max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-72 overflow-y-auto custom-scrollbar">
          {documentStructure.headings.map((heading, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-2 bg-muted/20 rounded-lg"
              style={{ marginLeft: `${(heading.level - 1) * 12}px` }}
            >
              <Badge 
                variant="secondary" 
                className="text-xs mt-0.5 flex-shrink-0"
              >
                H{heading.level}
              </Badge>
              <span className="text-sm text-muted-foreground flex-1 leading-relaxed">
                {heading.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Document Metadata */}
      {documentStructure.metadata && (
        <div className="pt-3 border-t border-border/20">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {documentStructure.metadata.wordCount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Word Count</span>
                <span className="font-medium">{documentStructure.metadata.wordCount.toLocaleString()}</span>
              </div>
            )}
            {documentStructure.metadata.characterCount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters</span>
                <span className="font-medium">{documentStructure.metadata.characterCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};