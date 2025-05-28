
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  Image, 
  Link, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface DocumentStructureVisualizationProps {
  documentStructure: any;
  isAnalyzing: boolean;
}

export const DocumentStructureVisualization = ({
  documentStructure,
  isAnalyzing
}: DocumentStructureVisualizationProps) => {

  if (isAnalyzing) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Analyzing structure...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documentStructure) {
    return (
      <Card className="h-full border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-medium text-orange-700 dark:text-orange-300 mb-2">
            No Structure Data
          </h3>
          <p className="text-sm text-orange-600 dark:text-orange-400 text-center">
            Unable to analyze document structure. Content may be missing or invalid.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate structure score
  const calculateStructureScore = () => {
    let score = 0;
    
    // Check for single H1 (good practice)
    if (documentStructure.hasSingleH1) score += 20;
    
    // Check for logical hierarchy
    if (documentStructure.hasLogicalHierarchy) score += 20;
    
    // Check for sufficient content structure
    if (documentStructure.headings?.length > 2) score += 20;
    if (documentStructure.paragraphs?.length > 3) score += 20;
    if (documentStructure.lists?.length > 0) score += 10;
    if (documentStructure.images?.length > 0) score += 5;
    if (documentStructure.links?.length > 0) score += 5;
    
    return Math.min(100, score);
  };

  const structureScore = calculateStructureScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Document Structure
        </CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(structureScore)}`}>
              {structureScore}%
            </span>
            <Badge variant="outline" className="text-xs">
              {getScoreLabel(structureScore)}
            </Badge>
          </div>
        </div>
        <Progress value={structureScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Structure Validation */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Structure Validation</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Single H1</span>
              {documentStructure.hasSingleH1 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Logical Hierarchy</span>
              {documentStructure.hasLogicalHierarchy ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Content Elements */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Content Elements</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heading1 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">H1</span>
              </div>
              <span className="font-medium">{documentStructure.h1?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heading2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">H2</span>
              </div>
              <span className="font-medium">{documentStructure.h2?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heading3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">H3+</span>
              </div>
              <span className="font-medium">
                {(documentStructure.h3?.length || 0) + 
                 (documentStructure.h4?.length || 0) + 
                 (documentStructure.h5?.length || 0) + 
                 (documentStructure.h6?.length || 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Paragraphs</span>
              </div>
              <span className="font-medium">{documentStructure.paragraphs?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Lists</span>
              </div>
              <span className="font-medium">{documentStructure.lists?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Images</span>
              </div>
              <span className="font-medium">{documentStructure.images?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Links</span>
              </div>
              <span className="font-medium">{documentStructure.links?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        {documentStructure.metadata && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium text-sm">Content Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Words</span>
                <span className="font-medium">
                  {documentStructure.metadata.wordCount?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters</span>
                <span className="font-medium">
                  {documentStructure.metadata.characterCount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="font-medium text-sm">Recommendations</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {!documentStructure.hasSingleH1 && (
              <p>• Use exactly one H1 heading for the main title</p>
            )}
            {!documentStructure.hasLogicalHierarchy && (
              <p>• Maintain logical heading hierarchy (H1 → H2 → H3)</p>
            )}
            {(documentStructure.headings?.length || 0) < 3 && (
              <p>• Add more subheadings to improve content structure</p>
            )}
            {(documentStructure.links?.length || 0) === 0 && (
              <p>• Consider adding relevant internal/external links</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
