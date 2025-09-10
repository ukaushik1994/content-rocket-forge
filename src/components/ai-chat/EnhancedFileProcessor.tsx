import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, FileCode, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface FileAnalysis {
  name: string;
  size: number;
  type: string;
  content?: string;
  preview?: string;
  wordCount?: number;
  insights?: string[];
  error?: string;
}

interface EnhancedFileProcessorProps {
  files: File[];
  onAnalysisComplete: (analyses: FileAnalysis[]) => void;
  onAnalyzeFile: (file: File) => Promise<FileAnalysis>;
}

export const EnhancedFileProcessor: React.FC<EnhancedFileProcessorProps> = ({
  files,
  onAnalysisComplete,
  onAnalyzeFile
}) => {
  const [analyses, setAnalyses] = useState<Record<string, FileAnalysis>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    if (files.length > 0 && !isProcessing) {
      processFiles();
    }
  }, [files]);

  const processFiles = async () => {
    setIsProcessing(true);
    const newAnalyses: Record<string, FileAnalysis> = {};

    try {
      for (const file of files) {
        toast({
          title: "Analyzing file",
          description: `Processing ${file.name}...`,
        });

        const analysis = await onAnalyzeFile(file);
        newAnalyses[file.name] = analysis;
        
        setAnalyses(prev => ({ ...prev, [file.name]: analysis }));
      }

      onAnalysisComplete(Object.values(newAnalyses));
      
      toast({
        title: "Analysis complete",
        description: `Processed ${files.length} file(s) successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Processing failed",
        description: error.message || "Could not analyze files",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('text')) return FileText;
    if (type.includes('image')) return Image;
    if (type.includes('code') || type.includes('json') || type.includes('xml')) return FileCode;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const toggleFileExpansion = (fileName: string) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  return (
    <div className="space-y-4">
      {files.map((file) => {
        const analysis = analyses[file.name];
        const FileIcon = getFileIcon(file.type);
        const isExpanded = expandedFiles[file.name];

        return (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                        {analysis?.wordCount && (
                          <Badge variant="outline" className="text-xs">
                            {analysis.wordCount} words
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isProcessing && !analysis ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : analysis?.error ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : analysis ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                    
                    {analysis && !analysis.error && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFileExpansion(file.name)}
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>
                        </CollapsibleTrigger>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </CardHeader>

              {analysis && !analysis.error && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {analysis.preview && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                          <div className="p-3 bg-muted rounded-md">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                              {analysis.preview}
                            </pre>
                          </div>
                        </div>
                      )}

                      {analysis.insights && analysis.insights.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                          <div className="space-y-2">
                            {analysis.insights.map((insight, index) => (
                              <div key={index} className="p-3 bg-primary/5 border-l-2 border-primary rounded-r-md">
                                <p className="text-sm text-foreground">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {analysis?.error && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{analysis.error}</span>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};