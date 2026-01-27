import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { enhancedFileAnalysisService } from '@/services/enhancedFileAnalysis';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, Image, File, X, Upload, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadHandlerProps {
  onFileAnalyzed: (analysis: {
    fileName: string;
    fileType: string;
    summary: string;
    insights: string[];
  }) => void;
  onCancel: () => void;
  isVisible: boolean;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  progress: number;
  fileName?: string;
  error?: string;
}

export const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  onFileAnalyzed,
  onCancel,
  isVisible
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle', progress: 0 });
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/pdf',
    'application/json',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('word')) return FileText;
    return File;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.some(type => file.type.includes(type.split('/')[1]) || file.type === type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a text, PDF, image, or document file",
        variant: "destructive"
      });
      return;
    }

    setUploadState({ status: 'uploading', progress: 0, fileName: file.name });

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 40)
        }));
      }, 100);

      // Get current user for storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to Supabase Storage
      const filePath = `${user.id}/chat-attachments/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) {
        // If bucket doesn't exist, proceed with analysis only
        console.warn('Storage upload skipped:', uploadError.message);
      }

      setUploadState({ status: 'analyzing', progress: 50, fileName: file.name });

      // Analyze file
      const analysis = await enhancedFileAnalysisService.analyzeFile(file, 'standard');

      setUploadState({ status: 'analyzing', progress: 80, fileName: file.name });

      // Complete
      setUploadState({ status: 'complete', progress: 100, fileName: file.name });

      // Prepare summary for chat
      const summary = analysis.contentPreview 
        ? analysis.contentPreview.substring(0, 200) + '...'
        : `Analyzed ${file.name}`;

      setTimeout(() => {
        onFileAnalyzed({
          fileName: file.name,
          fileType: file.type,
          summary,
          insights: analysis.insights
        });
        setUploadState({ status: 'idle', progress: 0 });
      }, 500);

    } catch (error: any) {
      console.error('File upload error:', error);
      setUploadState({ 
        status: 'error', 
        progress: 0, 
        fileName: file.name,
        error: error.message || 'Upload failed'
      });
      toast({
        title: "Upload failed",
        description: error.message || "Failed to process file",
        variant: "destructive"
      });
    }
  }, [toast, onFileAnalyzed]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const FileIcon = uploadState.fileName 
    ? getFileIcon(uploadState.fileName.split('.').pop() || '') 
    : Upload;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-card border border-border/50 rounded-xl shadow-lg z-50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Upload File</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 w-6 p-0 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={uploadState.status === 'idle' ? triggerFileSelect : undefined}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
              uploadState.status !== 'idle' && "cursor-default"
            )}
          >
            {uploadState.status === 'idle' ? (
              <>
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  PDF, DOC, TXT, images up to 10MB
                </p>
              </>
            ) : uploadState.status === 'error' ? (
              <>
                <X className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="text-sm text-destructive">{uploadState.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileSelect}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {uploadState.status === 'complete' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  )}
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-foreground font-medium truncate max-w-[200px] mx-auto">
                  {uploadState.fileName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadState.status === 'uploading' && 'Uploading...'}
                  {uploadState.status === 'analyzing' && 'Analyzing content...'}
                  {uploadState.status === 'complete' && 'Complete!'}
                </p>
                <Progress value={uploadState.progress} className="mt-2 h-1" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
