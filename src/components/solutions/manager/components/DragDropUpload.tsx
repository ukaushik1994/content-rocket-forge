import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  currentPreview?: string | null;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  currentPreview,
  onRemove,
  accept = "image/*",
  maxSize = 5,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (accept === "image/*" && !file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  }, [accept, maxSize]);

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Process the file
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(100);
      onFileSelect(file);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setError('Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }

    clearInterval(interval);
  }, [onFileSelect, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  if (currentPreview && !isUploading) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative aspect-square w-24 h-24 rounded-xl border border-border overflow-hidden">
          <img 
            src={currentPreview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="absolute -top-1 -right-1">
          <CheckCircle className="h-5 w-5 text-success bg-background rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      
      <label
        htmlFor="file-upload"
        className={cn(
          "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-border/60 hover:bg-muted/30",
          isUploading && "pointer-events-none",
          error && "border-destructive bg-destructive/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-2">
          {isUploading ? (
            <>
              <Upload className="h-6 w-6 text-primary animate-pulse" />
              <div className="w-24">
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-xs text-destructive text-center">{error}</p>
              <p className="text-xs text-muted-foreground">Click to try again</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <p className="text-xs text-center">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to {maxSize}MB
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
};