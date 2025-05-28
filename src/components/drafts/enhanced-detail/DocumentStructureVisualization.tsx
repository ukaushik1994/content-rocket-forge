
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCode, CheckCircle2, AlertTriangle, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentStructureVisualizationProps {
  documentStructure: any;
  isAnalyzing: boolean;
}

export const DocumentStructureVisualization: React.FC<DocumentStructureVisualizationProps> = ({
  documentStructure,
  isAnalyzing
}) => {
  if (isAnalyzing) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <motion.div
              className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-muted-foreground">Analyzing structure...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documentStructure) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Document Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <FileCode className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No structure analysis available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCode className="h-5 w-5" />
          Document Structure
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full p-0">
        <ScrollArea className="h-[calc(100%-4rem)] p-6">
          <div className="space-y-6">
            {/* Structure Validation */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-3 rounded-lg border text-center ${
                  documentStructure.hasSingleH1 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                {documentStructure.hasSingleH1 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                )}
                <div className="text-xs font-medium">Single H1</div>
                <div className={`text-xs ${
                  documentStructure.hasSingleH1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documentStructure.hasSingleH1 ? 'Valid' : 'Invalid'}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`p-3 rounded-lg border text-center ${
                  documentStructure.hasLogicalHierarchy 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                {documentStructure.hasLogicalHierarchy ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                )}
                <div className="text-xs font-medium">Hierarchy</div>
                <div className={`text-xs ${
                  documentStructure.hasLogicalHierarchy ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documentStructure.hasLogicalHierarchy ? 'Logical' : 'Invalid'}
                </div>
              </motion.div>
            </div>

            {/* Content Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
              >
                <div className="text-lg font-bold text-purple-500">
                  {documentStructure.h1?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">H1 Tags</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
              >
                <div className="text-lg font-bold text-purple-500">
                  {documentStructure.h2?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">H2 Tags</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
              >
                <div className="text-lg font-bold text-purple-500">
                  {documentStructure.h3?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">H3 Tags</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-3 bg-background/50 rounded-lg border border-white/10 text-center"
              >
                <div className="text-lg font-bold text-purple-500">
                  {documentStructure.metadata?.wordCount || 0}
                </div>
                <div className="text-xs text-muted-foreground">Words</div>
              </motion.div>
            </div>

            {/* Heading Hierarchy */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Heading Structure
              </h4>

              {/* H1 Headings */}
              {documentStructure.h1?.length > 0 && (
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">H1 Headings</Badge>
                  {documentStructure.h1.map((heading: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      className="p-3 bg-background/30 rounded-md border border-white/10"
                    >
                      <div className="font-medium text-sm">{heading}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* H2 Headings */}
              {documentStructure.h2?.length > 0 && (
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">H2 Headings</Badge>
                  {documentStructure.h2.slice(0, 5).map((heading: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      className="p-2 bg-background/30 rounded-md border border-white/10 ml-4"
                    >
                      <div className="text-sm">{heading}</div>
                    </motion.div>
                  ))}
                  {documentStructure.h2.length > 5 && (
                    <div className="text-xs text-muted-foreground ml-4">
                      +{documentStructure.h2.length - 5} more headings
                    </div>
                  )}
                </div>
              )}

              {/* H3 Headings */}
              {documentStructure.h3?.length > 0 && (
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">H3 Headings</Badge>
                  {documentStructure.h3.slice(0, 3).map((heading: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="p-2 bg-background/30 rounded-md border border-white/10 ml-8"
                    >
                      <div className="text-sm">{heading}</div>
                    </motion.div>
                  ))}
                  {documentStructure.h3.length > 3 && (
                    <div className="text-xs text-muted-foreground ml-8">
                      +{documentStructure.h3.length - 3} more headings
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
